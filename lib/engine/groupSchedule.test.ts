import { describe, it, expect } from 'vitest';
import { GROUP_SCHEDULE, validateGroupSchedule } from './groupSchedule';
import { GROUPS } from './groups';

describe('validateGroupSchedule', () => {
  it('passes with exactly 72 fixtures', () => {
    expect(() => validateGroupSchedule()).not.toThrow();
    expect(GROUP_SCHEDULE).toHaveLength(72);
  });

  it('has 6 fixtures per group', () => {
    const counts: Record<string, number> = {};
    for (const f of GROUP_SCHEDULE) {
      counts[f.groupId] = (counts[f.groupId] ?? 0) + 1;
    }
    for (const [group, count] of Object.entries(counts)) {
      expect(count).toBe(6);
    }
    expect(Object.keys(counts)).toHaveLength(12);
  });

  it('has each team appearing in exactly 3 fixtures', () => {
    const teamCounts: Record<string, number> = {};
    for (const f of GROUP_SCHEDULE) {
      teamCounts[f.home] = (teamCounts[f.home] ?? 0) + 1;
      teamCounts[f.away] = (teamCounts[f.away] ?? 0) + 1;
    }
    for (const [team, count] of Object.entries(teamCounts)) {
      expect(count).toBe(3);
    }
  });

  it('uses canonical team names matching GROUPS', () => {
    for (const fixture of GROUP_SCHEDULE) {
      const groupTeams = GROUPS[fixture.groupId];
      expect(groupTeams).toContain(fixture.home);
      expect(groupTeams).toContain(fixture.away);
    }
  });

  it('has ISO dates within the group-stage range', () => {
    for (const f of GROUP_SCHEDULE) {
      expect(f.isoDate >= '2026-06-11').toBe(true);
      expect(f.isoDate <= '2026-06-27').toBe(true);
    }
  });
});
