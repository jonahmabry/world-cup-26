import type { ClinchStatus, GroupId, GroupStandings, MatchResult, StandingRow } from '@/lib/types';
import { GROUP_IDS } from '@/lib/types';
import { enumerateGroupOutcomes, isGroupStageComplete } from './clinch';
import { rankThirds } from './thirds';

// Cross-group third comparison uses only (pts, gd, gf): synthetic outcomes carry
// zero cards, so fair-play (and the FIFA-rank tiebreak built on it) is optimistic
// and unsafe as a clinch lever. See openspec design.md (correctness rule 1).
type Triple = { pts: number; gd: number; gf: number };

// a is strictly better-ranked than b.
function strictlyAbove(a: Triple, b: Triple): boolean {
  if (a.pts !== b.pts) return a.pts > b.pts;
  if (a.gd !== b.gd) return a.gd > b.gd;
  return a.gf > b.gf;
}
// a is not strictly below b (ties count as "at or above").
function atOrAbove(a: Triple, b: Triple): boolean {
  return !strictlyAbove(b, a);
}
function toTriple(r: StandingRow): Triple {
  return { pts: r.pts, gd: r.gd, gf: r.gf };
}
function better(a: Triple, b: Triple): Triple {
  return strictlyAbove(a, b) ? a : b;
}
function worse(a: Triple, b: Triple): Triple {
  return strictlyAbove(a, b) ? b : a;
}

interface TeamAgg {
  minPos: number;
  maxPos: number;
  top2Tie: boolean; // finished 2nd while tiedPendingRanking in some outcome
  pos3Tie: boolean; // finished 3rd while tiedPendingRanking in some outcome
  canBeThird: boolean;
  thirdWorst: Triple | null; // worst-ranked 3rd-place triple over outcomes where it is 3rd
  thirdBest: Triple | null; // best-ranked 3rd-place triple over those outcomes
}

interface GroupAgg {
  teams: Map<string, TeamAgg>;
  groupThirdBest: Triple | null; // best possible 3rd-place triple in this group
  groupThirdWorst: Triple | null; // worst possible 3rd-place triple in this group
}

function analyzeGroup(groupId: GroupId, matches: MatchResult[]): GroupAgg {
  const tables = enumerateGroupOutcomes(groupId, matches);
  const teams = new Map<string, TeamAgg>();
  let groupThirdBest: Triple | null = null;
  let groupThirdWorst: Triple | null = null;

  for (const standings of tables) {
    const thirdRow = standings.rows[2];
    if (thirdRow) {
      const t = toTriple(thirdRow);
      groupThirdBest = groupThirdBest ? better(groupThirdBest, t) : t;
      groupThirdWorst = groupThirdWorst ? worse(groupThirdWorst, t) : t;
    }

    standings.rows.forEach((row, idx) => {
      const pos = idx + 1;
      let agg = teams.get(row.team);
      if (!agg) {
        agg = {
          minPos: pos,
          maxPos: pos,
          top2Tie: false,
          pos3Tie: false,
          canBeThird: false,
          thirdWorst: null,
          thirdBest: null,
        };
        teams.set(row.team, agg);
      }
      agg.minPos = Math.min(agg.minPos, pos);
      agg.maxPos = Math.max(agg.maxPos, pos);
      if (pos === 2 && row.tiedPendingRanking) agg.top2Tie = true;
      if (pos === 3) {
        agg.canBeThird = true;
        if (row.tiedPendingRanking) agg.pos3Tie = true;
        const t = toTriple(row);
        agg.thirdWorst = agg.thirdWorst ? worse(agg.thirdWorst, t) : t;
        agg.thirdBest = agg.thirdBest ? better(agg.thirdBest, t) : t;
      }
    });
  }

  return { teams, groupThirdBest, groupThirdWorst };
}

function classify(groupId: GroupId, ta: TeamAgg, aggs: Map<GroupId, GroupAgg>): ClinchStatus {
  // Clinched top-2 (and not at a tie the ranking could not separate).
  if (ta.maxPos <= 2 && !ta.top2Tie) return 'through';

  // Clinched a best-third spot: guaranteed top-3, and even at its worst 3rd-place
  // record at most 7 other groups could field a higher-ranked third.
  const guaranteedTop3 = ta.maxPos <= 3 && !ta.pos3Tie;
  if (guaranteedTop3 && ta.canBeThird && ta.thirdWorst) {
    let couldBeAbove = 0;
    for (const [otherId, other] of aggs) {
      if (otherId === groupId) continue;
      if (other.groupThirdBest && atOrAbove(other.groupThirdBest, ta.thirdWorst)) couldBeAbove++;
    }
    if (couldBeAbove <= 7) return 'through';
  }

  // Eliminated: can never reach top-2, and cannot make the best-8 thirds even at
  // its best — either it can only finish 4th, or 8+ groups are guaranteed a higher third.
  const neverTop2 = ta.minPos >= 3 && !ta.pos3Tie;
  if (neverTop2) {
    if (!ta.canBeThird) return 'out';
    if (ta.thirdBest) {
      let guaranteedAbove = 0;
      for (const [otherId, other] of aggs) {
        if (otherId === groupId) continue;
        if (other.groupThirdWorst && strictlyAbove(other.groupThirdWorst, ta.thirdBest)) guaranteedAbove++;
      }
      if (guaranteedAbove >= 8) return 'out';
    }
  }

  return 'none';
}

// Per-team clinch status keyed by `${groupId}|${team}`.
export function computeClinchStatuses(
  groupStandings: GroupStandings[],
  matches: MatchResult[],
): Map<string, ClinchStatus> {
  const result = new Map<string, ClinchStatus>();
  const key = (groupId: GroupId, team: string) => `${groupId}|${team}`;

  // No finals yet → nothing decided.
  if (!matches.some((m) => m.status === 'final')) {
    for (const g of groupStandings) for (const r of g.rows) result.set(key(g.groupId, r.team), 'none');
    return result;
  }

  // Group stage complete → resolve exactly (full tiebreakers via rankThirds).
  if (isGroupStageComplete(matches)) {
    const advancing = new Set(rankThirds(groupStandings).advancingGroupIds);
    for (const g of groupStandings) {
      g.rows.forEach((r, idx) => {
        const pos = idx + 1;
        const through = pos <= 2 || (pos === 3 && advancing.has(g.groupId));
        result.set(key(g.groupId, r.team), through ? 'through' : 'out');
      });
    }
    return result;
  }

  // In-progress → conservative bounded clinch.
  const aggs = new Map<GroupId, GroupAgg>();
  for (const groupId of GROUP_IDS) aggs.set(groupId, analyzeGroup(groupId, matches));

  for (const groupId of GROUP_IDS) {
    const agg = aggs.get(groupId)!;
    for (const [team, ta] of agg.teams) {
      result.set(key(groupId, team), classify(groupId, ta, aggs));
    }
  }

  return result;
}
