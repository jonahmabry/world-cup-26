export type MatchStatus = 'scheduled' | 'in-progress' | 'final';
export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export const GROUP_IDS: GroupId[] = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export interface CardCounts {
  yellows: number;
  reds: number;
  secondYellows: number;
}

export interface MatchResult {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  groupId: GroupId;
  kickoff: string;
  homeCards: CardCounts;
  awayCards: CardCounts;
}

// Fair-play: yellow=-1, red=-3, second yellow=-3. Higher = better.
export function fairPlayScore(cards: CardCounts): number {
  return -(cards.yellows + cards.reds * 3 + cards.secondYellows * 3);
}

export interface StandingRow {
  team: string;
  groupId: GroupId;
  position: number;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  cards: CardCounts;
  fairPlay: number;
  qualStatus: 'auto' | 'best-third' | 'eliminated' | 'pending';
  tiedPendingRanking: boolean;
  provisional: boolean;
}

export interface GroupStandings {
  groupId: GroupId;
  rows: StandingRow[];
}

export type KnockoutRound = 'R32' | 'R16' | 'QF' | 'SF' | 'ThirdPlace' | 'Final';

export type BracketTeam =
  | { kind: 'team'; name: string }
  | { kind: 'tbd-pending-ranking' }
  | { kind: 'winner-of'; matchId: string }
  | { kind: 'loser-of'; matchId: string }
  | { kind: 'unknown' };

export interface BracketMatchup {
  matchId: string;
  home: BracketTeam;
  away: BracketTeam;
  homeLabel: string;
  awayLabel: string;
  round: KnockoutRound;
  slot: number;        // visual position within the round (1 = top of bracket column)
  venueCity: string;
  date: string;
  kickoffTime: string;
}

export interface Snapshot {
  groups: GroupStandings[];
  allThirds: StandingRow[];
  advancingThirds: StandingRow[];
  bracket: BracketMatchup[];
  lastUpdated: string;
  hasStaleData: boolean;
}
