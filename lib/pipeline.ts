import type { MatchResult, Snapshot, StandingRow } from '@/lib/types';
import { fetchScoreboard, fetchScoreboardRange, formatDate, detectNewlyFinished, EspnError } from './espn/client';
import { getMergedResults } from './cache/index';
import { getLiveMatches, setLiveMatches } from './cache/memory';
import { writeMatchToDisk, readBackfillWatermark, updateBackfillWatermark } from './cache/disk';
import { computeGroupStandings } from './engine/standings';
import { rankThirds } from './engine/thirds';
import { computeBracket } from './engine/bracket';

const TOURNAMENT_START = '20260611';

// Sweeps past tournament dates not yet in the on-disk cache.
// Returns true if the ESPN call failed (caller should set hasStaleData).
async function runBackfill(): Promise<boolean> {
  const watermark = readBackfillWatermark();

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  let sweepStart: string;
  if (watermark) {
    const d = new Date(`${watermark.slice(0, 4)}-${watermark.slice(4, 6)}-${watermark.slice(6, 8)}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    sweepStart = formatDate(d);
  } else {
    sweepStart = TOURNAMENT_START;
  }

  if (sweepStart > yesterdayStr) return false;

  let backfillMatches: MatchResult[];
  try {
    backfillMatches = await fetchScoreboardRange(sweepStart, yesterdayStr);
  } catch (err) {
    if (err instanceof EspnError) return true;
    throw err;
  }

  for (const match of backfillMatches) {
    if (match.status === 'final') {
      writeMatchToDisk(match);
    }
  }

  updateBackfillWatermark(backfillMatches, sweepStart, yesterdayStr);
  return false;
}

export async function runPipeline(): Promise<Snapshot> {
  let hasStaleData = await runBackfill();

  const previous = getLiveMatches();

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

  // getMergedResults() combines on-disk finals with in-memory live (in-progress + scheduled).
  // computeGroupStandings picks up in-progress matches as provisional results.
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
