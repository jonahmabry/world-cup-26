import { describe, it, expect } from 'vitest';
import type { GroupId, GroupStandings, StandingRow } from '@/lib/types';
import { GROUP_IDS } from '@/lib/types';
import { rankThirds } from './thirds';
import { computeBracket } from './bracket';

function makeRow(team: string, groupId: GroupId, position: number): StandingRow {
  return {
    team, groupId, position, mp: 3, w: 0, d: 0, l: 0,
    gf: 0, ga: 0, gd: 0, pts: 0,
    cards: { yellows: 0, reds: 0, secondYellows: 0 },
    fairPlay: 0, qualStatus: 'pending', tiedPendingRanking: false, provisional: false,
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

  it('produces exactly 16 R32 matchups', () => {
    expect(bracket).toHaveLength(16);
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
    // M74:'H', M77:'G', M79:'B', M80:'C', M81:'A', M82:'F', M85:'D', M87:'E'

    it('M79: Winner A vs 3rd Group B', () => {
      const m = bracket.find((b) => b.matchId === 'M79')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WA' });
      expect(m.away).toEqual({ kind: 'team', name: '3B' });
      expect(m.homeLabel).toBe('Winner A');
      expect(m.awayLabel).toBe('3rd Group B');
    });

    it('M81: Winner D vs 3rd Group A', () => {
      const m = bracket.find((b) => b.matchId === 'M81')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WD' });
      expect(m.away).toEqual({ kind: 'team', name: '3A' });
      expect(m.awayLabel).toBe('3rd Group A');
    });

    it('M74: Winner E vs 3rd Group H', () => {
      const m = bracket.find((b) => b.matchId === 'M74')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WE' });
      expect(m.away).toEqual({ kind: 'team', name: '3H' });
    });

    it('M85: Winner B vs 3rd Group D', () => {
      const m = bracket.find((b) => b.matchId === 'M85')!;
      expect(m.home).toEqual({ kind: 'team', name: 'WB' });
      expect(m.away).toEqual({ kind: 'team', name: '3D' });
    });
  });

  it('returns tbd-pending-ranking for a winner still tied', () => {
    const tiedGroups = makeGroups();
    tiedGroups[0].rows[0] = { ...tiedGroups[0].rows[0], tiedPendingRanking: true };
    const tiedBracket = computeBracket(tiedGroups, thirds);
    const m79 = tiedBracket.find((b) => b.matchId === 'M79')!;
    expect(m79.home).toEqual({ kind: 'tbd-pending-ranking' });
  });
});
