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
  Portugal: 6,
  Netherlands: 7,
  Belgium: 8,
  Croatia: 9,
  Germany: 10,
  Morocco: 11,
  Colombia: 12,
  Uruguay: 13,
  USA: 14,
  Mexico: 15,
  Switzerland: 16,
  Japan: 17,
  Senegal: 18,
  Iran: 19,
  Austria: 20,
  Australia: 21,
  'South Korea': 22,
  Ecuador: 23,
  Norway: 24,
  Sweden: 25,
  Canada: 26,
  Egypt: 27,
  Türkiye: 28,
  Czechia: 29,
  Tunisia: 30,
  'Ivory Coast': 31,
  Panama: 32,
  Paraguay: 33,
  Algeria: 34,
  Scotland: 35,
  'Saudi Arabia': 36,
  Iraq: 37,
  Uzbekistan: 38,
  'South Africa': 39,
  Qatar: 40,
  Jordan: 41,
  'DR Congo': 42,
  'Cape Verde': 43,
  Ghana: 44,
  'Bosnia and Herzegovina': 45,
  Haiti: 46,
  'New Zealand': 47,
  Curaçao: 48,
};

// Sentinel for names absent from the snapshot — they sort last and the affected
// tie falls back to `tiedPendingRanking` rather than being silently ordered.
export const UNRANKED = 999;

/** FIFA World Ranking position for a team (lower is better). Unknown → UNRANKED. */
export function fifaRank(team: string): number {
  return FIFA_RANKING[team] ?? UNRANKED;
}
