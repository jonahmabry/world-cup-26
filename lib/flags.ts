// Canonical team name → flag code. Codes are ISO 3166-1 alpha-2 (lowercase), except the
// UK home nations, which use the GB sub-region codes from the flag-icons asset set
// (gb-eng / gb-sct / gb-wls). Each code maps 1:1 to a bundled SVG at public/flags/<code>.svg.
//
// Names match the canonical forms in lib/engine/groups.ts (ESPN names are normalized via
// normalizeTeamName before rendering), so lookup is a direct map access.
export const TEAM_CODES: Record<string, string> = {
  // Group A
  Mexico: 'mx',
  'South Korea': 'kr',
  'South Africa': 'za',
  Czechia: 'cz',
  // Group B
  Canada: 'ca',
  Switzerland: 'ch',
  Qatar: 'qa',
  'Bosnia and Herzegovina': 'ba',
  // Group C
  Brazil: 'br',
  Morocco: 'ma',
  Scotland: 'gb-sct',
  Haiti: 'ht',
  // Group D
  USA: 'us',
  Australia: 'au',
  Paraguay: 'py',
  Türkiye: 'tr',
  // Group E
  Germany: 'de',
  Ecuador: 'ec',
  'Ivory Coast': 'ci',
  Curaçao: 'cw',
  // Group F
  Netherlands: 'nl',
  Japan: 'jp',
  Sweden: 'se',
  Tunisia: 'tn',
  // Group G
  Belgium: 'be',
  Iran: 'ir',
  Egypt: 'eg',
  'New Zealand': 'nz',
  // Group H
  Spain: 'es',
  Uruguay: 'uy',
  'Saudi Arabia': 'sa',
  'Cape Verde': 'cv',
  // Group I
  France: 'fr',
  Senegal: 'sn',
  Iraq: 'iq',
  Norway: 'no',
  // Group J
  Argentina: 'ar',
  Algeria: 'dz',
  Austria: 'at',
  Jordan: 'jo',
  // Group K
  Portugal: 'pt',
  Colombia: 'co',
  Uzbekistan: 'uz',
  'DR Congo': 'cd',
  // Group L
  England: 'gb-eng',
  Croatia: 'hr',
  Ghana: 'gh',
  Panama: 'pa',
  // Home nation not in the 2026 draw — included for robustness.
  Wales: 'gb-wls',
};

export function flagCode(teamName: string): string | null {
  return TEAM_CODES[teamName] ?? null;
}
