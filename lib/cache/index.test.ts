import { describe, it, expect, vi, afterEach } from 'vitest';
import type { MatchResult } from '@/lib/types';

vi.mock('./disk');
vi.mock('./memory');

import { readDiskCache } from './disk';
import { getLiveMatches } from './memory';
import { getMergedResults } from './index';

afterEach(() => {
  vi.clearAllMocks();
});

function makeMatch(id: string, status: MatchResult['status'] = 'final'): MatchResult {
  return {
    id, homeTeam: 'Mexico', awayTeam: 'South Korea',
    homeScore: 1, awayScore: 0, status, groupId: 'A',
    kickoff: '2026-06-11T20:00:00Z',
    homeCards: { yellows: 0, reds: 0, secondYellows: 0 },
    awayCards: { yellows: 0, reds: 0, secondYellows: 0 },
  };
}

describe('getMergedResults', () => {
  it('returns disk matches when no live matches exist', () => {
    vi.mocked(readDiskCache).mockReturnValue([makeMatch('m1')]);
    vi.mocked(getLiveMatches).mockReturnValue([]);

    const results = getMergedResults();
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('m1');
  });

  it('appends live matches not already on disk', () => {
    vi.mocked(readDiskCache).mockReturnValue([makeMatch('m1')]);
    vi.mocked(getLiveMatches).mockReturnValue([makeMatch('m2', 'in-progress')]);

    const results = getMergedResults();
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.id).sort()).toEqual(['m1', 'm2']);
  });

  it('disk entry wins when the same ID appears in both disk and live', () => {
    const diskMatch = { ...makeMatch('m1', 'final'), homeScore: 2 };
    const liveMatch = { ...makeMatch('m1', 'in-progress'), homeScore: 1 };
    vi.mocked(readDiskCache).mockReturnValue([diskMatch]);
    vi.mocked(getLiveMatches).mockReturnValue([liveMatch]);

    const results = getMergedResults();
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('final');
    expect(results[0].homeScore).toBe(2);
  });

  it('returns empty when both disk and live are empty', () => {
    vi.mocked(readDiskCache).mockReturnValue([]);
    vi.mocked(getLiveMatches).mockReturnValue([]);

    expect(getMergedResults()).toHaveLength(0);
  });

  it('returns only disk entries when all live IDs are already on disk', () => {
    const match = makeMatch('m1', 'final');
    vi.mocked(readDiskCache).mockReturnValue([match]);
    vi.mocked(getLiveMatches).mockReturnValue([{ ...match, status: 'in-progress' }]);

    const results = getMergedResults();
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('final');
  });
});
