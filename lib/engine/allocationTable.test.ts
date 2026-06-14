import { describe, it, expect } from 'vitest';
import { getAllocation, allocationKey, isAllocationComplete } from './allocationTable';

describe('allocationTable', () => {
  it('has all 495 entries', () => {
    expect(isAllocationComplete()).toBe(true);
  });

  it('row 1: EFGHIJKL — groups E,F,G,H,I,J,K,L qualify', () => {
    const result = getAllocation(['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);
    expect(result).toEqual({
      M74: 'E', M77: 'J', M79: 'I', M80: 'F',
      M81: 'H', M82: 'G', M85: 'L', M87: 'K',
    });
  });

  it('row 495: ABCDEFGH — groups A,B,C,D,E,F,G,H qualify', () => {
    const result = getAllocation(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    expect(result).toEqual({
      M74: 'H', M77: 'G', M79: 'B', M80: 'C',
      M81: 'A', M82: 'F', M85: 'D', M87: 'E',
    });
  });

  it('input order does not matter — key is always sorted', () => {
    const forward = getAllocation(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    const reversed = getAllocation(['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']);
    expect(forward).toEqual(reversed);
  });

  it('returns null for an unknown combination', () => {
    // Passing only 7 groups yields a key not in the table
    expect(getAllocation(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as any)).toBeNull();
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
