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
  // Matchday 1 (Jun 11–17)
  { groupId: 'A', matchday: 1, home: 'Mexico',      away: 'South Africa', isoDate: '2026-06-11', kickoffTime: '2:00PM', venueCity: 'Mexico City' },
  { groupId: 'A', matchday: 1, home: 'South Korea', away: 'Czechia',      isoDate: '2026-06-11', kickoffTime: '9:00PM', venueCity: 'Guadalajara' },

  { groupId: 'B', matchday: 1, home: 'Canada', away: 'Bosnia and Herzegovina', isoDate: '2026-06-12', kickoffTime: '2:00PM', venueCity: 'Toronto' },
  { groupId: 'D', matchday: 1, home: 'USA',    away: 'Paraguay',               isoDate: '2026-06-12', kickoffTime: '8:00PM', venueCity: 'Los Angeles' },

  { groupId: 'B', matchday: 1, home: 'Qatar',     away: 'Switzerland', isoDate: '2026-06-13', kickoffTime: '2:00PM',  venueCity: 'San Francisco' },
  { groupId: 'C', matchday: 1, home: 'Brazil',    away: 'Morocco',     isoDate: '2026-06-13', kickoffTime: '5:00PM',  venueCity: 'New York/New Jersey' },
  { groupId: 'C', matchday: 1, home: 'Haiti',     away: 'Scotland',    isoDate: '2026-06-13', kickoffTime: '8:00PM',  venueCity: 'Boston' },
  { groupId: 'D', matchday: 1, home: 'Australia', away: 'Türkiye',     isoDate: '2026-06-13', kickoffTime: '11:00PM', venueCity: 'Vancouver' },

  { groupId: 'E', matchday: 1, home: 'Germany',     away: 'Curaçao', isoDate: '2026-06-14', kickoffTime: '12:00PM', venueCity: 'Houston' },
  { groupId: 'F', matchday: 1, home: 'Netherlands', away: 'Japan',   isoDate: '2026-06-14', kickoffTime: '3:00PM',  venueCity: 'Dallas' },
  { groupId: 'E', matchday: 1, home: 'Ivory Coast', away: 'Ecuador', isoDate: '2026-06-14', kickoffTime: '6:00PM',  venueCity: 'Philadelphia' },
  { groupId: 'F', matchday: 1, home: 'Sweden',      away: 'Tunisia', isoDate: '2026-06-14', kickoffTime: '9:00PM',  venueCity: 'Monterrey' },

  { groupId: 'H', matchday: 1, home: 'Spain',        away: 'Cape Verde',  isoDate: '2026-06-15', kickoffTime: '11:00AM', venueCity: 'Atlanta' },
  { groupId: 'G', matchday: 1, home: 'Belgium',      away: 'Egypt',       isoDate: '2026-06-15', kickoffTime: '2:00PM',  venueCity: 'Seattle' },
  { groupId: 'H', matchday: 1, home: 'Saudi Arabia', away: 'Uruguay',     isoDate: '2026-06-15', kickoffTime: '5:00PM',  venueCity: 'Miami' },
  { groupId: 'G', matchday: 1, home: 'Iran',         away: 'New Zealand', isoDate: '2026-06-15', kickoffTime: '8:00PM',  venueCity: 'Los Angeles' },

  { groupId: 'I', matchday: 1, home: 'France',    away: 'Senegal', isoDate: '2026-06-16', kickoffTime: '2:00PM',  venueCity: 'New York/New Jersey' },
  { groupId: 'I', matchday: 1, home: 'Iraq',      away: 'Norway',  isoDate: '2026-06-16', kickoffTime: '5:00PM',  venueCity: 'Boston' },
  { groupId: 'J', matchday: 1, home: 'Argentina', away: 'Algeria', isoDate: '2026-06-16', kickoffTime: '8:00PM',  venueCity: 'Kansas City' },
  { groupId: 'J', matchday: 1, home: 'Austria',   away: 'Jordan',  isoDate: '2026-06-16', kickoffTime: '11:00PM', venueCity: 'San Francisco' },

  { groupId: 'K', matchday: 1, home: 'Portugal',   away: 'DR Congo', isoDate: '2026-06-17', kickoffTime: '12:00PM', venueCity: 'Houston' },
  { groupId: 'L', matchday: 1, home: 'England',    away: 'Croatia',  isoDate: '2026-06-17', kickoffTime: '3:00PM',  venueCity: 'Dallas' },
  { groupId: 'L', matchday: 1, home: 'Ghana',      away: 'Panama',   isoDate: '2026-06-17', kickoffTime: '6:00PM',  venueCity: 'Toronto' },
  { groupId: 'K', matchday: 1, home: 'Uzbekistan', away: 'Colombia', isoDate: '2026-06-17', kickoffTime: '9:00PM',  venueCity: 'Mexico City' },


  // Matchday 2 (Jun 18–23)
  { groupId: 'A', matchday: 2, home: 'Czechia',     away: 'South Africa',           isoDate: '2026-06-18', kickoffTime: '11:00AM', venueCity: 'Atlanta' },
  { groupId: 'B', matchday: 2, home: 'Switzerland', away: 'Bosnia and Herzegovina', isoDate: '2026-06-18', kickoffTime: '2:00PM',  venueCity: 'Los Angeles' },
  { groupId: 'B', matchday: 2, home: 'Canada',      away: 'Qatar',                  isoDate: '2026-06-18', kickoffTime: '5:00PM',  venueCity: 'Vancouver' },
  { groupId: 'A', matchday: 2, home: 'Mexico',      away: 'South Korea',            isoDate: '2026-06-18', kickoffTime: '8:00PM',  venueCity: 'Guadalajara' },

  { groupId: 'D', matchday: 2, home: 'USA',      away: 'Australia', isoDate: '2026-06-19', kickoffTime: '2:00PM',  venueCity: 'Seattle' },
  { groupId: 'C', matchday: 2, home: 'Scotland', away: 'Morocco',   isoDate: '2026-06-19', kickoffTime: '5:00PM',  venueCity: 'Boston' },
  { groupId: 'C', matchday: 2, home: 'Brazil',   away: 'Haiti',     isoDate: '2026-06-19', kickoffTime: '7:30PM',  venueCity: 'Philadelphia' },
  { groupId: 'D', matchday: 2, home: 'Türkiye',  away: 'Paraguay',  isoDate: '2026-06-19', kickoffTime: '10:00PM', venueCity: 'San Francisco' },

  { groupId: 'F', matchday: 2, home: 'Netherlands', away: 'Sweden',      isoDate: '2026-06-20', kickoffTime: '12:00PM', venueCity: 'Houston' },
  { groupId: 'E', matchday: 2, home: 'Germany',     away: 'Ivory Coast', isoDate: '2026-06-20', kickoffTime: '3:00PM',  venueCity: 'Toronto' },
  { groupId: 'E', matchday: 2, home: 'Ecuador',     away: 'Curaçao',     isoDate: '2026-06-20', kickoffTime: '7:00PM',  venueCity: 'Kansas City' },
  { groupId: 'F', matchday: 2, home: 'Tunisia',     away: 'Japan',       isoDate: '2026-06-20', kickoffTime: '11:00PM', venueCity: 'Monterrey' },

  { groupId: 'H', matchday: 2, home: 'Spain',       away: 'Saudi Arabia', isoDate: '2026-06-21', kickoffTime: '11:00AM', venueCity: 'Atlanta' },
  { groupId: 'G', matchday: 2, home: 'Belgium',     away: 'Iran',         isoDate: '2026-06-21', kickoffTime: '2:00PM',  venueCity: 'Los Angeles' },
  { groupId: 'H', matchday: 2, home: 'Uruguay',     away: 'Cape Verde',   isoDate: '2026-06-21', kickoffTime: '5:00PM',  venueCity: 'Miami' },
  { groupId: 'G', matchday: 2, home: 'New Zealand', away: 'Egypt',        isoDate: '2026-06-21', kickoffTime: '8:00PM',  venueCity: 'Vancouver' },

  { groupId: 'J', matchday: 2, home: 'Argentina', away: 'Austria', isoDate: '2026-06-22', kickoffTime: '12:00PM', venueCity: 'Dallas' },
  { groupId: 'I', matchday: 2, home: 'France',    away: 'Iraq',    isoDate: '2026-06-22', kickoffTime: '4:00PM',  venueCity: 'Philadelphia' },
  { groupId: 'I', matchday: 2, home: 'Norway',    away: 'Senegal', isoDate: '2026-06-22', kickoffTime: '7:00PM',  venueCity: 'New York/New Jersey' },
  { groupId: 'J', matchday: 2, home: 'Jordan',    away: 'Algeria', isoDate: '2026-06-22', kickoffTime: '10:00PM', venueCity: 'San Francisco' },

  { groupId: 'K', matchday: 2, home: 'Portugal', away: 'Uzbekistan', isoDate: '2026-06-23', kickoffTime: '12:00PM', venueCity: 'Houston' },
  { groupId: 'L', matchday: 2, home: 'England',  away: 'Ghana',      isoDate: '2026-06-23', kickoffTime: '3:00PM', venueCity: 'Boston' },
  { groupId: 'L', matchday: 2, home: 'Panama',   away: 'Croatia',    isoDate: '2026-06-23', kickoffTime: '6:00PM', venueCity: 'Toronto' },
  { groupId: 'K', matchday: 2, home: 'Colombia', away: 'DR Congo',   isoDate: '2026-06-23', kickoffTime: '9:00PM', venueCity: 'Guadalajara' },


  // Matchday 2 (Jun 24–27)
  { groupId: 'B', matchday: 3, home: 'Bosnia and Herzegovina', away: 'Qatar',       isoDate: '2026-06-24', kickoffTime: '2:00PM', venueCity: 'Seattle' },
  { groupId: 'B', matchday: 3, home: 'Switzerland',            away: 'Canada',      isoDate: '2026-06-24', kickoffTime: '2:00PM', venueCity: 'Vancouver' },
  { groupId: 'C', matchday: 3, home: 'Morocco',                away: 'Haiti',       isoDate: '2026-06-24', kickoffTime: '5:00PM', venueCity: 'Atlanta' },
  { groupId: 'C', matchday: 3, home: 'Scotland',               away: 'Brazil',      isoDate: '2026-06-24', kickoffTime: '5:00PM', venueCity: 'Miami' },
  { groupId: 'A', matchday: 3, home: 'Czechia',                away: 'Mexico',      isoDate: '2026-06-24', kickoffTime: '8:00PM', venueCity: 'Mexico City' },
  { groupId: 'A', matchday: 3, home: 'South Africa',           away: 'South Korea', isoDate: '2026-06-24', kickoffTime: '8:00PM', venueCity: 'Monterrey' },

  { groupId: 'E', matchday: 3, home: 'Curaçao',  away: 'Ivory Coast', isoDate: '2026-06-25', kickoffTime: '3:00PM', venueCity: 'Philadelphia' },
  { groupId: 'E', matchday: 3, home: 'Ecuador',  away: 'Germany',     isoDate: '2026-06-25', kickoffTime: '3:00PM', venueCity: 'New York/New Jersey' },
  { groupId: 'F', matchday: 3, home: 'Japan',    away: 'Sweden',      isoDate: '2026-06-25', kickoffTime: '6:00PM', venueCity: 'Dallas' },
  { groupId: 'F', matchday: 3, home: 'Tunisia',  away: 'Netherlands', isoDate: '2026-06-25', kickoffTime: '6:00PM', venueCity: 'Kansas City' },
  { groupId: 'D', matchday: 3, home: 'Paraguay', away: 'Australia',   isoDate: '2026-06-25', kickoffTime: '9:00PM', venueCity: 'San Francisco' },
  { groupId: 'D', matchday: 3, home: 'Türkiye',  away: 'USA',         isoDate: '2026-06-25', kickoffTime: '9:00PM', venueCity: 'Los Angeles' },

  { groupId: 'I', matchday: 3, home: 'Norway',      away: 'France',       isoDate: '2026-06-26', kickoffTime: '2:00PM',  venueCity: 'Boston' },
  { groupId: 'I', matchday: 3, home: 'Senegal',     away: 'Iraq',         isoDate: '2026-06-26', kickoffTime: '2:00PM',  venueCity: 'Toronto' },
  { groupId: 'H', matchday: 3, home: 'Cape Verde',  away: 'Saudi Arabia', isoDate: '2026-06-26', kickoffTime: '7:00PM',  venueCity: 'Houston' },
  { groupId: 'H', matchday: 3, home: 'Uruguay',     away: 'Spain',        isoDate: '2026-06-26', kickoffTime: '7:00PM',  venueCity: 'Guadalajara' },
  { groupId: 'G', matchday: 3, home: 'Egypt',       away: 'Iran',         isoDate: '2026-06-26', kickoffTime: '10:00PM', venueCity: 'Seattle' },
  { groupId: 'G', matchday: 3, home: 'New Zealand', away: 'Belgium',      isoDate: '2026-06-26', kickoffTime: '10:00PM', venueCity: 'Vancouver' },

  { groupId: 'L', matchday: 3, home: 'Croatia',  away: 'Ghana',      isoDate: '2026-06-27', kickoffTime: '4:00PM', venueCity: 'Philadelphia' },
  { groupId: 'L', matchday: 3, home: 'Panama',   away: 'England',    isoDate: '2026-06-27', kickoffTime: '4:00PM', venueCity: 'New York/New Jersey' },
  { groupId: 'K', matchday: 3, home: 'Colombia', away: 'Portugal',   isoDate: '2026-06-27', kickoffTime: '6:30PM', venueCity: 'Miami' },
  { groupId: 'K', matchday: 3, home: 'DR Congo', away: 'Uzbekistan', isoDate: '2026-06-27', kickoffTime: '6:30PM', venueCity: 'Atlanta' },
  { groupId: 'J', matchday: 3, home: 'Algeria',  away: 'Austria',    isoDate: '2026-06-27', kickoffTime: '9:00PM', venueCity: 'Kansas City' },
  { groupId: 'J', matchday: 3, home: 'Jordan',   away: 'Argentina',  isoDate: '2026-06-27', kickoffTime: '9:00PM', venueCity: 'Dallas' }
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
