import type { CardCounts, GroupId, MatchResult, MatchStatus } from '@/lib/types';
import { isValidGroup } from '@/lib/engine/groups';

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

  const groupId = parseGroup(comp);
  if (!groupId) return null;

  const home = comp.competitors?.find((c) => c.homeAway === 'home');
  const away = comp.competitors?.find((c) => c.homeAway === 'away');
  if (!home || !away) return null;

  const status = parseStatus(event);

  return {
    id: event.id,
    homeTeam: home.team.displayName,
    awayTeam: away.team.displayName,
    homeScore: parseInt(home.score ?? '0', 10) || 0,
    awayScore: parseInt(away.score ?? '0', 10) || 0,
    status,
    groupId,
    kickoff: event.date,
    homeCards: parseCards(comp, home.team.id),
    awayCards: parseCards(comp, away.team.id),
  };
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
