import type { MatchResult } from '@/lib/types';
import { readDiskCache } from './disk';
import { getLiveMatches } from './memory';

// Merges on-disk completed matches with in-memory live data.
// Disk entries win if the same ID appears in both (disk = authoritative final result).
export function getMergedResults(): MatchResult[] {
  const disk = readDiskCache();
  const diskIds = new Set(disk.map((m) => m.id));
  const live = getLiveMatches().filter((m) => !diskIds.has(m.id));
  return [...disk, ...live];
}
