import { describe, it, expect } from 'vitest';
import { seedFromLabel } from './Bracket';

describe('seedFromLabel', () => {
  it('maps a group winner to position 1 + group letter', () => {
    expect(seedFromLabel('Winner F')).toBe('1F');
    expect(seedFromLabel('Winner A')).toBe('1A');
  });

  it('maps a runner-up to position 2 + group letter', () => {
    expect(seedFromLabel('Runner-up A')).toBe('2A');
    expect(seedFromLabel('Runner-up L')).toBe('2L');
  });

  it('maps a third-place qualifier to position 3 + group letter', () => {
    expect(seedFromLabel('3rd Group C')).toBe('3C');
    expect(seedFromLabel('3rd Group H')).toBe('3H');
  });

  it('returns null for winner-of and placeholder labels (no seed)', () => {
    expect(seedFromLabel('Winner of M74')).toBeNull();
    expect(seedFromLabel('Annex C pending')).toBeNull();
    expect(seedFromLabel('')).toBeNull();
    expect(seedFromLabel('Winner M')).toBeNull(); // M is not a valid group letter (A–L)
  });
});
