import type { GroupId, GroupStandings, StandingRow } from '@/lib/types';
import { fairPlayScore } from '@/lib/types';
import { fifaRank } from './fifaRanking';

// Cross-group ranking uses the same criteria as within-group, except H2H is
// omitted (third-place teams from different groups never played each other).
// Order: points → GD → GS → fair-play → FIFA World Ranking (Step 3).
function compareThirds(a: StandingRow, b: StandingRow): number {
  if (a.pts !== b.pts) return b.pts - a.pts;
  if (a.gd !== b.gd) return b.gd - a.gd;
  if (a.gf !== b.gf) return b.gf - a.gf;
  if (a.fairPlay !== b.fairPlay) return b.fairPlay - a.fairPlay;
  // Step 3: FIFA World Ranking (lower position = better)
  return fifaRank(a.team) - fifaRank(b.team);
}

// Returns true only when compareThirds cannot separate two rows (equal rank — extremely rare).
function thirdsStillTied(a: StandingRow, b: StandingRow): boolean {
  return a.pts === b.pts && a.gd === b.gd && a.gf === b.gf &&
    a.fairPlay === b.fairPlay && fifaRank(a.team) === fifaRank(b.team);
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

  allThirds.sort((a, b) => compareThirds(a, b));

  // Mark tiedPendingRanking only when Step 3 (FIFA rank) also cannot separate two rows
  for (let i = 0; i < allThirds.length; i++) {
    const tied =
      (i > 0 && thirdsStillTied(allThirds[i - 1], allThirds[i])) ||
      (i < allThirds.length - 1 && thirdsStillTied(allThirds[i], allThirds[i + 1]));
    if (tied) allThirds[i] = { ...allThirds[i], tiedPendingRanking: true };
  }

  const advancing = allThirds.slice(0, 8);
  const eliminated = allThirds.slice(8);
  const advancingGroupIds = advancing.map((r) => r.groupId);

  return { allThirds, advancing, eliminated, advancingGroupIds };
}
