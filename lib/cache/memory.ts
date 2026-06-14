import type { MatchResult } from '@/lib/types';

// Module-level in-memory store for live/scheduled matches.
// Discarded on server restart — ESPN re-fetches on next request.
const store = new Map<string, MatchResult>();

export function setLiveMatches(matches: MatchResult[]): void {
  store.clear();
  for (const m of matches) store.set(m.id, m);
}

export function getLiveMatches(): MatchResult[] {
  return Array.from(store.values());
}

export function clearLiveMatch(matchId: string): void {
  store.delete(matchId);
}
