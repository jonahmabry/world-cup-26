// Frozen FIFA/Coca-Cola Men's World Ranking snapshot — the official Step-3 group
// tiebreaker for the 2026 Competition Regulations (replaces the old drawing of lots).
//
// The published ranking is frozen for the duration of a World Cup (FIFA does not
// republish mid-tournament — e.g. the 2022 edition published four days AFTER the
// final), so a committed snapshot is equivalent to scraping during the tournament,
// without a fragile network dependency in the standings hot path.
//
// Keys MUST match the canonical team names in `lib/engine/groups.ts` (GROUPS).
// Lower position = better. All 48 finalists have a distinct position so the
// tiebreaker is always decisive.
//
// ⚠️ Snapshot — verify/regenerate against the pre-tournament edition at
//   https://inside.fifa.com/fifa-world-ranking/men
// A live, projection-driven ranking is a separate later feature (`live-ranking-bracket`),
// deliberately NOT used here.

const FIFA_RANKING: Record<string, number> = {
  Argentina: 1,
  France: 2,
  Spain: 3,
  England: 4,
  Brazil: 5,
  Morocco: 6,
  Portugal: 7,
  Netherlands: 8,
  Germany: 9,
  Belgium: 10,
  Mexico: 11,
  Colombia: 12,
  Croatia: 13,
  USA: 14,
  Japan: 16,
  Switzerland: 17,
  Uruguay: 18,
  Senegal: 19,
  Iran: 21,
  Norway: 22,
  Austria: 23,
  'South Korea': 25,
  Australia: 26,
  Egypt: 27,
  Algeria: 28,
  Ecuador: 29,
  'Ivory Coast': 30,
  Canada: 31,
  Türkiye: 32,
  Sweden: 36,
  Paraguay: 37,
  Scotland: 41,
  Panama: 42,
  Czechia: 43,
  'DR Congo': 47,
  Tunisia: 56,
  Uzbekistan: 57,
  'Saudi Arabia': 58,
  Iraq: 59,
  'South Africa': 60,
  Qatar: 61,
  'Bosnia and Herzegovina': 62,
  'Cape Verde': 64,
  Ghana: 65,
  Jordan: 72,
  Curaçao: 81,
  'New Zealand': 84,
  Haiti: 88,
};

// Sentinel for names absent from the snapshot — they sort last and the affected
// tie falls back to `tiedPendingRanking` rather than being silently ordered.
export const UNRANKED = 999;

/** FIFA World Ranking position for a team (lower is better). Unknown → UNRANKED. */
export function fifaRank(team: string): number {
  return FIFA_RANKING[team] ?? UNRANKED;
}
