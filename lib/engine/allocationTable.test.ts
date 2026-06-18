import { describe, it, expect } from 'vitest';
import { GROUP_IDS, type GroupId } from '@/lib/types';
import { getAllocation, allocationKey, isAllocationComplete, type MatchSlot } from './allocationTable';

// Official 2026 R32 "Winner vs Best 3rd place" group sets, per match.
// Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
// A column-mislabeling regression (third-place teams slotted into the wrong match)
// shows up as a group landing outside its match's allowed set — that is exactly the
// Spain-in-M74 bug these tests guard against.
const ALLOWED: Record<MatchSlot, string> = {
  M74: 'ABCDF', // Winner E
  M77: 'CDFGH', // Winner I
  M79: 'CEFHI', // Winner A
  M80: 'EHIJK', // Winner L
  M81: 'BEFIJ', // Winner D
  M82: 'AEHIJ', // Winner G
  M85: 'EFGIJ', // Winner B
  M87: 'DEIJL', // Winner K
};
const SLOTS = Object.keys(ALLOWED) as MatchSlot[];

// All C(12,8) = 495 combinations of 8 advancing third-place groups.
function* combinations(groups: GroupId[], k: number): Generator<GroupId[]> {
  if (k === 0) { yield []; return; }
  for (let i = 0; i <= groups.length - k; i++) {
    for (const rest of combinations(groups.slice(i + 1), k - 1)) {
      yield [groups[i], ...rest];
    }
  }
}
const ALL_COMBOS = [...combinations([...GROUP_IDS], 8)];

describe('allocationTable', () => {
  it('has all 495 entries', () => {
    expect(isAllocationComplete()).toBe(true);
    expect(ALL_COMBOS).toHaveLength(495);
  });

  it('every entry assigns each group to a match within its official allowed set', () => {
    for (const combo of ALL_COMBOS) {
      const alloc = getAllocation(combo)!;
      expect(alloc).toBeTruthy();
      for (const slot of SLOTS) {
        expect(ALLOWED[slot]).toContain(alloc[slot]);
      }
    }
  });

  it('places group H only in valid slots (regression: H must never reach M74)', () => {
    const hSlots = SLOTS.filter((s) => ALLOWED[s].includes('H'));
    expect(hSlots).toEqual(['M77', 'M79', 'M80', 'M82']);
    for (const combo of ALL_COMBOS) {
      if (!combo.includes('H')) continue;
      expect(getAllocation(combo)!.M74).not.toBe('H');
    }
  });

  it('row 1: EFGHIJKL — groups E,F,G,H,I,J,K,L qualify', () => {
    const result = getAllocation(['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);
    expect(result).toEqual({
      M74: 'F', M77: 'G', M79: 'E', M80: 'K',
      M81: 'I', M82: 'H', M85: 'J', M87: 'L',
    });
  });

  it('row 495: ABCDEFGH — groups A,B,C,D,E,F,G,H qualify', () => {
    const result = getAllocation(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    expect(result).toEqual({
      M74: 'C', M77: 'F', M79: 'H', M80: 'E',
      M81: 'B', M82: 'A', M85: 'G', M87: 'D',
    });
  });

  it('input order does not matter — key is always sorted', () => {
    const forward = getAllocation(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    const reversed = getAllocation(['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']);
    expect(forward).toEqual(reversed);
  });

  it('returns null for an unknown combination', () => {
    // Passing only 7 groups yields a key not in the table
    expect(getAllocation(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as GroupId[])).toBeNull();
  });

  it('each allocation is a permutation of its 8 qualifying groups', () => {
    // Spot-check row 2: DFGHIJKL
    const groups: Parameters<typeof getAllocation>[0] = ['D', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const result = getAllocation(groups);
    expect(result).not.toBeNull();
    const slotValues = Object.values(result!).sort();
    const groupsSorted = [...groups].sort();
    expect(slotValues).toEqual(groupsSorted);
  });

  it('allocationKey sorts groups canonically', () => {
    expect(allocationKey(['L', 'A', 'G', 'B'])).toBe('ABGL');
    expect(allocationKey(['A', 'B', 'G', 'L'])).toBe('ABGL');
  });
});
