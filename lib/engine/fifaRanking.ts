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
  Croatia: 14,
  USA: 15,
  Senegal: 16,
  Japan: 17,
  Uruguay: 18,
  Switzerland: 19,
  Austria: 21,
  Australia: 22,
  Iran: 23,
  'South Korea': 24,
  Türkiye: 26,
  Norway: 27,
  Canada: 28,
  Ecuador: 29,
  Egypt: 30,
  'Ivory Coast': 31,
  Algeria: 32,
  Sweden: 34,
  Scotland: 37,
  Panama: 40,
  Paraguay: 42,
  'DR Congo': 43,
  Czechia: 44,
  Tunisia: 54,
  Uzbekistan: 55,
  Qatar: 58,
  'Saudi Arabia': 59,
  Iraq: 60,
  'South Africa': 61,
  'Cape Verde': 63,
  'Bosnia and Herzegovina': 64,
  Ghana: 65,
  Jordan: 68,
  'New Zealand': 82,
  Curaçao: 83,
  Haiti: 85,
};

// Sentinel for names absent from the snapshot — they sort last and the affected
// tie falls back to `tiedPendingRanking` rather than being silently ordered.
export const UNRANKED = 999;

/** FIFA World Ranking position for a team (lower is better). Unknown → UNRANKED. */
export function fifaRank(team: string): number {
  return FIFA_RANKING[team] ?? UNRANKED;
}
