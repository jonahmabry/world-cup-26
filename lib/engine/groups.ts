import type { GroupId } from '@/lib/types';

// ESPN displayName → canonical name used in GROUPS below.
const ESPN_TEAM_NAMES: Record<string, string> = {
  'United States': 'USA',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Congo DR': 'DR Congo',
};

export function normalizeTeamName(name: string): string {
  return ESPN_TEAM_NAMES[name] ?? name;
}

// 2026 FIFA World Cup group membership — confirmed from the December 5, 2025 draw.
export const GROUPS: Record<GroupId, string[]> = {
  A: ['Mexico', 'South Korea', 'South Africa', 'Czechia'],
  B: ['Canada', 'Switzerland', 'Qatar', 'Bosnia and Herzegovina'],
  C: ['Brazil', 'Morocco', 'Scotland', 'Haiti'],
  D: ['USA', 'Australia', 'Paraguay', 'Türkiye'],
  E: ['Germany', 'Ecuador', 'Ivory Coast', 'Curaçao'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Iran', 'Egypt', 'New Zealand'],
  H: ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Colombia', 'Uzbekistan', 'DR Congo'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

const teamToGroup: Map<string, GroupId> = new Map();
for (const [g, teams] of Object.entries(GROUPS)) {
  for (const t of teams) teamToGroup.set(t, g as GroupId);
}

export function getTeamGroup(teamName: string): GroupId | null {
  return teamToGroup.get(teamName) ?? null;
}

export function isValidGroup(g: string): g is GroupId {
  return g in GROUPS;
}
