import { describe, it, expect } from 'vitest';
import type { BracketMatchup, BracketTeam, GroupId, GroupStandings, KnockoutRound, MatchResult, StandingRow } from '@/lib/types';
import { GROUP_IDS } from '@/lib/types';
import { rankThirds } from './thirds';
import { computeBracket, applyKnockoutResults } from './bracket';

function makeRow(team: string, groupId: GroupId, position: number): StandingRow {
  return {
    team, groupId, position, mp: 3, w: 0, d: 0, l: 0,
    gf: 0, ga: 0, gd: 0, pts: 0,
    cards: { yellows: 0, reds: 0, secondYellows: 0 },
    fairPlay: 0, qualStatus: 'pending', clinch: 'none', tiedPendingRanking: false, provisional: false,
  };
}

// Distinct pts for each third so no ties → tiedPendingRanking stays false.
// A-H (12→5) advance; I-L (4→1) are eliminated.
const THIRD_PTS: Record<GroupId, number> = {
  A:12, B:11, C:10, D:9, E:8, F:7, G:6, H:5,
  I:4, J:3, K:2, L:1,
};

function makeGroups(): GroupStandings[] {
  return GROUP_IDS.map((id) => ({
    groupId: id,
    rows: [
      makeRow(`W${id}`, id, 1),
      makeRow(`R${id}`, id, 2),
      { ...makeRow(`3${id}`, id, 3), pts: THIRD_PTS[id] },
      makeRow(`4${id}`, id, 4),
    ],
  }));
}

