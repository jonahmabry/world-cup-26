import fs from 'fs';
import path from 'path';
import type { MatchResult } from '@/lib/types';
import { normalizeTeamName } from '@/lib/engine/groups';

// Seed data committed to the repo (read-only inside the deployment bundle).
const SEED_PATH = path.join(process.cwd(), 'data', 'cache', 'matches.json');

// On Vercel (and most serverless hosts) the deployment filesystem is read-only
// except for /tmp. Writing under process.cwd() throws EROFS and crashes the request,
// so on Vercel we write to /tmp and fall back to the bundled seed for reads.
// Note: /tmp is ephemeral and per-instance — finals are re-derived from ESPN on every
// pipeline run anyway, so disk is only a best-effort cache, not the source of truth.
const WRITABLE_DIR = process.env.VERCEL
  ? path.join('/tmp', 'wc26-cache')
  : path.join(process.cwd(), 'data', 'cache');
const CACHE_PATH = path.join(WRITABLE_DIR, 'matches.json');

interface CacheFile {
  matches: Record<string, MatchResult>;
  backfillWatermark: string | null;
}

function readFrom(filePath: string): CacheFile | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // Handle legacy flat format where all keys are match IDs (no 'matches' wrapper)
    if (!('matches' in parsed)) {
      return { matches: parsed as Record<string, MatchResult>, backfillWatermark: null };
    }
    return parsed as unknown as CacheFile;
  } catch {
    return null;
  }
}

function readCacheFile(): CacheFile {
  // Prefer the writable copy (/tmp on Vercel); fall back to the bundled seed on cold starts.
  return readFrom(CACHE_PATH) ?? readFrom(SEED_PATH) ?? { matches: {}, backfillWatermark: null };
}

function writeCacheFile(file: CacheFile): void {
  try {
    fs.mkdirSync(WRITABLE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(file, null, 2), 'utf-8');
  } catch (err) {
    // Read-only or otherwise unwritable FS: degrade to recompute-from-source rather than
    // crashing the request. Finals are re-derived from ESPN on each pipeline run.
    console.error('[disk cache] write failed, continuing without persistence:', err);
  }
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
