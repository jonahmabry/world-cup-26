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
