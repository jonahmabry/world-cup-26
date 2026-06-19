// Official FIFA 2026 World Cup group-stage fixture table.
// 72 matches: 12 groups × 6 matches each, 3 matchdays.
// All kickoff times are CDT (Central Daylight Time, UTC-5) display strings.
// Team names are canonical (matching GROUPS in lib/engine/groups.ts).
// Source: Official FIFA 2026 match schedule.

import type { GroupFixture, GroupId } from '@/lib/types';
import { GROUPS } from './groups';

// Third-place R32 slot labels — which group-winner's third-place opponent comes from
// which combination of groups. Sourced from the official FIFA 2026 R32 allocation table.
export const THIRD_PLACE_SLOT_LABELS: Record<string, string> = {
  M74: '3ABCDF',
  M77: '3ACDEF',
  M79: '3BCDEF',
  M80: '3ABDEF',
  M81: '3ABCEF',
  M82: '3ABCDF',
  M85: '3ABCDE',
  M87: '3BCDEF',
};

export const GROUP_SCHEDULE: GroupFixture[] = [
  // ── Group A: Mexico, South Korea, South Africa, Czechia ──────────────────────
  // Matchday 1 (Jun 11–13)
  { groupId: 'A', matchday: 1, home: 'Mexico',       away: 'South Africa', isoDate: '2026-06-11', kickoffTime: '5:00PM', venueCity: 'Los Angeles' },
  { groupId: 'A', matchday: 1, home: 'Czechia',      away: 'South Korea',  isoDate: '2026-06-12', kickoffTime: '8:00PM', venueCity: 'Dallas' },
  // Matchday 2 (Jun 18–19)
  { groupId: 'A', matchday: 2, home: 'Mexico',       away: 'Czechia',      isoDate: '2026-06-18', kickoffTime: '5:00PM', venueCity: 'Houston' },
  { groupId: 'A', matchday: 2, home: 'South Korea',  away: 'South Africa', isoDate: '2026-06-19', kickoffTime: '2:00PM', venueCity: 'Seattle' },
  // Matchday 3 (Jun 25)
  { groupId: 'A', matchday: 3, home: 'South Korea',  away: 'Mexico',       isoDate: '2026-06-25', kickoffTime: '2:00PM', venueCity: 'Guadalajara' },
  { groupId: 'A', matchday: 3, home: 'South Africa', away: 'Czechia',      isoDate: '2026-06-25', kickoffTime: '2:00PM', venueCity: 'New York/New Jersey' },

  // ── Group B: Canada, Switzerland, Qatar, Bosnia and Herzegovina ──────────────
  // Matchday 1
  { groupId: 'B', matchday: 1, home: 'Canada',               away: 'Qatar',                isoDate: '2026-06-12', kickoffTime: '2:00PM', venueCity: 'Toronto' },
  { groupId: 'B', matchday: 1, home: 'Switzerland',           away: 'Bosnia and Herzegovina', isoDate: '2026-06-12', kickoffTime: '5:00PM', venueCity: 'Kansas City' },
  // Matchday 2
  { groupId: 'B', matchday: 2, home: 'Canada',               away: 'Switzerland',           isoDate: '2026-06-18', kickoffTime: '8:00PM', venueCity: 'Seattle' },
  { groupId: 'B', matchday: 2, home: 'Bosnia and Herzegovina', away: 'Qatar',               isoDate: '2026-06-19', kickoffTime: '5:00PM', venueCity: 'Dallas' },
  // Matchday 3
  { groupId: 'B', matchday: 3, home: 'Bosnia and Herzegovina', away: 'Canada',              isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'Boston' },
  { groupId: 'B', matchday: 3, home: 'Qatar',                 away: 'Switzerland',           isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'Miami' },

  // ── Group C: Brazil, Morocco, Scotland, Haiti ─────────────────────────────────
  // Matchday 1
  { groupId: 'C', matchday: 1, home: 'Brazil',    away: 'Scotland', isoDate: '2026-06-13', kickoffTime: '2:00PM', venueCity: 'New York/New Jersey' },
  { groupId: 'C', matchday: 1, home: 'Morocco',   away: 'Haiti',    isoDate: '2026-06-13', kickoffTime: '5:00PM', venueCity: 'Los Angeles' },
  // Matchday 2
  { groupId: 'C', matchday: 2, home: 'Brazil',    away: 'Morocco',  isoDate: '2026-06-19', kickoffTime: '8:00PM', venueCity: 'Atlanta' },
  { groupId: 'C', matchday: 2, home: 'Haiti',     away: 'Scotland', isoDate: '2026-06-20', kickoffTime: '2:00PM', venueCity: 'Houston' },
  // Matchday 3
  { groupId: 'C', matchday: 3, home: 'Scotland',  away: 'Morocco',  isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'Philadelphia' },
  { groupId: 'C', matchday: 3, home: 'Haiti',     away: 'Brazil',   isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'San Francisco' },

  // ── Group D: USA, Australia, Paraguay, Türkiye ────────────────────────────────
  // Matchday 1
  { groupId: 'D', matchday: 1, home: 'USA',       away: 'Türkiye',   isoDate: '2026-06-13', kickoffTime: '8:00PM', venueCity: 'Dallas' },
  { groupId: 'D', matchday: 1, home: 'Paraguay',  away: 'Australia', isoDate: '2026-06-14', kickoffTime: '2:00PM', venueCity: 'Atlanta' },
  // Matchday 2
  { groupId: 'D', matchday: 2, home: 'USA',       away: 'Paraguay',  isoDate: '2026-06-19', kickoffTime: '11:00AM', venueCity: 'Kansas City' },
  { groupId: 'D', matchday: 2, home: 'Türkiye',   away: 'Australia', isoDate: '2026-06-20', kickoffTime: '5:00PM', venueCity: 'Vancouver' },
  // Matchday 3
  { groupId: 'D', matchday: 3, home: 'Australia', away: 'USA',       isoDate: '2026-06-25', kickoffTime: '2:00PM', venueCity: 'Philadelphia' },
  { groupId: 'D', matchday: 3, home: 'Türkiye',   away: 'Paraguay',  isoDate: '2026-06-25', kickoffTime: '2:00PM', venueCity: 'Toronto' },

  // ── Group E: Germany, Ecuador, Ivory Coast, Curaçao ──────────────────────────
  // Matchday 1
  { groupId: 'E', matchday: 1, home: 'Germany',      away: 'Curaçao',     isoDate: '2026-06-14', kickoffTime: '5:00PM', venueCity: 'Philadelphia' },
  { groupId: 'E', matchday: 1, home: 'Ecuador',      away: 'Ivory Coast', isoDate: '2026-06-14', kickoffTime: '8:00PM', venueCity: 'Seattle' },
  // Matchday 2
  { groupId: 'E', matchday: 2, home: 'Germany',      away: 'Ecuador',     isoDate: '2026-06-20', kickoffTime: '8:00PM', venueCity: 'Boston' },
  { groupId: 'E', matchday: 2, home: 'Ivory Coast',  away: 'Curaçao',     isoDate: '2026-06-20', kickoffTime: '2:00PM', venueCity: 'Miami' },
  // Matchday 3
  { groupId: 'E', matchday: 3, home: 'Ecuador',      away: 'Curaçao',     isoDate: '2026-06-24', kickoffTime: '2:00PM', venueCity: 'Toronto' },
  { groupId: 'E', matchday: 3, home: 'Ivory Coast',  away: 'Germany',     isoDate: '2026-06-24', kickoffTime: '2:00PM', venueCity: 'Dallas' },

  // ── Group F: Netherlands, Japan, Sweden, Tunisia ──────────────────────────────
  // Matchday 1
  { groupId: 'F', matchday: 1, home: 'Netherlands', away: 'Sweden',  isoDate: '2026-06-15', kickoffTime: '2:00PM', venueCity: 'San Francisco' },
  { groupId: 'F', matchday: 1, home: 'Japan',       away: 'Tunisia', isoDate: '2026-06-15', kickoffTime: '5:00PM', venueCity: 'Monterrey' },
  // Matchday 2
  { groupId: 'F', matchday: 2, home: 'Netherlands', away: 'Japan',   isoDate: '2026-06-21', kickoffTime: '2:00PM', venueCity: 'Los Angeles' },
  { groupId: 'F', matchday: 2, home: 'Sweden',      away: 'Tunisia', isoDate: '2026-06-21', kickoffTime: '5:00PM', venueCity: 'Dallas' },
  // Matchday 3
  { groupId: 'F', matchday: 3, home: 'Sweden',      away: 'Japan',   isoDate: '2026-06-25', kickoffTime: '2:00PM', venueCity: 'Kansas City' },
  { groupId: 'F', matchday: 3, home: 'Tunisia',     away: 'Netherlands', isoDate: '2026-06-25', kickoffTime: '2:00PM', venueCity: 'Seattle' },

  // ── Group G: Belgium, Iran, Egypt, New Zealand ────────────────────────────────
  // Matchday 1
  { groupId: 'G', matchday: 1, home: 'Belgium',     away: 'Egypt',       isoDate: '2026-06-15', kickoffTime: '8:00PM', venueCity: 'Miami' },
  { groupId: 'G', matchday: 1, home: 'Iran',        away: 'New Zealand', isoDate: '2026-06-16', kickoffTime: '2:00PM', venueCity: 'Seattle' },
  // Matchday 2
  { groupId: 'G', matchday: 2, home: 'Belgium',     away: 'Iran',        isoDate: '2026-06-21', kickoffTime: '8:00PM', venueCity: 'Houston' },
  { groupId: 'G', matchday: 2, home: 'Egypt',       away: 'New Zealand', isoDate: '2026-06-22', kickoffTime: '2:00PM', venueCity: 'Vancouver' },
  // Matchday 3
  { groupId: 'G', matchday: 3, home: 'New Zealand', away: 'Belgium',     isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'Guadalajara' },
  { groupId: 'G', matchday: 3, home: 'Egypt',       away: 'Iran',        isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'Los Angeles' },

  // ── Group H: Spain, Uruguay, Saudi Arabia, Cape Verde ────────────────────────
  // Matchday 1
  { groupId: 'H', matchday: 1, home: 'Spain',        away: 'Uruguay',      isoDate: '2026-06-15', kickoffTime: '11:00AM', venueCity: 'Kansas City' },
  { groupId: 'H', matchday: 1, home: 'Saudi Arabia', away: 'Cape Verde',   isoDate: '2026-06-16', kickoffTime: '5:00PM', venueCity: 'Atlanta' },
  // Matchday 2
  { groupId: 'H', matchday: 2, home: 'Spain',        away: 'Saudi Arabia', isoDate: '2026-06-22', kickoffTime: '5:00PM', venueCity: 'New York/New Jersey' },
  { groupId: 'H', matchday: 2, home: 'Cape Verde',   away: 'Uruguay',      isoDate: '2026-06-22', kickoffTime: '8:00PM', venueCity: 'Dallas' },
  // Matchday 3
  { groupId: 'H', matchday: 3, home: 'Uruguay',      away: 'Saudi Arabia', isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'San Francisco' },
  { groupId: 'H', matchday: 3, home: 'Cape Verde',   away: 'Spain',        isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'Houston' },

  // ── Group I: France, Senegal, Iraq, Norway ────────────────────────────────────
  // Matchday 1
  { groupId: 'I', matchday: 1, home: 'France',   away: 'Norway',  isoDate: '2026-06-16', kickoffTime: '8:00PM', venueCity: 'Los Angeles' },
  { groupId: 'I', matchday: 1, home: 'Senegal',  away: 'Iraq',    isoDate: '2026-06-17', kickoffTime: '2:00PM', venueCity: 'Miami' },
  // Matchday 2
  { groupId: 'I', matchday: 2, home: 'France',   away: 'Senegal', isoDate: '2026-06-22', kickoffTime: '11:00AM', venueCity: 'Boston' },
  { groupId: 'I', matchday: 2, home: 'Iraq',     away: 'Norway',  isoDate: '2026-06-23', kickoffTime: '2:00PM', venueCity: 'Seattle' },
  // Matchday 3
  { groupId: 'I', matchday: 3, home: 'Norway',   away: 'Senegal', isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'Philadelphia' },
  { groupId: 'I', matchday: 3, home: 'Iraq',     away: 'France',  isoDate: '2026-06-26', kickoffTime: '2:00PM', venueCity: 'Guadalajara' },

  // ── Group J: Argentina, Algeria, Austria, Jordan ──────────────────────────────
  // Matchday 1
  { groupId: 'J', matchday: 1, home: 'Argentina', away: 'Jordan',  isoDate: '2026-06-16', kickoffTime: '11:00AM', venueCity: 'Dallas' },
  { groupId: 'J', matchday: 1, home: 'Algeria',   away: 'Austria', isoDate: '2026-06-17', kickoffTime: '5:00PM', venueCity: 'Houston' },
  // Matchday 2
  { groupId: 'J', matchday: 2, home: 'Argentina', away: 'Algeria', isoDate: '2026-06-23', kickoffTime: '5:00PM', venueCity: 'San Francisco' },
  { groupId: 'J', matchday: 2, home: 'Austria',   away: 'Jordan',  isoDate: '2026-06-23', kickoffTime: '8:00PM', venueCity: 'Toronto' },
  // Matchday 3
  { groupId: 'J', matchday: 3, home: 'Jordan',    away: 'Algeria', isoDate: '2026-06-27', kickoffTime: '2:00PM', venueCity: 'Atlanta' },
  { groupId: 'J', matchday: 3, home: 'Austria',   away: 'Argentina', isoDate: '2026-06-27', kickoffTime: '2:00PM', venueCity: 'Kansas City' },

  // ── Group K: Portugal, Colombia, Uzbekistan, DR Congo ────────────────────────
  // Matchday 1
  { groupId: 'K', matchday: 1, home: 'Portugal',   away: 'DR Congo',   isoDate: '2026-06-17', kickoffTime: '8:00PM', venueCity: 'Kansas City' },
  { groupId: 'K', matchday: 1, home: 'Colombia',   away: 'Uzbekistan', isoDate: '2026-06-18', kickoffTime: '2:00PM', venueCity: 'San Francisco' },
  // Matchday 2
  { groupId: 'K', matchday: 2, home: 'Portugal',   away: 'Colombia',   isoDate: '2026-06-23', kickoffTime: '11:00AM', venueCity: 'Dallas' },
  { groupId: 'K', matchday: 2, home: 'Uzbekistan', away: 'DR Congo',   isoDate: '2026-06-23', kickoffTime: '2:00PM', venueCity: 'Boston' },
  // Matchday 3
  { groupId: 'K', matchday: 3, home: 'DR Congo',   away: 'Colombia',   isoDate: '2026-06-27', kickoffTime: '2:00PM', venueCity: 'Miami' },
  { groupId: 'K', matchday: 3, home: 'Uzbekistan', away: 'Portugal',   isoDate: '2026-06-27', kickoffTime: '2:00PM', venueCity: 'Los Angeles' },

  // ── Group L: England, Croatia, Ghana, Panama ──────────────────────────────────
  // Matchday 1
  { groupId: 'L', matchday: 1, home: 'England',  away: 'Ghana',   isoDate: '2026-06-17', kickoffTime: '11:00AM', venueCity: 'New York/New Jersey' },
  { groupId: 'L', matchday: 1, home: 'Croatia',  away: 'Panama',  isoDate: '2026-06-17', kickoffTime: '2:00PM', venueCity: 'Vancouver' },
  // Matchday 2
  { groupId: 'L', matchday: 2, home: 'England',  away: 'Croatia', isoDate: '2026-06-23', kickoffTime: '8:00PM', venueCity: 'Miami' },
  { groupId: 'L', matchday: 2, home: 'Panama',   away: 'Ghana',   isoDate: '2026-06-24', kickoffTime: '2:00PM', venueCity: 'Houston' },
  // Matchday 3
  { groupId: 'L', matchday: 3, home: 'Ghana',    away: 'Croatia', isoDate: '2026-06-27', kickoffTime: '2:00PM', venueCity: 'Seattle' },
  { groupId: 'L', matchday: 3, home: 'Panama',   away: 'England', isoDate: '2026-06-27', kickoffTime: '2:00PM', venueCity: 'Boston' },
];

