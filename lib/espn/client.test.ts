import { describe, it, expect, vi, afterEach } from 'vitest';
import type { MatchResult } from '@/lib/types';
import { fetchScoreboardRange, formatDate, detectNewlyFinished, EspnError } from './client';
import scoreboardFixture from './__fixtures__/scoreboard.json';

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeEvent(id: string, groupNote: string, homeTeam: string, awayTeam: string, state: string, kickoff = '2026-06-11T20:00:00Z') {
  return {
    id,
    date: kickoff,
    status: { type: { state } },
    competitions: [
      {
        altGameNote: groupNote,
        competitors: [
          { homeAway: 'home', team: { displayName: homeTeam, abbreviation: homeTeam.slice(0, 3).toUpperCase(), id: '1' }, score: '1' },
          { homeAway: 'away', team: { displayName: awayTeam, abbreviation: awayTeam.slice(0, 3).toUpperCase(), id: '2' }, score: '0' },
        ],
        details: [],
      },
    ],
  };
}

describe('fetchScoreboardRange', () => {
  it('builds the ?dates=START-END query and parses a multi-day fixture into matches', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          makeEvent('m1', 'Group A', 'Mexico', 'South Korea', 'post', '2026-06-11T20:00:00Z'),
          makeEvent('m2', 'Group B', 'Canada', 'Switzerland', 'post', '2026-06-12T18:00:00Z'),
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const results = await fetchScoreboardRange('20260611', '20260612');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('?dates=20260611-20260612'),
      expect.any(Object),
    );
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ id: 'm1', homeTeam: 'Mexico', awayTeam: 'South Korea', status: 'final', groupId: 'A' });
    expect(results[1]).toMatchObject({ id: 'm2', homeTeam: 'Canada', awayTeam: 'Switzerland', status: 'final', groupId: 'B' });
  });

  it('returns an empty list when the range contains no matches', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    }));

    const results = await fetchScoreboardRange('20260701', '20260705');
    expect(results).toHaveLength(0);
  });

  it('throws EspnError on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(fetchScoreboardRange('20260611', '20260612')).rejects.toThrow(EspnError);
  });

  it('throws EspnError when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network timeout')));

    await expect(fetchScoreboardRange('20260611', '20260612')).rejects.toThrow(EspnError);
  });
});

describe('parseEvent and parseCards — via scoreboard fixture', () => {
  it('parses a final match with correct scores and status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => scoreboardFixture,
    }));
    const results = await fetchScoreboardRange('20260611', '20260611');

    const mexico = results.find((r) => r.id === 'fix001')!;
    expect(mexico).toBeDefined();
    expect(mexico.homeTeam).toBe('Mexico');
    expect(mexico.awayTeam).toBe('South Korea');
    expect(mexico.homeScore).toBe(2);
    expect(mexico.awayScore).toBe(1);
    expect(mexico.status).toBe('final');
    expect(mexico.groupId).toBe('A');
  });

  it('parses card details: red card for home team, yellow card for away team', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => scoreboardFixture,
    }));
    const results = await fetchScoreboardRange('20260611', '20260611');

    const mexico = results.find((r) => r.id === 'fix001')!;
    expect(mexico.homeCards.reds).toBe(1);
    expect(mexico.homeCards.yellows).toBe(0);
    expect(mexico.awayCards.yellows).toBe(1);
    expect(mexico.awayCards.reds).toBe(0);
  });

  it('parses an in-progress match with correct status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => scoreboardFixture,
    }));
    const results = await fetchScoreboardRange('20260611', '20260611');

    const canada = results.find((r) => r.id === 'fix002')!;
    expect(canada.status).toBe('in-progress');
    expect(canada.groupId).toBe('B');
  });

  it('parses second yellow card as secondYellows', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => scoreboardFixture,
    }));
    const results = await fetchScoreboardRange('20260611', '20260611');

    // fix002: Switzerland (away, id t4) has a "Second Yellow Card"
    const canada = results.find((r) => r.id === 'fix002')!;
    expect(canada.awayCards.secondYellows).toBe(1);
    expect(canada.awayCards.reds).toBe(0);
    expect(canada.awayCards.yellows).toBe(0);
  });

  it('parses a scheduled match with status scheduled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => scoreboardFixture,
    }));
    const results = await fetchScoreboardRange('20260611', '20260611');

    const brazil = results.find((r) => r.id === 'fix003')!;
    expect(brazil.status).toBe('scheduled');
    expect(brazil.groupId).toBe('C');
  });

  it('skips events without a valid group note', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          makeEvent('mx1', 'Knockout Round', 'Mexico', 'Brazil', 'post'),
        ],
      }),
    }));
    const results = await fetchScoreboardRange('20260611', '20260611');
    expect(results).toHaveLength(0);
  });
});

interface KnockoutOpts {
  state?: string;
  homeScore?: string;
  awayScore?: string;
  homeWinner?: boolean;
  awayWinner?: boolean;
  homeShootout?: string | number;
  awayShootout?: string | number;
}

function makeKnockoutEvent(id: string, note: string, homeTeam: string, awayTeam: string, opts: KnockoutOpts = {}) {
  const home: Record<string, unknown> = {
    homeAway: 'home',
    team: { displayName: homeTeam, abbreviation: homeTeam.slice(0, 3).toUpperCase(), id: '1' },
    score: opts.homeScore ?? '1',
  };
  const away: Record<string, unknown> = {
    homeAway: 'away',
    team: { displayName: awayTeam, abbreviation: awayTeam.slice(0, 3).toUpperCase(), id: '2' },
    score: opts.awayScore ?? '0',
  };
  if (opts.homeWinner !== undefined) home.winner = opts.homeWinner;
  if (opts.awayWinner !== undefined) away.winner = opts.awayWinner;
  if (opts.homeShootout !== undefined) home.shootoutScore = opts.homeShootout;
  if (opts.awayShootout !== undefined) away.shootoutScore = opts.awayShootout;
  return {
    id,
    date: '2026-06-28T19:00:00Z',
    status: { type: { state: opts.state ?? 'post' } },
    competitions: [{ altGameNote: note, competitors: [home, away], details: [] }],
  };
}

