// FIFA 2026 group-stage tiebreaker sequence (FIFA 2026 Competition Regulations):
//
// Step 1 — applied as a mini-league using only matches between the tied teams:
//   a. Greatest number of points obtained in those matches
//   b. Superior goal difference from those matches
//   c. Greatest number of goals scored in those matches
//
//   For 3+ tied teams, all H2H matches among those teams are aggregated into a
//   sub-table. If Step 1 partially separates the group, the remaining tied
//   sub-groups are re-entered into Step 1 (not Step 2) until no further
//   progress is possible, then those sub-groups move to Step 2.
//
// Step 2 — applied if Step 1 yields no decision, using all group matches:
//   a. Superior goal difference in all group matches
//   b. Greatest number of goals scored in all group matches
//   c. Highest team conduct score (yellow=-1, red=-3, second-yellow=-3; higher is better)
//
// Step 3 — if Steps 1 and 2 yield no decision:
//   FIFA/Coca-Cola Men's World Ranking → emits tiedPendingRanking=true
//   (https://inside.fifa.com/fifa-world-ranking/men)
//
// Note: The 2026 regulations replaced the previous "drawing of lots" with FIFA World Ranking.

import type { GroupId, GroupStandings, MatchResult, StandingRow } from '@/lib/types';
import { fairPlayScore, GROUP_IDS } from '@/lib/types';
import { GROUPS } from './groups';

interface TeamStats {
  team: string;
  groupId: GroupId;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
  yellows: number;
  reds: number;
  secondYellows: number;
}

function emptyStats(team: string, groupId: GroupId): TeamStats {
  return { team, groupId, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, yellows: 0, reds: 0, secondYellows: 0 };
}

function accumulateMatch(stats: TeamStats, gf: number, ga: number, yellows: number, reds: number, secondYellows: number) {
  stats.mp++;
  stats.gf += gf;
  stats.ga += ga;
  stats.yellows += yellows;
  stats.reds += reds;
  stats.secondYellows += secondYellows;
  if (gf > ga) { stats.w++; stats.pts += 3; }
  else if (gf === ga) { stats.d++; stats.pts += 1; }
  else stats.l++;
}

interface H2HStats { pts: number; gd: number; gs: number; }

// Builds a H2H mini-league sub-table for a set of teams from their mutual matches.
function computeH2HMiniLeague(teams: TeamStats[], groupMatches: MatchResult[]): Map<string, H2HStats> {
  const teamSet = new Set(teams.map((t) => t.team));
  const h2h = new Map<string, H2HStats>(teams.map((t) => [t.team, { pts: 0, gd: 0, gs: 0 }]));
  for (const m of groupMatches) {
    if (!teamSet.has(m.homeTeam) || !teamSet.has(m.awayTeam)) continue;
    const home = h2h.get(m.homeTeam)!;
    const away = h2h.get(m.awayTeam)!;
    home.gs += m.homeScore;
    home.gd += m.homeScore - m.awayScore;
    away.gs += m.awayScore;
    away.gd += m.awayScore - m.homeScore;
    if (m.homeScore > m.awayScore) { home.pts += 3; }
    else if (m.homeScore === m.awayScore) { home.pts++; away.pts++; }
    else { away.pts += 3; }
  }
  return h2h;
}

// Step 2: overall GD → GS → fair-play. Marks still-tied teams as tiedPendingRanking.
function applyOverall(teams: TeamStats[], pending: Set<string>): TeamStats[] {
  const sorted = [...teams].sort((a, b) => {
    const aGD = a.gf - a.ga, bGD = b.gf - b.ga;
    if (aGD !== bGD) return bGD - aGD;
    if (a.gf !== b.gf) return b.gf - a.gf;
    const aFP = fairPlayScore({ yellows: a.yellows, reds: a.reds, secondYellows: a.secondYellows });
    const bFP = fairPlayScore({ yellows: b.yellows, reds: b.reds, secondYellows: b.secondYellows });
    if (aFP !== bFP) return bFP - aFP;
    return 0;
  });

  // Mark any sub-groups still tied through all Step 2 criteria
  let i = 0;
  while (i < sorted.length) {
    const ai = sorted[i];
    const aGD = ai.gf - ai.ga;
    const aFP = fairPlayScore({ yellows: ai.yellows, reds: ai.reds, secondYellows: ai.secondYellows });
    let j = i + 1;
    while (j < sorted.length) {
      const aj = sorted[j];
      if (aj.gf - aj.ga === aGD && aj.gf === ai.gf &&
          fairPlayScore({ yellows: aj.yellows, reds: aj.reds, secondYellows: aj.secondYellows }) === aFP) j++;
      else break;
    }
    if (j - i > 1) {
      for (let k = i; k < j; k++) pending.add(sorted[k].team);
    }
    i = j;
  }

  return sorted;
}

