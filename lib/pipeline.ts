import type { MatchResult, Snapshot, StandingRow } from '@/lib/types';
import { fetchScoreboard, fetchScoreboardRange, formatDate, detectNewlyFinished, EspnError } from './espn/client';
import { getMergedResults } from './cache/index';
import { getLiveMatches, setLiveMatches } from './cache/memory';
import { writeMatchToDisk, readBackfillWatermark, updateBackfillWatermark } from './cache/disk';
import { computeGroupStandings } from './engine/standings';
import { rankThirds } from './engine/thirds';
import { computeBracket } from './engine/bracket';

const TOURNAMENT_START = '20260611';

// ESPN's scoreboard buckets matches by US-Eastern calendar date, but the on-disk
// watermark advances by UTC date (see lib/cache/disk.ts updateBackfillWatermark).
// For late kickoffs (~00:00–05:00 UTC = the previous evening in the Americas) the
// two calendars disagree by a day: ESPN files such a match under the earlier
// Eastern date, while the watermark counts it under the later UTC date. A strict
// watermark+1 sweep start therefore advances the UTC watermark past the day while a
// late match that ESPN only serves under the earlier Eastern label is still pending,
// then never re-queries that label — permanently orphaning the match.
//
// Starting the sweep a couple of days before the watermark re-queries that earlier
// Eastern date label so the match is eventually picked up. The write-once disk guard
// (writeMatchToDisk) makes the overlap a no-op for already-cached matches.
const BACKFILL_LOOKBACK_DAYS = 2;

// First sweep date for a given watermark. Exported for testing the date-boundary fix.
export function computeSweepStart(watermark: string | null): string {
  if (!watermark) return TOURNAMENT_START;
  const d = new Date(`${watermark.slice(0, 4)}-${watermark.slice(4, 6)}-${watermark.slice(6, 8)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1 - BACKFILL_LOOKBACK_DAYS);
  const candidate = formatDate(d);
  return candidate < TOURNAMENT_START ? TOURNAMENT_START : candidate;
}

// Sweeps past tournament dates not yet in the on-disk cache.
// Returns true if the ESPN call failed (caller should set hasStaleData).
async function runBackfill(): Promise<boolean> {
  const watermark = readBackfillWatermark();

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const sweepStart = computeSweepStart(watermark);

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
    matches: allMatches,
    lastUpdated: new Date().toISOString(),
    hasStaleData,
  };
}
