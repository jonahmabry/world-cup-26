import fs from 'fs';
import path from 'path';
import type { MatchResult } from '@/lib/types';

const CACHE_PATH = path.join(process.cwd(), 'data', 'cache', 'matches.json');

function read(): Record<string, MatchResult> {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
    return JSON.parse(raw) as Record<string, MatchResult>;
  } catch {
    return {};
  }
}

function write(data: Record<string, MatchResult>): void {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function readDiskCache(): MatchResult[] {
  return Object.values(read());
}

// Write-once: skips if match ID already cached.
export function writeMatchToDisk(match: MatchResult): void {
  const data = read();
  if (data[match.id]) return;
  data[match.id] = match;
  write(data);
}

export function isMatchCached(matchId: string): boolean {
  return !!read()[matchId];
}
