import type { GroupId, GroupStandings, MatchResult } from '@/lib/types';
import type { GroupFixture } from '@/lib/types';
import { computeGroupStandings } from './standings';
import { GROUP_SCHEDULE } from './groupSchedule';

export function isGroupStageComplete(matches: MatchResult[]): boolean {
  const finalSet = new Set(
    matches
      .filter((m) => m.status === 'final')
      .map((m) => `${m.groupId}|${m.homeTeam}|${m.awayTeam}`),
  );

  for (const fixture of GROUP_SCHEDULE) {
    const key1 = `${fixture.groupId}|${fixture.home}|${fixture.away}`;
    const key2 = `${fixture.groupId}|${fixture.away}|${fixture.home}`;
    if (!finalSet.has(key1) && !finalSet.has(key2)) return false;
  }

  return true;
}

// Synthesize a MatchResult for a W/D/L outcome of a fixture.
function syntheticResult(
  fixture: GroupFixture,
  outcome: 'home' | 'draw' | 'away',
): MatchResult {
  const homeScore = outcome === 'home' ? 1 : outcome === 'draw' ? 0 : 0;
  const awayScore = outcome === 'away' ? 1 : outcome === 'draw' ? 0 : 0;
  return {
    id: `synthetic-${fixture.groupId}-${fixture.home}-${fixture.away}`,
    homeTeam: fixture.home,
    awayTeam: fixture.away,
    homeScore,
    awayScore,
    status: 'final',
    groupId: fixture.groupId,
    kickoff: fixture.isoDate + 'T00:00:00Z',
    homeCards: { yellows: 0, reds: 0, secondYellows: 0 },
    awayCards: { yellows: 0, reds: 0, secondYellows: 0 },
  };
}

// Every reachable final standings table for a group: one GroupStandings per
// combination of W/D/L outcomes for the group's remaining (non-final) fixtures.
// Standings are rebuilt from finals-only + synthetic outcomes, so in-progress
// matches are treated as undecided rather than folded in as provisional results.
export function enumerateGroupOutcomes(
  groupId: GroupId,
  matches: MatchResult[],
): GroupStandings[] {
  // Knockout matches carry a null groupId; `m.groupId === groupId` excludes them.
  const finals = matches.filter((m) => m.groupId !== null && m.groupId === groupId && m.status === 'final');

  const remaining = GROUP_SCHEDULE.filter((f) => {
    if (f.groupId !== groupId) return false;
    return !finals.some(
      (m) =>
        (m.homeTeam === f.home && m.awayTeam === f.away) ||
        (m.homeTeam === f.away && m.awayTeam === f.home),
    );
  });

  const outcomes: Array<'home' | 'draw' | 'away'> = ['home', 'draw', 'away'];

  // Build all combinations of outcomes for remaining fixtures (3^k, k small)
  const count = remaining.length;
  const total = Math.pow(3, count);

  const tables: GroupStandings[] = [];
  for (let i = 0; i < total; i++) {
    const synthetic: MatchResult[] = [];
    let n = i;
    for (let k = 0; k < count; k++) {
      const outcome = outcomes[n % 3];
      synthetic.push(syntheticResult(remaining[k], outcome));
      n = Math.floor(n / 3);
    }

    const combined = [...finals, ...synthetic];
    const standings = computeGroupStandings(combined).find((g) => g.groupId === groupId);
    if (standings) tables.push(standings);
  }

  return tables;
}

// Returns a Map<1|2, teamName> for positions that are mathematically locked.
// A position is locked iff the same team occupies it across every possible outcome
// of the group's remaining (non-final) fixtures.
export function lockedGroupPositions(
  groupId: GroupId,
  matches: MatchResult[],
): Map<number, string> {
  const tables = enumerateGroupOutcomes(groupId, matches);
  const total = tables.length;

  // position → team → how many combinations have that team in that position
  const positionTeamCounts: Map<number, Map<string, number>> = new Map([
    [1, new Map()],
    [2, new Map()],
  ]);

  for (const standings of tables) {
    for (const pos of [1, 2] as const) {
      const row = standings.rows[pos - 1];
      if (!row || row.tiedPendingRanking) continue;
      const map = positionTeamCounts.get(pos)!;
      map.set(row.team, (map.get(row.team) ?? 0) + 1);
    }
  }

  const locked = new Map<number, string>();
  for (const pos of [1, 2] as const) {
    const map = positionTeamCounts.get(pos)!;
    for (const [team, count2] of map) {
      if (count2 === total && total > 0) {
        locked.set(pos, team);
        break;
      }
    }
  }

  return locked;
}
