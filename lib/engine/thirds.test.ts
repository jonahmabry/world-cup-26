import { describe, it, expect } from 'vitest';
import type { GroupId, GroupStandings, StandingRow } from '@/lib/types';
import { GROUP_IDS } from '@/lib/types';
import { rankThirds } from './thirds';

function makeThird(
  team: string,
  groupId: GroupId,
  pts: number,
  gd: number,
  gf: number,
  yellows = 0,
): StandingRow {
  const ga = gf - gd;
  return {
    team, groupId, position: 3, mp: 3,
    w: 0, d: 0, l: 0,
    gf, ga, gd, pts,
    cards: { yellows, reds: 0, secondYellows: 0 },
    fairPlay: -yellows,
    qualStatus: 'pending', tiedPendingRanking: false, provisional: false,
  };
}

function makeGroup(groupId: GroupId, third: StandingRow): GroupStandings {
  const placeholder = (team: string, pos: number, p: number): StandingRow => ({
    team, groupId, position: pos, mp: 3, w: 0, d: 0, l: 0,
    gf: 0, ga: 0, gd: 0, pts: p,
    cards: { yellows: 0, reds: 0, secondYellows: 0 },
    fairPlay: 0, qualStatus: 'pending', tiedPendingRanking: false, provisional: false,
  });
  return {
    groupId,
    rows: [placeholder('W', 1, 9), placeholder('R', 2, 6), third, placeholder('F', 4, 0)],
  };
}

describe('rankThirds', () => {
  it('ranks 12 third-place teams by pts, then GD, then GF', () => {
    const groups: GroupStandings[] = [
      makeGroup('A', makeThird('MEX3', 'A', 4, 2, 4)),   // 4pts GD+2 GF4
      makeGroup('B', makeThird('CAN3', 'B', 4, 1, 3)),   // 4pts GD+1
      makeGroup('C', makeThird('BRA3', 'C', 4, 1, 4)),   // 4pts GD+1 GF4 (same GD as B, more GF)
      makeGroup('D', makeThird('USA3', 'D', 3, 0, 2)),   // 3pts
      makeGroup('E', makeThird('GER3', 'E', 3, 0, 1)),   // 3pts, fewer GF
      makeGroup('F', makeThird('NED3', 'F', 3, -1, 1)),  // 3pts, GD -1
      makeGroup('G', makeThird('BEL3', 'G', 2, -1, 1)),  // 2pts
      makeGroup('H', makeThird('ESP3', 'H', 2, -2, 0)),  // 2pts, worse GD
      makeGroup('I', makeThird('FRA3', 'I', 1, -2, 0)),  // 1pt
      makeGroup('J', makeThird('ARG3', 'J', 1, -2, 0)),  // 1pt (tied with I)
      makeGroup('K', makeThird('POR3', 'K', 0, -3, 0)),  // 0pts
      makeGroup('L', makeThird('ENG3', 'L', 0, -4, 0)),  // 0pts, worse GD
    ];
    const { allThirds, advancing, eliminated } = rankThirds(groups);

    expect(allThirds).toHaveLength(12);
    expect(advancing).toHaveLength(8);
    expect(eliminated).toHaveLength(4);

    // Top 3: MEX3 (4pts, GD+2), then CAN3 vs BRA3 both 4pts GD+1 but BRA3 has more GF
    expect(allThirds[0].team).toBe('MEX3');
    expect(allThirds[1].team).toBe('BRA3'); // GF=4 > CAN3 GF=3
    expect(allThirds[2].team).toBe('CAN3');

    // Bottom 2: ENG3 (0pts, GD-4) is below POR3 (0pts, GD-3)
    expect(allThirds[10].team).toBe('POR3');
    expect(allThirds[11].team).toBe('ENG3');
  });

  it('advancing slice contains exactly the 8 highest-ranked thirds', () => {
    const groups: GroupStandings[] = GROUP_IDS.map((id, i) =>
      makeGroup(id, makeThird(`T${id}`, id, 12 - i, 0, 0)),
    );
    const { advancing, eliminated, advancingGroupIds } = rankThirds(groups);
    // Distinct pts (12 down to 1), so ranking is unambiguous
    expect(advancing[0].team).toBe('TA');   // highest pts
    expect(advancing[7].team).toBe('TH');   // 8th highest
    expect(eliminated[0].team).toBe('TI');  // 9th → eliminated
    expect(eliminated[3].team).toBe('TL');  // last
    expect(advancingGroupIds).toEqual(['A','B','C','D','E','F','G','H']);
  });

  it('tiedPendingRanking is set on thirds tied through all criteria', () => {
    // Give each group a unique pts value except I and J (both 2pts, equal stats)
    const pts: Record<string, number> = {
      A:12, B:11, C:10, D:9, E:8, F:7, G:6, H:5, I:2, J:2, K:1, L:0,
    };
    const groups: GroupStandings[] = GROUP_IDS.map((id) =>
      makeGroup(id, makeThird(`T${id}`, id, pts[id], 0, 0)),
    );
    const { allThirds } = rankThirds(groups);
    const iRow = allThirds.find((r) => r.team === 'TI')!;
    const jRow = allThirds.find((r) => r.team === 'TJ')!;
    expect(iRow.tiedPendingRanking).toBe(true);
    expect(jRow.tiedPendingRanking).toBe(true);
    // TA has unique pts (12) → not tied with anyone
    expect(allThirds.find((r) => r.team === 'TA')!.tiedPendingRanking).toBe(false);
  });

  it('fair-play breaks tie: team with fewer yellow cards ranks higher', () => {
    // Two groups with identical pts/GD/GF; one has a yellow card
    const groups: GroupStandings[] = GROUP_IDS.map((id) => {
      const yellows = id === 'B' ? 1 : 0; // Group B's third has a yellow
      const pts = ['A', 'B'].includes(id) ? 3 : id < 'C' ? 6 : 0;
      return makeGroup(id, makeThird(`T${id}`, id, pts, 0, 1, yellows));
    });
    const { allThirds } = rankThirds(groups);
    const aIdx = allThirds.findIndex((r) => r.team === 'TA');
    const bIdx = allThirds.findIndex((r) => r.team === 'TB');
    expect(aIdx).toBeLessThan(bIdx); // A (no cards) ranks above B (1 yellow)
  });
});
