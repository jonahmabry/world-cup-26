import type { MatchResult, Snapshot, StandingRow } from '@/lib/types';
import { fetchScoreboard, detectNewlyFinished, EspnError } from './espn/client';
import { getMergedResults } from './cache/index';
import { getLiveMatches, setLiveMatches } from './cache/memory';
import { writeMatchToDisk } from './cache/disk';
import { computeGroupStandings } from './engine/standings';
import { rankThirds } from './engine/thirds';
import { computeBracket } from './engine/bracket';

export async function runPipeline(): Promise<Snapshot> {
  const previous = getLiveMatches();
  let hasStaleData = false;

  let fresh: MatchResult[] = [];
  try {
    fresh = await fetchScoreboard();
  } catch (err) {
    if (err instanceof EspnError) {
      hasStaleData = true;
    } else {
      throw err;
    }
  }

  if (fresh.length > 0) {
    const newlyFinishedIds = new Set(detectNewlyFinished(previous, fresh));
    for (const match of fresh) {
      if (newlyFinishedIds.has(match.id)) {
        writeMatchToDisk(match);
      }
    }
    const liveMatches = fresh.filter((m) => m.status !== 'final');
    setLiveMatches(liveMatches);
  }

  const allMatches = getMergedResults();
  const groupStandings = computeGroupStandings(allMatches);
  const thirdsRanking = rankThirds(groupStandings);

  const advancingThirdGroups = new Set(thirdsRanking.advancing.map((r) => r.groupId));
  for (const group of groupStandings) {
    const hasResults = group.rows.some((r) => r.mp > 0);
    group.rows.forEach((row, i) => {
      if (!hasResults) {
        row.qualStatus = 'pending';
      } else if (i === 0 || i === 1) {
        row.qualStatus = 'auto';
      } else if (i === 2) {
        row.qualStatus = advancingThirdGroups.has(group.groupId) ? 'best-third' : 'eliminated';
      } else {
        row.qualStatus = 'eliminated';
      }
    });
  }

  const allThirds: StandingRow[] = thirdsRanking.allThirds.map((r) => {
    const hasResults = r.mp > 0;
    return {
      ...r,
      qualStatus: !hasResults
        ? ('pending' as const)
        : advancingThirdGroups.has(r.groupId)
          ? ('best-third' as const)
          : ('eliminated' as const),
    };
  });

  const bracket = computeBracket(groupStandings, thirdsRanking);

  return {
    groups: groupStandings,
    allThirds,
    advancingThirds: thirdsRanking.advancing,
    bracket,
    lastUpdated: new Date().toISOString(),
    hasStaleData,
  };
}