describe('parseEvent — knockout matches', () => {
  async function parseOne(event: ReturnType<typeof makeKnockoutEvent>) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ events: [event] }) }));
    const results = await fetchScoreboardRange('20260628', '20260628');
    return results;
  }

  it('returns a knockout match with null groupId and the parsed round', async () => {
    const results = await parseOne(
      makeKnockoutEvent('m73', 'FIFA World Cup, Round of 32', 'South Africa', 'Canada', {
        homeScore: '0',
        awayScore: '1',
        awayWinner: true,
      }),
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 'm73',
      homeTeam: 'South Africa',
      awayTeam: 'Canada',
      groupId: null,
      round: 'R32',
      status: 'final',
      winner: 'away',
    });
  });

  it('maps each knockout round note to its KnockoutRound', async () => {
    const cases: Array<[string, string]> = [
      ['FIFA World Cup, Round of 32', 'R32'],
      ['FIFA World Cup, Round of 16', 'R16'],
      ['FIFA World Cup, Quarterfinal', 'QF'],
      ['FIFA World Cup, Semifinal', 'SF'],
      ['FIFA World Cup, Third Place', 'ThirdPlace'],
      ['FIFA World Cup, Final', 'Final'],
    ];
    for (const [note, round] of cases) {
      const results = await parseOne(makeKnockoutEvent('k', note, 'Spain', 'France'));
      expect(results[0]?.round).toBe(round);
      expect(results[0]?.groupId).toBeNull();
    }
  });

  it('skips an event that resolves to neither a group nor a known round', async () => {
    const results = await parseOne(makeKnockoutEvent('x', 'Some Friendly Match', 'Spain', 'France'));
    expect(results).toHaveLength(0);
  });

  it('captures the winner from the ESPN per-competitor flag even when the score is level', async () => {
    const results = await parseOne(
      makeKnockoutEvent('m', 'FIFA World Cup, Round of 16', 'Brazil', 'Argentina', {
        homeScore: '1',
        awayScore: '1',
        awayWinner: true,
        homeShootout: '2',
        awayShootout: '4',
      }),
    );
    expect(results[0]).toMatchObject({ winner: 'away', homeShootout: 2, awayShootout: 4 });
  });

  it('parses a numeric shootoutScore defensively', async () => {
    const results = await parseOne(
      makeKnockoutEvent('m', 'FIFA World Cup, Quarterfinal', 'Spain', 'France', {
        homeScore: '0',
        awayScore: '0',
        homeWinner: true,
        homeShootout: 5,
        awayShootout: 3,
      }),
    );
    expect(results[0]).toMatchObject({ winner: 'home', homeShootout: 5, awayShootout: 3 });
  });

  it('returns a knockout match with null shootout when no penalty data is present', async () => {
    const results = await parseOne(
      makeKnockoutEvent('m', 'FIFA World Cup, Round of 32', 'Spain', 'France', {
        homeScore: '2',
        awayScore: '1',
        homeWinner: true,
      }),
    );
    expect(results[0]).toMatchObject({ winner: 'home', homeShootout: null, awayShootout: null });
  });
});

describe('detectNewlyFinished', () => {
  const zero = { yellows: 0, reds: 0, secondYellows: 0 };
  function makeResult(id: string, status: MatchResult['status']): MatchResult {
    return {
      id, homeTeam: 'Mexico', awayTeam: 'South Korea',
      homeScore: 1, awayScore: 0, status, groupId: 'A',
      kickoff: '2026-06-11T20:00:00Z',
      homeCards: zero, awayCards: zero,
    };
  }

  it('returns IDs that transitioned from scheduled to final', () => {
    const prev = [makeResult('m1', 'scheduled'), makeResult('m2', 'final')];
    const curr = [makeResult('m1', 'final'), makeResult('m2', 'final')];
    expect(detectNewlyFinished(prev, curr)).toEqual(['m1']);
  });

  it('returns IDs that transitioned from in-progress to final', () => {
    const prev = [makeResult('m1', 'in-progress')];
    const curr = [makeResult('m1', 'final')];
    expect(detectNewlyFinished(prev, curr)).toEqual(['m1']);
  });

  it('returns a newly appeared final match not in previous list', () => {
    const curr = [makeResult('m1', 'final')];
    expect(detectNewlyFinished([], curr)).toEqual(['m1']);
  });

  it('returns empty when no match transitioned to final', () => {
    const prev = [makeResult('m1', 'in-progress')];
    const curr = [makeResult('m1', 'in-progress')];
    expect(detectNewlyFinished(prev, curr)).toEqual([]);
  });

  it('already-final matches that remain final are not reported', () => {
    const prev = [makeResult('m1', 'final')];
    const curr = [makeResult('m1', 'final')];
    expect(detectNewlyFinished(prev, curr)).toEqual([]);
  });
});

describe('formatDate', () => {
  it('formats a Date as YYYYMMDD using UTC', () => {
    expect(formatDate(new Date('2026-06-11T00:00:00Z'))).toBe('20260611');
    expect(formatDate(new Date('2026-07-19T23:59:59Z'))).toBe('20260719');
  });
});
