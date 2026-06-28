import type { CardCounts, GroupId, KnockoutRound, MatchResult, MatchStatus } from '@/lib/types';
import { isValidGroup, normalizeTeamName } from '@/lib/engine/groups';

const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

export class EspnError extends Error {
  constructor(
    message: string,
    public readonly isStale = true,
  ) {
    super(message);
    this.name = 'EspnError';
  }
}

interface EspnTeam {
  displayName: string;
  abbreviation: string;
  id: string;
}

interface EspnCompetitor {
  homeAway: 'home' | 'away';
  team: EspnTeam;
  score?: string;
  winner?: boolean;
  // ESPN's penalty-shootout field shape is not yet observed in live data; parse defensively.
  shootoutScore?: string | number;
}

interface EspnDetail {
  type?: { text?: string };
  team?: { id?: string; displayName?: string };
}

interface EspnCompetition {
  competitors?: EspnCompetitor[];
  details?: EspnDetail[];
  altGameNote?: string;
  notes?: Array<{ headline?: string }>;
}

interface EspnEvent {
  id: string;
  date: string;
  status?: {
    type?: {
      state?: string;
      shortDetail?: string;
    };
  };
  competitions?: EspnCompetition[];
}

function parseStatus(event: EspnEvent): MatchStatus {
  const state = event.status?.type?.state;
  if (state === 'post') return 'final';
  if (state === 'in') return 'in-progress';
  return 'scheduled';
}

function parseGroup(comp: EspnCompetition): GroupId | null {
  const note =
    comp.altGameNote ??
    comp.notes?.[0]?.headline ??
    '';
  const m = note.match(/Group\s+([A-L])\b/i);
  if (!m) return null;
  const g = m[1].toUpperCase();
  return isValidGroup(g) ? g : null;
}

// Maps an ESPN knockout game note (e.g. "FIFA World Cup, Round of 32") to a KnockoutRound.
// Returns null when the note identifies no known knockout round.
function parseRound(comp: EspnCompetition): KnockoutRound | null {
  const note = (comp.altGameNote ?? comp.notes?.[0]?.headline ?? '').toLowerCase();
  if (!note) return null;
  if (note.includes('round of 32')) return 'R32';
  if (note.includes('round of 16')) return 'R16';
  if (note.includes('quarter')) return 'QF';
  if (note.includes('semi')) return 'SF';
  if (note.includes('third place') || note.includes('3rd place')) return 'ThirdPlace';
  if (note.includes('final')) return 'Final';
  return null;
}

// Defensively reads a competitor's penalty-shootout score. ESPN's exact field is
// unverified in live data, so accept string or number and ignore anything non-numeric.
function parseShootout(competitor: EspnCompetitor | undefined): number | null {
  if (!competitor || competitor.shootoutScore == null) return null;
  const n =
    typeof competitor.shootoutScore === 'number'
      ? competitor.shootoutScore
      : parseInt(competitor.shootoutScore, 10);
  return Number.isFinite(n) ? n : null;
}

function parseCards(comp: EspnCompetition, teamId: string): CardCounts {
  const counts: CardCounts = { yellows: 0, reds: 0, secondYellows: 0 };
  for (const detail of comp.details ?? []) {
    if (detail.team?.id !== teamId) continue;
    const text = (detail.type?.text ?? '').toLowerCase();
    if (text.includes('second yellow') || text.includes('yellow red')) {
      counts.secondYellows++;
    } else if (text.includes('red card')) {
      counts.reds++;
    } else if (text.includes('yellow card')) {
      counts.yellows++;
    }
  }
  return counts;
}

function parseEvent(event: EspnEvent): MatchResult | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;

  // A match is either a group-stage match (has a "Group X" note) or a knockout
  // match (has a recognizable round note). Skip events that resolve to neither.
  const groupId = parseGroup(comp);
  const round = groupId ? undefined : (parseRound(comp) ?? undefined);
  if (!groupId && !round) return null;

  const home = comp.competitors?.find((c) => c.homeAway === 'home');
  const away = comp.competitors?.find((c) => c.homeAway === 'away');
  if (!home || !away) return null;

  const status = parseStatus(event);

  const homeScore = parseInt(home.score ?? '0', 10) || 0;
  const awayScore = parseInt(away.score ?? '0', 10) || 0;

  // Winner from ESPN's per-competitor flag (authoritative incl. penalties); fall
  // back to the regulation score when the flag is absent on a final match.
  let winner: 'home' | 'away' | null = null;
  if (home.winner === true) winner = 'home';
  else if (away.winner === true) winner = 'away';
  else if (status === 'final' && homeScore !== awayScore) {
    winner = homeScore > awayScore ? 'home' : 'away';
  }

  const homeShootout = parseShootout(home);
  const awayShootout = parseShootout(away);

  return {
    id: event.id,
    homeTeam: normalizeTeamName(home.team.displayName),
    awayTeam: normalizeTeamName(away.team.displayName),
    homeScore,
    awayScore,
    status,
    groupId: groupId ?? null,
    round,
    homeShootout,
    awayShootout,
    winner,
    kickoff: event.date,
    homeCards: parseCards(comp, home.team.id),
    awayCards: parseCards(comp, away.team.id),
  };
}

export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// Fetch all World Cup matches within an inclusive date range.
// If ESPN ever truncates a range response, fall back to per-day loops via fetchScoreboard(dateYYYYMMDD).
export async function fetchScoreboardRange(
  startYYYYMMDD: string,
  endYYYYMMDD: string,
): Promise<MatchResult[]> {
  const url = `${SCOREBOARD_URL}?dates=${startYYYYMMDD}-${endYYYYMMDD}`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 0 } });
  } catch (err) {
    throw new EspnError(`ESPN range fetch failed: ${String(err)}`);
  }

  if (!res.ok) {
    throw new EspnError(`ESPN returned ${res.status}`);
  }

  let body: { events?: EspnEvent[] };
  try {
    body = await res.json();
  } catch {
    throw new EspnError('ESPN returned non-JSON');
  }

  const results: MatchResult[] = [];
  for (const event of body.events ?? []) {
    const match = parseEvent(event);
    if (match) results.push(match);
  }
  return results;
}

export async function fetchScoreboard(dateYYYYMMDD?: string): Promise<MatchResult[]> {
  const url = dateYYYYMMDD
    ? `${SCOREBOARD_URL}?dates=${dateYYYYMMDD}`
    : SCOREBOARD_URL;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 0 } });
  } catch (err) {
    throw new EspnError(`ESPN fetch failed: ${String(err)}`);
  }

  if (!res.ok) {
    throw new EspnError(`ESPN returned ${res.status}`);
  }

  let body: { events?: EspnEvent[] };
  try {
    body = await res.json();
  } catch {
    throw new EspnError('ESPN returned non-JSON');
  }

  const results: MatchResult[] = [];
  for (const event of body.events ?? []) {
    const match = parseEvent(event);
    if (match) results.push(match);
  }
  return results;
}

// Returns match IDs that transitioned to 'final' since the last known set.
export function detectNewlyFinished(
  previous: MatchResult[],
  current: MatchResult[],
): string[] {
  const prevById = new Map(previous.map((m) => [m.id, m]));
  const newlyFinal: string[] = [];
  for (const match of current) {
    if (match.status !== 'final') continue;
    const prev = prevById.get(match.id);
    if (!prev || prev.status !== 'final') newlyFinal.push(match.id);
  }
  return newlyFinal;
}
