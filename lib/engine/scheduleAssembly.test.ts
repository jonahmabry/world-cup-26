import { describe, it, expect } from 'vitest';
import type { MatchResult, BracketMatchup, Phase } from '@/lib/types';
import { buildSchedule } from './scheduleAssembly';

function makeResult(
  groupId: MatchResult['groupId'],
  home: string,
  away: string,
  homeScore: number,
  awayScore: number,
  status: MatchResult['status'] = 'final',
): MatchResult {
  return {
    id: `${groupId}-${home}-${away}`,
    homeTeam: home,
    awayTeam: away,
    homeScore,
    awayScore,
    status,
    groupId,
    kickoff: '2026-06-11T20:00:00Z',
    homeCards: { yellows: 0, reds: 0, secondYellows: 0 },
    awayCards: { yellows: 0, reds: 0, secondYellows: 0 },
  };
}

const MD1: Phase = { key: 'MD1', label: 'Matchday 1', startDate: '2026-06-11', endDate: '2026-06-17' };
const MD2: Phase = { key: 'MD2', label: 'Matchday 2', startDate: '2026-06-18', endDate: '2026-06-23' };
const R32: Phase = { key: 'R32', label: 'Round of 32', startDate: '2026-06-28', endDate: '2026-07-03' };

describe('buildSchedule — group phase fixture join', () => {
  it('attaches a score when the result matches home/away exactly', () => {
    const match = makeResult('A', 'Mexico', 'South Africa', 2, 0);
    const sections = buildSchedule(MD1, [match], []);
    const allRows = sections.flatMap((s) => s.rows);
    const row = allRows.find(
      (r) => r.kind === 'group' && r.fixture.home === 'Mexico' && r.fixture.away === 'South Africa',
    );
    expect(row).toBeDefined();
    expect(row?.kind).toBe('group');
    if (row?.kind === 'group') {
      expect(row.homeScore).toBe(2);
      expect(row.awayScore).toBe(0);
      expect(row.status).toBe('final');
    }
  });

  it('joins a score when ESPN name variant Bosnia-Herzegovina is used', () => {
    // Fixture: home='Switzerland', away='Bosnia and Herzegovina' (canonical)
    // ESPN result: homeTeam='Bosnia-Herzegovina' (non-canonical), awayTeam='Switzerland'
    // Normalization must still match them via the unordered pair.
    const match = makeResult('B', 'Bosnia-Herzegovina', 'Switzerland', 1, 2);
    const sections = buildSchedule(MD2, [match], []);
    const allRows = sections.flatMap((s) => s.rows);
    const row = allRows.find(
      (r) =>
        r.kind === 'group' &&
        r.fixture.home === 'Switzerland' &&
        r.fixture.away === 'Bosnia and Herzegovina',
    );
    // fixture.home='Switzerland'; match.homeTeam='Bosnia-Herzegovina' → normHome≠normFixtureHome
    // so isHomeMatch=false → homeScore=result.awayScore=2 (Switzerland), awayScore=result.homeScore=1 (Bosnia)
    if (row?.kind === 'group') {
      expect(row.homeScore).toBe(2); // Switzerland
      expect(row.awayScore).toBe(1); // Bosnia
      expect(row.status).toBe('final');
    } else {
      expect.fail('Expected a group row for Switzerland vs Bosnia and Herzegovina');
    }
  });

  it('handles reversed home/away in the ESPN result', () => {
    // Fixture: home=Switzerland away=Bosnia; ESPN result: home=Bosnia away=Switzerland
    const match = makeResult('B', 'Bosnia and Herzegovina', 'Switzerland', 2, 1);
    const sections = buildSchedule(MD2, [match], []);
    const allRows = sections.flatMap((s) => s.rows);
    const row = allRows.find(
      (r) =>
        r.kind === 'group' &&
        r.fixture.home === 'Switzerland' &&
        r.fixture.away === 'Bosnia and Herzegovina',
    );
    // fixture.home=Switzerland, match.home=Bosnia → isHomeMatch=false, so home/away swapped
    if (row?.kind === 'group') {
      expect(row.homeScore).toBe(1); // Switzerland's score (away in ESPN)
      expect(row.awayScore).toBe(2); // Bosnia's score (home in ESPN)
    } else {
      expect.fail('Expected a group row for Switzerland vs Bosnia');
    }
  });

  it('marks an unplayed fixture as upcoming with no score', () => {
    const sections = buildSchedule(MD1, [], []);
    const allRows = sections.flatMap((s) => s.rows);
    const row = allRows.find(
      (r) => r.kind === 'group' && r.fixture.home === 'Mexico' && r.fixture.away === 'South Africa',
    );
    if (row?.kind === 'group') {
      expect(row.status).toBe('upcoming');
      expect(row.homeScore).toBeNull();
      expect(row.awayScore).toBeNull();
    } else {
      expect.fail('Expected a group row');
    }
  });

  it('groups rows by calendar day in date order', () => {
    const sections = buildSchedule(MD1, [], []);
    const dates = sections.map((s) => s.isoDate);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });
});

describe('buildSchedule — R32 placeholders', () => {
  const emptyBracket: BracketMatchup[] = [];

  it('shows placeholders when no bracket matches are provided', () => {
    const sections = buildSchedule(R32, [], emptyBracket);
    expect(sections).toHaveLength(0);
  });

  it('shows seed placeholder when group position is not clinched', () => {
    // Minimal bracket with a winner-of winner slot (not group stage)
    const matchup: BracketMatchup = {
      matchId: 'M73',
      home: { kind: 'team', name: 'Netherlands' },
      away: { kind: 'team', name: 'Japan' },
      homeLabel: 'Runner-up A',
      awayLabel: 'Runner-up B',
      round: 'R32',
      slot: 3,
      venueCity: 'Los Angeles',
      date: 'JUN 28',
      kickoffTime: '2:00PM',
    };

    const sections = buildSchedule(R32, [], [matchup]);
    const allRows = sections.flatMap((s) => s.rows);
    // Group stage not complete, position not locked → placeholder
    const row = allRows.find((r) => r.kind === 'knockout' && r.matchId === 'M73');
    if (row?.kind === 'knockout') {
      // Runner-up A → "2A", Runner-up B → "2B"
      expect(row.homeLabel).toBe('2A');
      expect(row.awayLabel).toBe('2B');
      expect(row.homeName).toBeNull();
      expect(row.awayName).toBeNull();
    } else {
      expect.fail('Expected a knockout row for M73');
    }
  });
});