export function validateGroupSchedule(): void {
  const expectedTotal = 72;
  if (GROUP_SCHEDULE.length !== expectedTotal) {
    throw new Error(`groupSchedule: expected ${expectedTotal} fixtures, got ${GROUP_SCHEDULE.length}`);
  }

  const groupCounts = new Map<GroupId, number>();
  const teamCounts = new Map<string, number>();

  for (const fixture of GROUP_SCHEDULE) {
    groupCounts.set(fixture.groupId, (groupCounts.get(fixture.groupId) ?? 0) + 1);
    teamCounts.set(fixture.home, (teamCounts.get(fixture.home) ?? 0) + 1);
    teamCounts.set(fixture.away, (teamCounts.get(fixture.away) ?? 0) + 1);
  }

  for (const [groupId, count] of groupCounts) {
    if (count !== 6) {
      throw new Error(`groupSchedule: group ${groupId} has ${count} fixtures, expected 6`);
    }
  }

  if (groupCounts.size !== 12) {
    throw new Error(`groupSchedule: expected 12 groups, got ${groupCounts.size}`);
  }

  for (const [team, count] of teamCounts) {
    if (count !== 3) {
      throw new Error(`groupSchedule: team "${team}" appears in ${count} fixtures, expected 3`);
    }
  }

  // Verify all teams are in the correct group
  for (const fixture of GROUP_SCHEDULE) {
    const groupTeams = GROUPS[fixture.groupId];
    if (!groupTeams.includes(fixture.home)) {
      throw new Error(`groupSchedule: "${fixture.home}" is not in group ${fixture.groupId}`);
    }
    if (!groupTeams.includes(fixture.away)) {
      throw new Error(`groupSchedule: "${fixture.away}" is not in group ${fixture.groupId}`);
    }
  }
}

validateGroupSchedule();
