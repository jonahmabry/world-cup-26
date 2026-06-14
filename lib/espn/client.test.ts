import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchScoreboardRange, formatDate, EspnError } from './client';

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

describe('formatDate', () => {
  it('formats a Date as YYYYMMDD using UTC', () => {
    expect(formatDate(new Date('2026-06-11T00:00:00Z'))).toBe('20260611');
    expect(formatDate(new Date('2026-07-19T23:59:59Z'))).toBe('20260719');
  });
});
