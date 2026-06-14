import { describe, it, expect } from 'vitest';
import type { MatchResult } from '@/lib/types';
import { computeGroupStandings } from './standings';

// Group A: Mexico, South Korea, South Africa, Czechia
function makeMatch(
  id: string,
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
  status: MatchResult['status'] = 'final',
): MatchResult {
  return {
    id,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    status,
    groupId: 'A',
    kickoff: '2026-06-11T20:00:00Z',
    homeCards: { yellows: 0, reds: 0, secondYellows: 0 },
    awayCards: { yellows: 0, reds: 0, secondYellows: 0 },
  };
}

describe('tiebreaker Step 1 – head-to-head', () => {
  it('H2H points break a 2-way points tie', () => {
    // Mexico 2-1 SK (H2H win), Mexico 0-0 SA, SK 1-0 SA, SK 0-0 CZ → both 4pts
    // H2H: Mexico beat SK → Mexico 1st, SK 2nd
    const matches = [
      makeMatch('m1', 'Mexico', 'South Korea', 2, 1),
      makeMatch('m2', 'Mexico', 'South Africa', 0, 0),
      makeMatch('m3', 'South Korea', 'South Africa', 1, 0),
      makeMatch('m4', 'South Korea', 'Czechia', 0, 0),
    ];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;
    expect(groupA.rows[0].team).toBe('Mexico');
    expect(groupA.rows[0].pts).toBe(4);
    expect(groupA.rows[1].team).toBe('South Korea');
    expect(groupA.rows[1].pts).toBe(4);
  });

  it('H2H GD breaks a 3-way tie when H2H points are all equal', () => {
    // Rock-paper-scissors: Mexico 2-1 SK, SA 1-0 Mexico, SK 2-0 SA → all 3pts overall
    // H2H pts: all 3 each; H2H GD: SK +1, Mexico 0, SA -1 → SK 1st, Mexico 2nd, SA 3rd
    const matches = [
      makeMatch('m1', 'Mexico', 'South Korea', 2, 1),
      makeMatch('m2', 'South Africa', 'Mexico', 1, 0),
      makeMatch('m3', 'South Korea', 'South Africa', 2, 0),
    ];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;
    const top3 = groupA.rows.slice(0, 3).map((r) => r.team);
    expect(top3[0]).toBe('South Korea');
    expect(top3[1]).toBe('Mexico');
    expect(top3[2]).toBe('South Africa');
    expect(groupA.rows[3].team).toBe('Czechia');
  });
});

describe('tiebreaker Step 2 – overall stats and tiedPendingRanking', () => {
  it('Step 2 GD: when H2H yields no progress, team with better overall GD ranks higher', () => {
    // Mexico and SK drew H2H (1-1) → equal H2H stats → Step 2
    // Mexico overall GD: (3-0)+(1-1)=+3; SK overall GD: (1-0)+(1-1)=+1
    const matches = [
      makeMatch('m1', 'Mexico', 'South Korea', 1, 1),
      makeMatch('m2', 'Mexico', 'South Africa', 3, 0),
      makeMatch('m3', 'South Korea', 'South Africa', 1, 0),
    ];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;
    expect(groupA.rows[0].team).toBe('Mexico');
    expect(groupA.rows[0].pts).toBe(4);
    expect(groupA.rows[1].team).toBe('South Korea');
  });

  it('Step 2 GS: teams equal on pts and GD are ranked by goals scored', () => {
    // Mexico 0-0 SK (draw), Mexico 2-1 SA (GD+1, GF=2), SK 3-2 SA (GD+1, GF=3)
    // Both 4pts; equal H2H (0-0 draw); equal GD (+1); SK GF=3 > Mexico GF=2 → SK 1st
    const matches = [
      makeMatch('m1', 'Mexico', 'South Korea', 0, 0),
      makeMatch('m2', 'Mexico', 'South Africa', 2, 1),
      makeMatch('m3', 'South Korea', 'South Africa', 3, 2),
    ];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;
    expect(groupA.rows[0].team).toBe('South Korea');
    expect(groupA.rows[1].team).toBe('Mexico');
  });

  it('tiedPendingRanking: teams equal through all criteria are flagged', () => {
    // Mexico 0-0 SK (both 1pt), SA 1-0 CZ (SA 3pts — breaks the bottom-pair tie)
    // Mexico and SK are still equal through all criteria → both flagged; SA is not
    const matches = [
      makeMatch('m1', 'Mexico', 'South Korea', 0, 0),
      makeMatch('m2', 'South Africa', 'Czechia', 1, 0),
    ];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;
    const mexico = groupA.rows.find((r) => r.team === 'Mexico')!;
    const sk = groupA.rows.find((r) => r.team === 'South Korea')!;
    expect(mexico.tiedPendingRanking).toBe(true);
    expect(sk.tiedPendingRanking).toBe(true);
    expect(groupA.rows.find((r) => r.team === 'South Africa')!.tiedPendingRanking).toBe(false);
  });

  it('fair-play: team with fewer cards ranks above equal-stats opponent', () => {
    // Mexico and SK draw 1-1; SK gets a yellow card → Mexico has better fair-play
    const matches: MatchResult[] = [
      {
        ...makeMatch('m1', 'Mexico', 'South Korea', 1, 1),
        awayCards: { yellows: 1, reds: 0, secondYellows: 0 },
      },
    ];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;
    expect(groupA.rows[0].team).toBe('Mexico');
    expect(groupA.rows[1].team).toBe('South Korea');
    expect(groupA.rows[0].tiedPendingRanking).toBe(false);
    expect(groupA.rows[1].tiedPendingRanking).toBe(false);
  });
});