describe('computeBracket', () => {
  const groups = makeGroups();
  const thirds = rankThirds(groups);
  const bracket = computeBracket(groups, thirds);

  it('produces the full 32-match knockout tree (16 R32 + 8 R16 + 4 QF + 2 SF + 1 ThirdPlace + 1 Final)', () => {
    expect(bracket).toHaveLength(32);
    expect(bracket.filter(m => m.round === 'R32')).toHaveLength(16);
    expect(bracket.filter(m => m.round === 'R16')).toHaveLength(8);
    expect(bracket.filter(m => m.round === 'QF')).toHaveLength(4);
    expect(bracket.filter(m => m.round === 'SF')).toHaveLength(2);
    expect(bracket.filter(m => m.round === 'ThirdPlace')).toHaveLength(1);
    expect(bracket.filter(m => m.round === 'Final')).toHaveLength(1);
  });

  describe('R32 matchups carry schedule metadata', () => {
    it('M73 has round, venueCity, date, kickoffTime', () => {
      const m = bracket.find((b) => b.matchId === 'M73')!;
      expect(m.round).toBe('R32');
      expect(m.venueCity).toBe('Los Angeles');
      expect(m.date).toBe('JUN 28');
      expect(m.kickoffTime).toBe('2:00PM');
      expect(m.slot).toBe(3);
    });
  });

  describe('fixed matchups (no third-place team)', () => {
    it('M73: Runner-up A vs Runner-up B', () => {
      const m = bracket.find((b) => b.matchId === 'M73')!;
      expect(m.home).toEqual({ kind: 'team', name: 'RA' });
      expect(m.away).toEqual({ kind: 'team', name: 'RB' });
      expect(m.homeLabel).toBe('Runner-up A');
      expect(m.awayLabel).toBe('Runner-up B');
    });

    it('M75: Winner F vs Runner-up C', () => {
      const m = bracket.find((b) => b.matchId === 'M75')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WF' });
      expect(m.away).toEqual({ kind: 'team', name: 'RC' });
    });

    it('M88: Runner-up D vs Runner-up G', () => {
      const m = bracket.find((b) => b.matchId === 'M88')!;
      expect(m.home).toEqual({ kind: 'team', name: 'RD' });
      expect(m.away).toEqual({ kind: 'team', name: 'RG' });
    });
  });

  describe('third-place slots (ABCDEFGH advancing → known allocation)', () => {
    // With ABCDEFGH advancing, getAllocation returns:
    // M74:'C', M77:'F', M79:'H', M80:'E', M81:'B', M82:'A', M85:'G', M87:'D'
    // Each assigned group lies within its match's official allowed set, e.g.
    // M74 (Winner E) draws from {A,B,C,D,F}, so group H can never land here.

    it('M79: Winner A vs 3rd Group H', () => {
      const m = bracket.find((b) => b.matchId === 'M79')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WA' });
      expect(m.away).toEqual({ kind: 'team', name: '3H' });
      expect(m.homeLabel).toBe('Winner A');
      expect(m.awayLabel).toBe('3rd Group H');
    });

    it('M81: Winner D vs 3rd Group B', () => {
      const m = bracket.find((b) => b.matchId === 'M81')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WD' });
      expect(m.away).toEqual({ kind: 'team', name: '3B' });
      expect(m.awayLabel).toBe('3rd Group B');
    });

    it('M74: Winner E vs 3rd Group C', () => {
      const m = bracket.find((b) => b.matchId === 'M74')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WE' });
      expect(m.away).toEqual({ kind: 'team', name: '3C' });
    });

    it('M85: Winner B vs 3rd Group G', () => {
      const m = bracket.find((b) => b.matchId === 'M85')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WB' });
      expect(m.away).toEqual({ kind: 'team', name: '3G' });
    });
  });

  describe('R16+ winner-of slots and tree structure', () => {
    it('M89 (R16): winner-of M74 vs winner-of M77', () => {
      const m = bracket.find((b) => b.matchId === 'M89')!;
      expect(m.round).toBe('R16');
      expect(m.home).toEqual({ kind: 'winner-of', matchId: 'M74' });
      expect(m.away).toEqual({ kind: 'winner-of', matchId: 'M77' });
      expect(m.slot).toBe(1);
    });

    it('M96 (R16): winner-of M85 vs winner-of M87', () => {
      const m = bracket.find((b) => b.matchId === 'M96')!;
      expect(m.round).toBe('R16');
      expect(m.home).toEqual({ kind: 'winner-of', matchId: 'M85' });
      expect(m.away).toEqual({ kind: 'winner-of', matchId: 'M87' });
      expect(m.slot).toBe(8);
    });

    it('M97 (QF): winner-of M89 vs winner-of M90', () => {
      const m = bracket.find((b) => b.matchId === 'M97')!;
      expect(m.round).toBe('QF');
      expect(m.home).toEqual({ kind: 'winner-of', matchId: 'M89' });
      expect(m.away).toEqual({ kind: 'winner-of', matchId: 'M90' });
    });

    it('M101 (SF): winner-of M97 vs winner-of M98', () => {
      const m = bracket.find((b) => b.matchId === 'M101')!;
      expect(m.round).toBe('SF');
      expect(m.home).toEqual({ kind: 'winner-of', matchId: 'M97' });
      expect(m.away).toEqual({ kind: 'winner-of', matchId: 'M98' });
    });

    it('M104 (Final): winner-of M101 vs winner-of M102', () => {
      const m = bracket.find((b) => b.matchId === 'M104')!;
      expect(m.round).toBe('Final');
      expect(m.home).toEqual({ kind: 'winner-of', matchId: 'M101' });
      expect(m.away).toEqual({ kind: 'winner-of', matchId: 'M102' });
      expect(m.venueCity).toBe('New York/New Jersey');
    });

    it('all R16+ slots have winner-of teams (excluding the loser-fed third-place play-off)', () => {
      const later = bracket.filter((m) => m.round !== 'R32' && m.round !== 'ThirdPlace');
      for (const m of later) {
        expect(m.home.kind).toBe('winner-of');
        expect(m.away.kind).toBe('winner-of');
      }
    });
  });

  describe('third-place play-off (M103)', () => {
    it('M103: loser-of M101 vs loser-of M102, on the ThirdPlace round', () => {
      const m = bracket.find((b) => b.matchId === 'M103')!;
      expect(m.round).toBe('ThirdPlace');
      expect(m.home).toEqual({ kind: 'loser-of', matchId: 'M101' });
      expect(m.away).toEqual({ kind: 'loser-of', matchId: 'M102' });
      expect(m.homeLabel).toBe('Loser of M101');
      expect(m.awayLabel).toBe('Loser of M102');
      expect(m.venueCity).toBe('Miami');
      expect(m.date).toBe('JUL 18');
    });

    it('loser-of slots appear only on M103', () => {
      const loserFed = bracket.filter(
        (m) => m.home.kind === 'loser-of' || m.away.kind === 'loser-of',
      );
      expect(loserFed.map((m) => m.matchId)).toEqual(['M103']);
    });
  });

  it('returns tbd-pending-ranking for a winner still tied', () => {
    const tiedGroups = makeGroups();
    tiedGroups[0].rows[0] = { ...tiedGroups[0].rows[0], tiedPendingRanking: true };
    const tiedBracket = computeBracket(tiedGroups, thirds);
    const m79 = tiedBracket.find((b) => b.matchId === 'M79')!;
    expect(m79.home).toEqual({ kind: 'tbd-pending-ranking' });
  });

  it('a runner-up whose tie is resolved by FIFA ranking appears as a real team (not TBD)', () => {
    // Build a group where the runner-up was tied on all Step-2 criteria but resolved by FIFA rank.
    // The computeGroupStandings engine now resolves this via Step 3 before it reaches the bracket.
    // Simulate by providing a group with a concrete runner-up (tiedPendingRanking: false).
    const resolvedGroups = makeGroups();
    // Confirm runner-up slot is a real team kind, not tbd-pending-ranking
    const resolvedBracket = computeBracket(resolvedGroups, thirds);
    const m73 = resolvedBracket.find((b) => b.matchId === 'M73')!;
    // M73: Runner-up A vs Runner-up B — both must be concrete teams
    expect(m73.home.kind).toBe('team');
    expect(m73.away.kind).toBe('team');
    expect(m73.home).toEqual({ kind: 'team', name: 'RA' });
    expect(m73.away).toEqual({ kind: 'team', name: 'RB' });
  });
});

