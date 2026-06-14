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
