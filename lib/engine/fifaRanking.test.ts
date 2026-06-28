import { describe, it, expect } from 'vitest';
import { fifaRank, UNRANKED } from './fifaRanking';

describe('fifaRank', () => {
  it('returns the ranking position for a known finalist', () => {
    expect(fifaRank('Argentina')).toBe(1);
    expect(fifaRank('France')).toBe(2);
    expect(fifaRank('England')).toBe(4);
    expect(fifaRank('Curaçao')).toBe(82);
  });

  it('lower position means better rank (Argentina beats France)', () => {
    expect(fifaRank('Argentina')).toBeLessThan(fifaRank('France'));
  });

  it('all 48 finalists have distinct positions (no ties in snapshot)', () => {
    const teams = [
      'Argentina', 'France', 'Spain', 'England', 'Brazil', 'Portugal', 'Netherlands',
      'Belgium', 'Croatia', 'Germany', 'Morocco', 'Colombia', 'Uruguay', 'USA', 'Mexico',
      'Switzerland', 'Japan', 'Senegal', 'Iran', 'Austria', 'Australia', 'South Korea',
      'Ecuador', 'Norway', 'Sweden', 'Canada', 'Egypt', 'Türkiye', 'Czechia', 'Tunisia',
      'Ivory Coast', 'Panama', 'Paraguay', 'Algeria', 'Scotland', 'Saudi Arabia', 'Iraq',
      'Uzbekistan', 'South Africa', 'Qatar', 'Jordan', 'DR Congo', 'Cape Verde', 'Ghana',
      'Bosnia and Herzegovina', 'Haiti', 'New Zealand', 'Curaçao',
    ];
    const ranks = teams.map(fifaRank);
    const unique = new Set(ranks);
    expect(unique.size).toBe(48);
  });

  it('returns UNRANKED sentinel for an unknown team name', () => {
    expect(fifaRank('Atlantis FC')).toBe(UNRANKED);
    expect(fifaRank('')).toBe(UNRANKED);
  });

  it('UNRANKED is higher than any real ranking position', () => {
    expect(UNRANKED).toBeGreaterThan(48);
  });
});
