import { describe, it, expect } from 'vitest';
import type { GroupFixture, GroupId, MatchResult } from '@/lib/types';
import { computeGroupStandings } from './standings';
import { computeClinchStatuses } from './qualification';
import { GROUP_SCHEDULE } from './groupSchedule';

function fixtureResult(
  groupId: GroupId,
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

// Build results for GROUP_SCHEDULE fixtures via a per-fixture scorer.
// Returning null omits the fixture (leaves it unplayed).
function buildMatches(
  score: (f: GroupFixture) => { h: number; a: number; status?: MatchResult['status'] } | null,
): MatchResult[] {
  const out: MatchResult[] = [];
  for (const f of GROUP_SCHEDULE) {
    const s = score(f);
    if (!s) continue;
    out.push(fixtureResult(f.groupId, f.home, f.away, s.h, s.a, s.status ?? 'final'));
  }
  return out;
}

function statuses(matches: MatchResult[]) {
  return computeClinchStatuses(computeGroupStandings(matches), matches);
}

describe('computeClinchStatuses', () => {
  it('reports everyone as none when no matches have a final result', () => {
    const m = statuses([]);
    expect(m.size).toBe(48);
    expect([...m.values()].every((v) => v === 'none')).toBe(true);
  });

  it('marks a clinched group winner as through (top-2 route)', () => {
    // Mexico beats South Africa and South Korea (6 pts). The rest draw, so the best
    // any other team can reach is 5 — Mexico is locked into the top 2.
    const matches: MatchResult[] = [
      fixtureResult('A', 'Mexico', 'South Africa', 3, 0),
      fixtureResult('A', 'South Korea', 'Czechia', 0, 0),
      fixtureResult('A', 'Mexico', 'South Korea', 3, 0),
      fixtureResult('A', 'Czechia', 'South Africa', 0, 0),
    ];
    const m = statuses(matches);
    expect(m.get('A|Mexico')).toBe('through');
    expect(m.get('A|South Africa')).not.toBe('through');
  });

  it('leaves an undecided team as none', () => {
    const m = statuses([fixtureResult('A', 'Mexico', 'South Africa', 1, 0)]);
    expect(m.get('A|Mexico')).toBe('none');
  });

  it('treats an in-progress result as undecided (no premature through)', () => {
    // Identical to the clinched-winner case, except Mexico's second win is still in
    // progress — so Mexico only has 3 final points and must not be reported through.
    const matches: MatchResult[] = [
      fixtureResult('A', 'Mexico', 'South Africa', 3, 0),
      fixtureResult('A', 'South Korea', 'Czechia', 0, 0),
      fixtureResult('A', 'Mexico', 'South Korea', 3, 0, 'in-progress'),
      fixtureResult('A', 'Czechia', 'South Africa', 0, 0),
    ];
    const m = statuses(matches);
    expect(m.get('A|Mexico')).toBe('none');
  });

  it('resolves exactly once the group stage is complete (32 through, 16 out)', () => {
    const matches = buildMatches(() => ({ h: 1, a: 0 }));
    const m = statuses(matches);
    const vals = [...m.values()];
    expect(vals.filter((v) => v === 'through').length).toBe(32);
    expect(vals.filter((v) => v === 'out').length).toBe(16);
    expect(vals.filter((v) => v === 'none').length).toBe(0);
  });

  it('handles best-third clinch and cross-group elimination while a group is unfinished', () => {
    // Group A: a 3-way cycle (Mexico/South Korea/Czechia each 6 pts, South Africa 0)
    //   → a very strong 3rd place that is guaranteed a best-third spot.
    // Group I: France 9, Senegal 6, Norway 3, Iraq 0 → Norway is a weak, locked 3rd.
    // Groups B–H, J, K: all 0-0 → thirds on 3 pts, 0 GD.
    // Group L: omitted → the overall group stage is incomplete (bounded path runs).
    const aWinner: Record<string, 'home' | 'away'> = {
      'Mexico|South Africa': 'home',
      'South Korea|Czechia': 'home',
      'Czechia|South Africa': 'home',
      'Mexico|South Korea': 'home',
      'Czechia|Mexico': 'home',
      'South Africa|South Korea': 'away',
    };
    const iWinner: Record<string, 'home' | 'away'> = {
      'France|Senegal': 'home',
      'Iraq|Norway': 'away',
      'France|Iraq': 'home',
      'Norway|Senegal': 'away',
      'Norway|France': 'away',
      'Senegal|Iraq': 'home',
    };

    const matches = buildMatches((f) => {
      if (f.groupId === 'L') return null;
      if (f.groupId === 'A') {
        return aWinner[`${f.home}|${f.away}`] === 'home' ? { h: 1, a: 0 } : { h: 0, a: 1 };
      }
      if (f.groupId === 'I') {
        return iWinner[`${f.home}|${f.away}`] === 'home' ? { h: 1, a: 0 } : { h: 0, a: 1 };
      }
      return { h: 0, a: 0 };
    });

    const standings = computeGroupStandings(matches);
    const m = computeClinchStatuses(standings, matches);

    const groupA = standings.find((g) => g.groupId === 'A')!;
    expect(groupA.rows[3].team).toBe('South Africa');
    // Strong 3rd place is clinched as a best third even though its bracket slot is unknown.
    expect(m.get(`A|${groupA.rows[2].team}`)).toBe('through');
    // Top two of Group A are clinched via the top-2 route.
    expect(m.get(`A|${groupA.rows[0].team}`)).toBe('through');
    expect(m.get(`A|${groupA.rows[1].team}`)).toBe('through');
    // South Africa is locked into 4th → eliminated.
    expect(m.get('A|South Africa')).toBe('out');

    // Group I: winner through; Norway eliminated via the best-thirds race; Iraq (4th) out.
    expect(m.get('I|France')).toBe('through');
    expect(m.get('I|Norway')).toBe('out');
    expect(m.get('I|Iraq')).toBe('out');
  });
});
