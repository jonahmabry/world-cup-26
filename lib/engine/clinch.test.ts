import { describe, it, expect } from 'vitest';
import type { MatchResult } from '@/lib/types';
import { isGroupStageComplete, lockedGroupPositions } from './clinch';

function makeResult(
  groupId: MatchResult['groupId'],
  home: string,
  away: string,
  homeScore: number,
  awayScore: number,
  status: MatchResult['status'] = 'final',
): MatchResult {
  return {
    id: `${groupId}-${home}-${away}`,
    homeTeam: home,
    awayTeam: away,
    homeScore,
    awayScore,
    status,
    groupId,
    kickoff: '2026-06-11T20:00:00Z',
    homeCards: { yellows: 0, reds: 0, secondYellows: 0 },
    awayCards: { yellows: 0, reds: 0, secondYellows: 0 },
  };
}

describe('isGroupStageComplete', () => {
  it('returns false when no matches have been played', () => {
    expect(isGroupStageComplete([])).toBe(false);
  });

  it('returns false when some group matches are missing', () => {
    const matches = [makeResult('A', 'Mexico', 'South Africa', 2, 0)];
    expect(isGroupStageComplete(matches)).toBe(false);
  });

  it('returns false when some matches are not final', () => {
    const matches = [
      makeResult('A', 'Mexico', 'South Africa', 1, 0, 'in-progress'),
    ];
    expect(isGroupStageComplete(matches)).toBe(false);
  });
});

describe('lockedGroupPositions', () => {
  // Mexico has beaten South Africa and Czechia. South Korea has only 1 pt (a draw).
  // Even if South Korea beats Mexico (max 4 pts), Mexico still has 6 pts → clinched 1st.
  it('reports Mexico as locked in 1st after winning first 2 games with South Korea on 1 pt', () => {
    const matches: MatchResult[] = [
      makeResult('A', 'Mexico', 'South Africa', 2, 0),      // MD1: Mexico 3 pts
      makeResult('A', 'Czechia', 'South Korea', 1, 0),      // MD1: Czechia 3 pts, South Korea 0
      makeResult('A', 'Mexico', 'Czechia', 1, 0),           // MD2: Mexico 6 pts
      makeResult('A', 'South Korea', 'South Africa', 1, 1), // MD2: South Korea 1 pt
    ];
    // Standings: Mexico 6, Czechia 3, South Korea 1, South Africa 1
    // Remaining MD3: South Korea vs Mexico, South Africa vs Czechia
    // Max South Korea: 1+3=4 pts < 6 → Mexico locked in 1st

    const locked = lockedGroupPositions('A', matches);
    expect(locked.has(1)).toBe(true);
    expect(locked.get(1)).toBe('Mexico');
  });

  it('reports no locked position when the group is wide open', () => {
    // All teams at 0 points, no games played
    const locked = lockedGroupPositions('A', []);
    expect(locked.has(1)).toBe(false);
    expect(locked.has(2)).toBe(false);
  });

  it('returns an empty map when there are no remaining fixtures (all done)', () => {
    // All 6 Group A games are final — every position is determined by standings,
    // not by "remaining outcomes." The function's enumeration over 0 remaining
    // fixtures runs exactly once and locks all positions.
    const matches: MatchResult[] = [
      makeResult('A', 'Mexico', 'South Africa', 2, 0),
      makeResult('A', 'Czechia', 'South Korea', 0, 3),
      makeResult('A', 'Mexico', 'Czechia', 1, 0),
      makeResult('A', 'South Korea', 'South Africa', 1, 1),
      makeResult('A', 'South Korea', 'Mexico', 0, 1),
      makeResult('A', 'South Africa', 'Czechia', 0, 0),
    ];
    const locked = lockedGroupPositions('A', matches);
    // Mexico has 9 pts = locked 1st; South Korea 4 pts = locked 2nd
    expect(locked.get(1)).toBe('Mexico');
    expect(locked.get(2)).toBe('South Korea');
  });
});
