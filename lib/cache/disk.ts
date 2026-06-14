import fs from 'fs';
import path from 'path';
import type { MatchResult } from '@/lib/types';
import { normalizeTeamName } from '@/lib/engine/groups';

const CACHE_PATH = path.join(process.cwd(), 'data', 'cache', 'matches.json');

interface CacheFile {
  matches: Record<string, MatchResult>;
  backfillWatermark: string | null;
}

function readCacheFile(): CacheFile {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // Handle legacy flat format where all keys are match IDs (no 'matches' wrapper)
    if (!('matches' in parsed)) {
      return { matches: parsed as Record<string, MatchResult>, backfillWatermark: null };
    }
    return parsed as unknown as CacheFile;
  } catch {
    return { matches: {}, backfillWatermark: null };
  }
}

function writeCacheFile(file: CacheFile): void {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(file, null, 2), 'utf-8');
}

export function readDiskCache(): MatchResult[] {
  // ESPN displayNames (e.g. "United States", "Congo DR") are normalized here at read time
  // so callers always see canonical names. On-disk values are left as-is; the write-once
  // guard prevents re-writing existing matches, so normalization lives here rather than
  // requiring a migration.
  return Object.values(readCacheFile().matches).map((m) => ({
    ...m,
    homeTeam: normalizeTeamName(m.homeTeam),
    awayTeam: normalizeTeamName(m.awayTeam),
  }));
}

// Write-once: skips if match ID already cached.
export function writeMatchToDisk(match: MatchResult): void {
  const file = readCacheFile();
  if (file.matches[match.id]) return;
  file.matches[match.id] = match;
  writeCacheFile(file);
}

export function isMatchCached(matchId: string): boolean {
  return !!readCacheFile().matches[matchId];
}

export function readBackfillWatermark(): string | null {
  return readCacheFile().backfillWatermark;
}

function dateToYYYYMMDD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function yyyymmddToDate(s: string): Date {
  return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00Z`);
}

// After a backfill sweep, advance the watermark through consecutive fully-final dates.
// A date is fully final when every match on that date is 'final'. Dates with no matches
// are passed through freely. Stops at the first date that has any non-final match.
export function updateBackfillWatermark(
  sweepMatches: MatchResult[],
  sweepStartYYYYMMDD: string,
  sweepEndYYYYMMDD: string,
): void {
  const byDate = new Map<string, MatchResult[]>();
  for (const m of sweepMatches) {
    const d = m.kickoff.slice(0, 10).replace(/-/g, '');
    const arr = byDate.get(d) ?? [];
    arr.push(m);
    byDate.set(d, arr);
  }

  const file = readCacheFile();
  let newWatermark = file.backfillWatermark;

  const cur = yyyymmddToDate(sweepStartYYYYMMDD);
  const end = yyyymmddToDate(sweepEndYYYYMMDD);

  while (cur <= end) {
    const d = dateToYYYYMMDD(cur);
    const dayMatches = byDate.get(d) ?? [];
    const allFinal = dayMatches.length === 0 || dayMatches.every((m) => m.status === 'final');
    if (allFinal) {
      newWatermark = d;
    } else {
      break;
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  if (newWatermark !== file.backfillWatermark) {
    file.backfillWatermark = newWatermark;
    writeCacheFile(file);
  }
}