// Step 1: H2H mini-league for a tied-on-points group.
// Recurses on partially-tied sub-groups; falls back to applyOverall when no H2H progress.
function applyH2H(teams: TeamStats[], groupMatches: MatchResult[], pending: Set<string>): TeamStats[] {
  if (teams.length <= 1) return teams;

  const h2h = computeH2HMiniLeague(teams, groupMatches);
  const sorted = [...teams].sort((a, b) => {
    const ah = h2h.get(a.team)!, bh = h2h.get(b.team)!;
    if (ah.pts !== bh.pts) return bh.pts - ah.pts;
    if (ah.gd !== bh.gd) return bh.gd - ah.gd;
    if (ah.gs !== bh.gs) return bh.gs - ah.gs;
    return 0;
  });

  const result: TeamStats[] = [];
  let i = 0;
  while (i < sorted.length) {
    const ih = h2h.get(sorted[i].team)!;
    let j = i + 1;
    while (j < sorted.length) {
      const jh = h2h.get(sorted[j].team)!;
      if (ih.pts === jh.pts && ih.gd === jh.gd && ih.gs === jh.gs) j++;
      else break;
    }
    if (j - i === 1) {
      result.push(sorted[i]);
    } else if (j - i === teams.length) {
      // H2H made zero progress for the whole group → Step 2
      result.push(...applyOverall(sorted.slice(i, j), pending));
    } else {
      // H2H separated some but not all → re-apply Step 1 on the remaining tied sub-group
      result.push(...applyH2H(sorted.slice(i, j), groupMatches, pending));
    }
    i = j;
  }

  return result;
}

export function computeGroupStandings(allMatches: MatchResult[]): GroupStandings[] {
  return GROUP_IDS.map((groupId) => {
    const teamsInGroup = GROUPS[groupId];
    const statsMap = new Map<string, TeamStats>(
      teamsInGroup.map((t) => [t, emptyStats(t, groupId)]),
    );

    const groupMatches = allMatches.filter(
      (m) => m.groupId === groupId && m.status === 'final',
    );

    for (const m of groupMatches) {
      const home = statsMap.get(m.homeTeam);
      const away = statsMap.get(m.awayTeam);
      if (home) accumulateMatch(home, m.homeScore, m.awayScore, m.homeCards.yellows, m.homeCards.reds, m.homeCards.secondYellows);
      if (away) accumulateMatch(away, m.awayScore, m.homeScore, m.awayCards.yellows, m.awayCards.reds, m.awayCards.secondYellows);
    }

    // Sort by points first, then resolve ties group-by-group
    const byPts = [...statsMap.values()].sort((a, b) => b.pts - a.pts);
    const pending = new Set<string>();
    const finalOrder: TeamStats[] = [];

    let i = 0;
    while (i < byPts.length) {
      let j = i + 1;
      while (j < byPts.length && byPts[j].pts === byPts[i].pts) j++;
      if (j - i === 1) {
        finalOrder.push(byPts[i]);
      } else {
        finalOrder.push(...applyH2H(byPts.slice(i, j), groupMatches, pending));
      }
      i = j;
    }

    const rows: StandingRow[] = finalOrder.map((s, idx) => ({
      team: s.team,
      groupId,
      position: idx + 1,
      mp: s.mp,
      w: s.w,
      d: s.d,
      l: s.l,
      gf: s.gf,
      ga: s.ga,
      gd: s.gf - s.ga,
      pts: s.pts,
      cards: { yellows: s.yellows, reds: s.reds, secondYellows: s.secondYellows },
      fairPlay: fairPlayScore({ yellows: s.yellows, reds: s.reds, secondYellows: s.secondYellows }),
      qualStatus: 'pending' as const,
      tiedPendingRanking: pending.has(s.team),
    }));

    return { groupId, rows };
  });
}
