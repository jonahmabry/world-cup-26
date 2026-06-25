import { describe, it, expect, vi } from 'vitest';

// All 48 real finalists have distinct FIFA ranks, so a within-group
// tiedPendingRanking can never arise from the real schedule. To exercise the
// clinch engine's tie guard we force South Korea and Czechia onto the same rank,
// making a dead-level 2nd/3rd finish unresolvable. The mock must apply file-wide
// (hence its own test file) so it cannot perturb the other qualification tests.
vi.mock('./fifaRanking', () => ({
  UNRANKED: 999,
  fifaRank: (team: string) => {
    if (team === 'South Korea' || team === 'Czechia') return 50; // forced tie
    const ranks: Record<string, number> = { Mexico: 11, 'South Africa': 60 };
    return ranks[team] ?? 999;
  },
}));

import type { GroupId, MatchResult } from '@/lib/types';
import { computeGroupStandings } from './standings';
import { computeClinchStatuses } from './qualification';

function result(groupId: GroupId, home: string, away: string, hs: number, as: number): MatchResult {
  return {
    id: `${groupId}-${home}-${away}`,
    homeTeam: home,
    awayTeam: away,
    homeScore: hs,
    awayScore: as,
    status: 'final',
    groupId,
    kickoff: '2026-06-11T20:00:00Z',
    homeCards: { yellows: 0, reds: 0, secondYellows: 0 },
    awayCards: { yellows: 0, reds: 0, secondYellows: 0 },
  };
}

describe('computeClinchStatuses — tiedPendingRanking boundary', () => {
  it('does not report a clinch when a top-2 finish hinges on an unresolved ranking tie', () => {
    // Only Group A is played (the rest of the tournament is unplayed → bounded path).
    // Mexico wins all three (clear 1st). South Korea and Czechia finish dead level
    // (4 pts, 0 GD, 1 GF) and drew each other, so with an equal FIFA rank the 2nd/3rd
    // split is flagged tiedPendingRanking.
    const matches: MatchResult[] = [
      result('A', 'Mexico', 'South Africa', 1, 0),
      result('A', 'South Korea', 'Czechia', 0, 0),
      result('A', 'Czechia', 'South Africa', 1, 0),
      result('A', 'Mexico', 'South Korea', 1, 0),
      result('A', 'Czechia', 'Mexico', 0, 1),
      result('A', 'South Africa', 'South Korea', 0, 1),
    ];

    const standings = computeGroupStandings(matches);
    // Sanity: the two level teams are genuinely tiedPendingRanking.
    const groupA = standings.find((g) => g.groupId === 'A')!;
    expect(groupA.rows.filter((r) => r.tiedPendingRanking).map((r) => r.team).sort()).toEqual([
      'Czechia',
      'South Korea',
    ]);

    const m = computeClinchStatuses(standings, matches);

    // Mexico is cleanly clinched.
    expect(m.get('A|Mexico')).toBe('through');
    // The unresolved 2nd/3rd tie blocks a clinch for both tied teams — without the
    // guard, whichever held 2nd would be a false 'through'.
    expect(m.get('A|South Korea')).toBe('none');
    expect(m.get('A|Czechia')).toBe('none');
  });
});
