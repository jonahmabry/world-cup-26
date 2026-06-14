import type { GroupId, GroupStandings, StandingRow } from '@/lib/types';
import { fairPlayScore } from '@/lib/types';

// Cross-group ranking uses the same criteria as within-group, except H2H is
// omitted (third-place teams from different groups never played each other).
// Order: points → GD → GS → fair-play → FIFA World Ranking (tiedPendingRanking).
function compareThirds(a: StandingRow, b: StandingRow): number {
  if (a.pts !== b.pts) return b.pts - a.pts;
  if (a.gd !== b.gd) return b.gd - a.gd;
  if (a.gf !== b.gf) return b.gf - a.gf;
  if (a.fairPlay !== b.fairPlay) return b.fairPlay - a.fairPlay;
  return 0; // tiedPendingRanking handled by caller
}

export interface ThirdsRanking {
  allThirds: StandingRow[];       // all 12, ranked
  advancing: StandingRow[];       // top 8
  eliminated: StandingRow[];      // bottom 4
  advancingGroupIds: GroupId[];   // which groups' thirds advance
}

export function rankThirds(groupStandings: GroupStandings[]): ThirdsRanking {
  const allThirds: StandingRow[] = groupStandings
    .map((g) => g.rows[2])
    .filter(Boolean)
    .map((r) => ({
      ...r,
      fairPlay: fairPlayScore(r.cards),
    }));

  allThirds.sort((a, b) => {
    const cmp = compareThirds(a, b);
    if (cmp !== 0) return cmp;
    // Both are tied through fair-play → mark both
    return 0;
  });

  // Mark tiedPendingRanking for rows that are equal through all criteria
  for (let i = 0; i < allThirds.length; i++) {
    const tied =
      (i > 0 && compareThirds(allThirds[i - 1], allThirds[i]) === 0) ||
      (i < allThirds.length - 1 && compareThirds(allThirds[i], allThirds[i + 1]) === 0);
    if (tied) allThirds[i] = { ...allThirds[i], tiedPendingRanking: true };
  }

  const advancing = allThirds.slice(0, 8);
  const eliminated = allThirds.slice(8);
  const advancingGroupIds = advancing.map((r) => r.groupId);

  return { allThirds, advancing, eliminated, advancingGroupIds };
}