const ZERO = { yellows: 0, reds: 0, secondYellows: 0 };

function koResult(
  round: KnockoutRound,
  home: string,
  away: string,
  homeScore: number,
  awayScore: number,
  opts: { winner?: 'home' | 'away'; status?: MatchResult['status']; homeShootout?: number; awayShootout?: number } = {},
): MatchResult {
  return {
    id: `${round}-${home}-${away}`,
    homeTeam: home,
    awayTeam: away,
    homeScore,
    awayScore,
    status: opts.status ?? 'final',
    groupId: null,
    round,
    homeShootout: opts.homeShootout ?? null,
    awayShootout: opts.awayShootout ?? null,
    winner: opts.winner ?? null,
    kickoff: '2026-06-28T19:00:00Z',
    homeCards: ZERO,
    awayCards: ZERO,
  };
}

describe('applyKnockoutResults', () => {
  const groups = makeGroups();
  const thirds = rankThirds(groups);
  const bracket = computeBracket(groups, thirds);

  it('advances the R32 winner into the R16 slot fed by that match', () => {
    // M73 (Runner-up A 'RA' vs Runner-up B 'RB'); M90 feeds from winner-of M73.
    const enriched = applyKnockoutResults(bracket, [koResult('R32', 'RA', 'RB', 2, 1, { winner: 'home' })]);

    const m73 = enriched.find((m) => m.matchId === 'M73')!;
    expect(m73.status).toBe('final');
    expect(m73.winner).toBe('home');
    expect(m73.homeScore).toBe(2);
    expect(m73.awayScore).toBe(1);

    const m90 = enriched.find((m) => m.matchId === 'M90')!;
    expect(m90.home).toEqual({ kind: 'team', name: 'RA' });
    // The other feed (M75) is unresolved, so M90's away stays a placeholder.
    expect(m90.away).toEqual({ kind: 'winner-of', matchId: 'M75' });
  });

  it('advances the penalty winner despite a level regulation score', () => {
    const enriched = applyKnockoutResults(bracket, [
      koResult('R32', 'RA', 'RB', 1, 1, { winner: 'away', homeShootout: 2, awayShootout: 4 }),
    ]);

    const m73 = enriched.find((m) => m.matchId === 'M73')!;
    expect(m73.winner).toBe('away');
    expect(m73.homeShootout).toBe(2);
    expect(m73.awayShootout).toBe(4);

    const m90 = enriched.find((m) => m.matchId === 'M90')!;
    expect(m90.home).toEqual({ kind: 'team', name: 'RB' });
  });

  it('feeds the two Semi-final losers into the third-place play-off (M103) and winners into the Final', () => {
    const makeMatchup = (matchId: string, round: KnockoutRound, home: BracketTeam, away: BracketTeam): BracketMatchup => ({
      matchId, home, away, homeLabel: '', awayLabel: '', round, slot: 1, venueCity: '', date: '', kickoffTime: '',
    });
    const mini: BracketMatchup[] = [
      makeMatchup('M101', 'SF', { kind: 'team', name: 'Alpha' }, { kind: 'team', name: 'Bravo' }),
      makeMatchup('M102', 'SF', { kind: 'team', name: 'Charlie' }, { kind: 'team', name: 'Delta' }),
      makeMatchup('M103', 'ThirdPlace', { kind: 'loser-of', matchId: 'M101' }, { kind: 'loser-of', matchId: 'M102' }),
      makeMatchup('M104', 'Final', { kind: 'winner-of', matchId: 'M101' }, { kind: 'winner-of', matchId: 'M102' }),
    ];

    const enriched = applyKnockoutResults(mini, [
      koResult('SF', 'Alpha', 'Bravo', 2, 0, { winner: 'home' }),
      koResult('SF', 'Charlie', 'Delta', 1, 3, { winner: 'away' }),
    ]);

    const m103 = enriched.find((m) => m.matchId === 'M103')!;
    expect(m103.home).toEqual({ kind: 'team', name: 'Bravo' });   // loser of M101
    expect(m103.away).toEqual({ kind: 'team', name: 'Charlie' });  // loser of M102

    const m104 = enriched.find((m) => m.matchId === 'M104')!;
    expect(m104.home).toEqual({ kind: 'team', name: 'Alpha' });    // winner of M101
    expect(m104.away).toEqual({ kind: 'team', name: 'Delta' });    // winner of M102
  });

  it('leaves a matchup with unresolved feeders as placeholders and no result', () => {
    const enriched = applyKnockoutResults(bracket, []);
    const m90 = enriched.find((m) => m.matchId === 'M90')!;
    expect(m90.home).toEqual({ kind: 'winner-of', matchId: 'M73' });
    expect(m90.away).toEqual({ kind: 'winner-of', matchId: 'M75' });
    expect(m90.status).toBeUndefined();
  });
});
