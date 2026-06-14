import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs');

import fs from 'fs';
import type { MatchResult } from '@/lib/types';
import {
  readDiskCache,
  writeMatchToDisk,
  readBackfillWatermark,
  updateBackfillWatermark,
} from './disk';

function makeMatch(id: string, status: MatchResult['status'], kickoff = '2026-06-11T20:00:00Z'): MatchResult {
  return {
    id,
    homeTeam: 'Mexico',
    awayTeam: 'South Korea',
    homeScore: 1,
    awayScore: 0,
    status,
    groupId: 'A',
    kickoff,
    homeCards: { yellows: 0, reds: 0, secondYellows: 0 },
    awayCards: { yellows: 0, reds: 0, secondYellows: 0 },
  };
}

describe('disk cache', () => {
  let fileContent: string | null = null;

  beforeEach(() => {
    fileContent = null;
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      if (fileContent === null) {
        const err = new Error('ENOENT') as NodeJS.ErrnoException;
        err.code = 'ENOENT';
        throw err;
      }
      return fileContent;
    });
    vi.mocked(fs.writeFileSync).mockImplementation((...args: unknown[]) => {
      fileContent = args[1] as string;
    });
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
  });

  describe('write-once guard', () => {
    it('stores a match on first write', () => {
      const m = makeMatch('m1', 'final');
      writeMatchToDisk(m);
      expect(readDiskCache()).toHaveLength(1);
      expect(readDiskCache()[0].id).toBe('m1');
    });

    it('does not overwrite a match already on disk', () => {
      const m = makeMatch('m1', 'final');
      writeMatchToDisk(m);
      writeMatchToDisk({ ...m, homeScore: 99 }); // second write with different score
      expect(readDiskCache()[0].homeScore).toBe(1); // original value preserved
    });

    it('accepts matches with different IDs', () => {
      writeMatchToDisk(makeMatch('m1', 'final'));
      writeMatchToDisk(makeMatch('m2', 'final'));
      expect(readDiskCache()).toHaveLength(2);
    });
  });

  describe('updateBackfillWatermark', () => {
    it('advances the watermark past a date when all matches are final', () => {
      const matches = [makeMatch('m1', 'final', '2026-06-11T20:00:00Z')];
      updateBackfillWatermark(matches, '20260611', '20260611');
      expect(readBackfillWatermark()).toBe('20260611');
    });

    it('does not advance past a date that has any non-final match', () => {
      const matches = [
        makeMatch('m1', 'final', '2026-06-11T20:00:00Z'),
        makeMatch('m2', 'in-progress', '2026-06-12T18:00:00Z'),
      ];
      updateBackfillWatermark(matches, '20260611', '20260612');
      // Day 12 is not fully final, so watermark stops at day 11
      expect(readBackfillWatermark()).toBe('20260611');
    });

    it('advances through empty days (no matches scheduled)', () => {
      const matches = [
        makeMatch('m1', 'final', '2026-06-11T20:00:00Z'),
        makeMatch('m2', 'final', '2026-06-13T18:00:00Z'),
      ];
      // Day 12 has no matches — passes through freely
      updateBackfillWatermark(matches, '20260611', '20260613');
      expect(readBackfillWatermark()).toBe('20260613');
    });

    it('does not write to disk if the watermark did not change', () => {
      const matches = [makeMatch('m1', 'final', '2026-06-11T20:00:00Z')];
      updateBackfillWatermark(matches, '20260611', '20260611');
      const writeCount = vi.mocked(fs.writeFileSync).mock.calls.length;
      updateBackfillWatermark(matches, '20260611', '20260611'); // same watermark
      expect(vi.mocked(fs.writeFileSync).mock.calls.length).toBe(writeCount); // no extra write
    });

    it('watermark written in one call is readable in a subsequent call (survives restart)', () => {
      const matches = [makeMatch('m1', 'final', '2026-06-11T20:00:00Z')];
      updateBackfillWatermark(matches, '20260611', '20260611');
      // Simulate restart: readBackfillWatermark reads from the same persisted fileContent
      expect(readBackfillWatermark()).toBe('20260611');
    });
  });
});