describe('provisional standings', () => {
  it('an in-progress match contributes W/D/L, GF/GA/GD, points, and matches-played', () => {
    const matches = [
      makeMatch('m1', 'Mexico', 'South Korea', 1, 0, 'in-progress'),
    ];
    const standings = computeGroupStandings(matches);
    const groupA = standings.find((g) => g.groupId === 'A')!;
    const mexico = groupA.rows.find((r) => r.team === 'Mexico')!;
    const southKorea = groupA.rows.find((r) => r.team === 'South Korea')!;

    expect(mexico.mp).toBe(1);
    expect(mexico.w).toBe(1);
    expect(mexico.pts).toBe(3);
    expect(mexico.gf).toBe(1);
    expect(mexico.ga).toBe(0);
    expect(mexico.gd).toBe(1);

    expect(southKorea.mp).toBe(1);
    expect(southKorea.l).toBe(1);
    expect(southKorea.pts).toBe(0);
    expect(southKorea.gf).toBe(0);
    expect(southKorea.ga).toBe(1);
  });

  it('rows from an in-progress match get provisional: true', () => {
    const matches = [makeMatch('m1', 'Mexico', 'South Korea', 1, 0, 'in-progress')];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;

    const mexico = groupA.rows.find((r) => r.team === 'Mexico')!;
    const southKorea = groupA.rows.find((r) => r.team === 'South Korea')!;
    const southAfrica = groupA.rows.find((r) => r.team === 'South Africa')!;

    expect(mexico.provisional).toBe(true);
    expect(southKorea.provisional).toBe(true);
    expect(southAfrica.provisional).toBe(false); // not involved in any in-progress match
  });

  it('provisional: false when every contributing match is final', () => {
    const matches = [makeMatch('m1', 'Mexico', 'South Korea', 2, 1, 'final')];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;
    const mexico = groupA.rows.find((r) => r.team === 'Mexico')!;

    expect(mexico.provisional).toBe(false);
  });

  it('scheduled matches are excluded from accumulation', () => {
    const matches = [makeMatch('m1', 'Mexico', 'South Korea', 0, 0, 'scheduled')];
    const groupA = computeGroupStandings(matches).find((g) => g.groupId === 'A')!;
    const mexico = groupA.rows.find((r) => r.team === 'Mexico')!;

    expect(mexico.mp).toBe(0);
    expect(mexico.pts).toBe(0);
    expect(mexico.provisional).toBe(false);
  });

  it('provisional row settles (provisional: false) once the match becomes final', () => {
    const inProgress = [makeMatch('m1', 'Mexico', 'South Korea', 1, 0, 'in-progress')];
    const final = [makeMatch('m1', 'Mexico', 'South Korea', 1, 0, 'final')];

    const duringMatch = computeGroupStandings(inProgress).find((g) => g.groupId === 'A')!;
    const afterMatch = computeGroupStandings(final).find((g) => g.groupId === 'A')!;

    expect(duringMatch.rows.find((r) => r.team === 'Mexico')!.provisional).toBe(true);
    expect(afterMatch.rows.find((r) => r.team === 'Mexico')!.provisional).toBe(false);
  });
});
