// Source: Official FIFA 2026 World Cup match schedule (bracketmundial2026.com / FIFA).
// feedsFrom: the two earlier match IDs whose winners meet in each knockout slot.
// R32 entries have feedsFrom: null — their teams come from group-stage standings.
// slot: visual position within the round (1 = top of bracket column), used for rendering order.
// Kickoff times are Central Daylight Time (CDT, UTC-5).

import type { KnockoutRound } from '@/lib/types';

export interface KnockoutMatchEntry {
  round: KnockoutRound;
  slot: number;             // visual position within the round (1-indexed, top to bottom)
  feedsFrom: [string, string] | null;
  venueCity: string;
  date: string;             // display string, e.g. "JUN 29"
  kickoffTime: string;      // CDT kickoff, e.g. "3:30PM"
}

export const KNOCKOUT_SCHEDULE: Record<string, KnockoutMatchEntry> = {
  // ── Round of 32 (June 28 – July 3) ──────────────────────────────────────────
  // Bracket top half → feeds M89 → M90 → M97 → M101 → Final
  M74: { round: 'R32', slot:  1, feedsFrom: null, venueCity: 'Boston',              date: 'JUN 29', kickoffTime: '3:30PM' },   // EDT→CDT
  M77: { round: 'R32', slot:  2, feedsFrom: null, venueCity: 'New York/New Jersey', date: 'JUN 30', kickoffTime: '4:00PM' },   // EDT→CDT
  M73: { round: 'R32', slot:  3, feedsFrom: null, venueCity: 'Los Angeles',         date: 'JUN 28', kickoffTime: '2:00PM' },   // PDT→CDT
  M75: { round: 'R32', slot:  4, feedsFrom: null, venueCity: 'Monterrey',           date: 'JUN 29', kickoffTime: '8:00PM' },   // CDT
  M83: { round: 'R32', slot:  5, feedsFrom: null, venueCity: 'Toronto',             date: 'JUL 2',  kickoffTime: '6:00PM' },   // EDT→CDT
  M84: { round: 'R32', slot:  6, feedsFrom: null, venueCity: 'Los Angeles',         date: 'JUL 2',  kickoffTime: '2:00PM' },   // PDT→CDT
  M81: { round: 'R32', slot:  7, feedsFrom: null, venueCity: 'San Francisco',       date: 'JUL 1',  kickoffTime: '7:00PM' },   // PDT→CDT
  M82: { round: 'R32', slot:  8, feedsFrom: null, venueCity: 'Seattle',             date: 'JUL 1',  kickoffTime: '3:00PM' },   // PDT→CDT
  // Bracket bottom half → feeds M91 → M92 → M99 → M102 → Final
  M76: { round: 'R32', slot:  9, feedsFrom: null, venueCity: 'Houston',             date: 'JUN 29', kickoffTime: '12:00PM' },  // CDT
  M78: { round: 'R32', slot: 10, feedsFrom: null, venueCity: 'Dallas',              date: 'JUN 30', kickoffTime: '12:00PM' },  // CDT
  M79: { round: 'R32', slot: 11, feedsFrom: null, venueCity: 'Mexico City',         date: 'JUN 30', kickoffTime: '8:00PM' },   // CDT
  M80: { round: 'R32', slot: 12, feedsFrom: null, venueCity: 'Atlanta',             date: 'JUL 1',  kickoffTime: '11:00AM' },  // EDT→CDT
  M86: { round: 'R32', slot: 13, feedsFrom: null, venueCity: 'Miami',               date: 'JUL 3',  kickoffTime: '5:00PM' },   // EDT→CDT
  M88: { round: 'R32', slot: 14, feedsFrom: null, venueCity: 'Dallas',              date: 'JUL 3',  kickoffTime: '1:00PM' },   // CDT
  M85: { round: 'R32', slot: 15, feedsFrom: null, venueCity: 'Vancouver',           date: 'JUL 2',  kickoffTime: '10:00PM' },  // PDT→CDT
  M87: { round: 'R32', slot: 16, feedsFrom: null, venueCity: 'Kansas City',         date: 'JUL 3',  kickoffTime: '8:30PM' },   // CDT

  // ── Round of 16 (July 4–7) ──────────────────────────────────────────────────
  M89:  { round: 'R16', slot: 1, feedsFrom: ['M74', 'M77'], venueCity: 'Philadelphia',        date: 'JUL 4', kickoffTime: '4:00PM' },   // EDT→CDT
  M90:  { round: 'R16', slot: 2, feedsFrom: ['M73', 'M75'], venueCity: 'Houston',             date: 'JUL 4', kickoffTime: '12:00PM' },  // CDT
  M93:  { round: 'R16', slot: 3, feedsFrom: ['M83', 'M84'], venueCity: 'Dallas',              date: 'JUL 6', kickoffTime: '2:00PM' },   // CDT
  M94:  { round: 'R16', slot: 4, feedsFrom: ['M81', 'M82'], venueCity: 'Seattle',             date: 'JUL 6', kickoffTime: '7:00PM' },   // PDT→CDT
  M91:  { round: 'R16', slot: 5, feedsFrom: ['M76', 'M78'], venueCity: 'New York/New Jersey', date: 'JUL 5', kickoffTime: '3:00PM' },   // EDT→CDT
  M92:  { round: 'R16', slot: 6, feedsFrom: ['M79', 'M80'], venueCity: 'Mexico City',         date: 'JUL 5', kickoffTime: '7:00PM' },   // CDT
  M95:  { round: 'R16', slot: 7, feedsFrom: ['M86', 'M88'], venueCity: 'Atlanta',             date: 'JUL 7', kickoffTime: '11:00AM' },  // EDT→CDT
  M96:  { round: 'R16', slot: 8, feedsFrom: ['M85', 'M87'], venueCity: 'Vancouver',           date: 'JUL 7', kickoffTime: '3:00PM' },   // PDT→CDT

  // ── Quarter-finals (July 9–11) ───────────────────────────────────────────────
  M97:  { round: 'QF', slot: 1, feedsFrom: ['M89', 'M90'], venueCity: 'Boston',       date: 'JUL 9',  kickoffTime: '3:00PM' },   // EDT→CDT
  M98:  { round: 'QF', slot: 2, feedsFrom: ['M93', 'M94'], venueCity: 'Los Angeles',  date: 'JUL 10', kickoffTime: '2:00PM' },   // PDT→CDT
  M99:  { round: 'QF', slot: 3, feedsFrom: ['M91', 'M92'], venueCity: 'Miami',        date: 'JUL 11', kickoffTime: '4:00PM' },   // EDT→CDT
  M100: { round: 'QF', slot: 4, feedsFrom: ['M95', 'M96'], venueCity: 'Kansas City',  date: 'JUL 11', kickoffTime: '8:00PM' },   // CDT

  // ── Semi-finals (July 14–15) ─────────────────────────────────────────────────
  M101: { round: 'SF', slot: 1, feedsFrom: ['M97',  'M98'],  venueCity: 'Dallas',  date: 'JUL 14', kickoffTime: '2:00PM' },   // CDT
  M102: { round: 'SF', slot: 2, feedsFrom: ['M99',  'M100'], venueCity: 'Atlanta', date: 'JUL 15', kickoffTime: '2:00PM' },   // EDT→CDT

  // ── Final (July 19) ──────────────────────────────────────────────────────────
  M104: { round: 'Final', slot: 1, feedsFrom: ['M101', 'M102'], venueCity: 'New York/New Jersey', date: 'JUL 19', kickoffTime: '2:00PM' },  // EDT→CDT
};

function validateSchedule(): void {
  const ids = new Set(Object.keys(KNOCKOUT_SCHEDULE));

  for (const [matchId, entry] of Object.entries(KNOCKOUT_SCHEDULE)) {
    if (entry.feedsFrom === null) continue;
    for (const feedId of entry.feedsFrom) {
      if (!ids.has(feedId)) {
        throw new Error(`knockoutSchedule: ${matchId}.feedsFrom references unknown match ${feedId}`);
      }
    }
  }

  if (!ids.has('M104')) {
    throw new Error('knockoutSchedule: Final (M104) is missing');
  }

  for (const entry of Object.values(KNOCKOUT_SCHEDULE)) {
    if (entry.feedsFrom?.includes('M104')) {
      throw new Error('knockoutSchedule: M104 cannot be referenced by another match');
    }
  }
}

validateSchedule();
