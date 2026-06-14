// Background poller singleton.
// Lazy-started on first call to initPoller(); only one instance runs per process.
//
// Active polling (every 60s): when at least one match is within ±90 minutes of now.
// Idle polling (every ~30 min): outside any match window, to pick up the next day's schedule.

import { fetchScoreboard, detectNewlyFinished, EspnError } from './espn/client';
import { getLiveMatches, setLiveMatches } from './cache/memory';
import { writeMatchToDisk } from './cache/disk';

declare global {
  // eslint-disable-next-line no-var
  var __pollerStarted: boolean | undefined;
}

const POLL_INTERVAL_MS = 60_000;
const WINDOW_MINUTES = 90;
// After all matches finish, poll once every ~30 min to discover tomorrow's schedule.
const IDLE_POLL_EVERY_N_TICKS = 30;

// All kickoffs from the last successful fetch (includes scheduled future matches).
// Used for the window check so the guard works even after live matches clear from memory.
let lastFetchedKickoffs: string[] = [];
let idleTickCount = 0;

function hasMatchInWindow(kickoffs: string[]): boolean {
  const now = Date.now();
  const windowMs = WINDOW_MINUTES * 60 * 1000;
  return kickoffs.some((iso) => Math.abs(new Date(iso).getTime() - now) <= windowMs);
}

async function tick() {
  const previous = getLiveMatches();

  // Prefer stored kickoffs (includes future scheduled) over live-only memory.
  // On first tick lastFetchedKickoffs is empty → inWindow = true → always fetch once.
  const kickoffs = lastFetchedKickoffs.length > 0
    ? lastFetchedKickoffs
    : previous.map((m) => m.kickoff);

  const inWindow = kickoffs.length === 0 || hasMatchInWindow(kickoffs);

  if (!inWindow) {
    idleTickCount++;
    // Outside any match window: skip until the idle threshold, then do one check.
    if (idleTickCount < IDLE_POLL_EVERY_N_TICKS) return;
  }
  idleTickCount = 0;

  let fresh: import('./types').MatchResult[] = [];
  try {
    fresh = await fetchScoreboard();
  } catch (err) {
    if (!(err instanceof EspnError)) throw err;
    return; // stale data — skip this tick
  }

  // Persist all kickoffs so future window checks see tomorrow's scheduled matches.
  lastFetchedKickoffs = fresh.map((m) => m.kickoff);

  const newlyFinishedIds = new Set(detectNewlyFinished(previous, fresh));
  for (const match of fresh) {
    if (newlyFinishedIds.has(match.id)) {
      writeMatchToDisk(match);
    }
  }

  setLiveMatches(fresh.filter((m) => m.status !== 'final'));
}

export function initPoller(): void {
  if (globalThis.__pollerStarted) return;
  globalThis.__pollerStarted = true;
  setInterval(() => {
    tick().catch(console.error);
  }, POLL_INTERVAL_MS);
}
