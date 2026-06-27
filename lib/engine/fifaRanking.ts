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
  France: 1,
  Argentina: 2,
  Spain: 3,
  England: 4,
  Brazil: 5,
  Morocco: 6,
  Netherlands: 7,
  Portugal: 8,
  Mexico: 9,
  Belgium: 10,
  Colombia: 11,
  Germany: 12,
  Croatia: 13,
  USA: 15,
  Switzerland: 16,
  Japan: 17,
  Senegal: 18,
  Uruguay: 19,
  Iran: 21,
  Austria: 22,
  Norway: 23,
  Ecuador: 24,
  Egypt: 26,
  Türkiye: 27,
  Australia: 28,
  Algeria: 29,
  'Ivory Coast': 30,
  'South Korea': 31,
  Canada: 32,
  Sweden: 36,
  Paraguay: 37,
  Scotland: 41,
  Panama: 42,
  'DR Congo': 46,
  Czechia: 48,
  'South Africa': 54,
  Uzbekistan: 57,
  Tunisia: 58,
  'Saudi Arabia': 59,
  Qatar: 60,
  'Bosnia and Herzegovina': 61,
  Iraq: 63,
  'Cape Verde': 64,
  Ghana: 65,
  Jordan: 72,
  Curaçao: 82,
  'New Zealand': 86,
  Haiti: 88,
};

// Sentinel for names absent from the snapshot — they sort last and the affected
// tie falls back to `tiedPendingRanking` rather than being silently ordered.
export const UNRANKED = 999;

/** FIFA World Ranking position for a team (lower is better). Unknown → UNRANKED. */
export function fifaRank(team: string): number {
  return FIFA_RANKING[team] ?? UNRANKED;
}
