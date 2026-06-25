import type { BracketMatchup, GroupFixture, MatchResult, MatchStatus, Phase } from '@/lib/types';
import type { GroupId } from '@/lib/types';
import { GROUP_SCHEDULE, THIRD_PLACE_SLOT_LABELS } from './groupSchedule';
import { KNOCKOUT_SCHEDULE } from './knockoutSchedule';
import { normalizeTeamName } from './groups';
import { isGroupStageComplete, lockedGroupPositions } from './clinch';
import { groupByDay } from './phases';

export type MatchRowStatus = 'final' | 'in-progress' | 'upcoming';

export interface GroupMatchRow {
  kind: 'group';
  fixture: GroupFixture;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchRowStatus;
  isoDate: string;
}

export interface KnockoutMatchRow {
  kind: 'knockout';
  matchId: string;
  homeLabel: string;
  awayLabel: string;
  homeName: string | null;  // resolved team name, or null for placeholder
  awayName: string | null;
  venueCity: string;
  kickoffTime: string;
  isoDate: string;
}

export type ScheduleMatchRow = GroupMatchRow | KnockoutMatchRow;

export interface ScheduleDaySection {
  isoDate: string;
  header: string;
  rows: ScheduleMatchRow[];
}

const GROUP_PHASES = new Set(['MD1', 'MD2', 'MD3']);
const KNOCKOUT_PHASES = new Set(['R32', 'R16', 'QF', 'SF', 'ThirdPlace', 'Final']);

// ESPN's 'scheduled' state maps to the schedule's 'upcoming' row status.
function toRowStatus(status: MatchStatus): MatchRowStatus {
  if (status === 'final') return 'final';
  if (status === 'in-progress') return 'in-progress';
  return 'upcoming';
}

// Match a MatchResult to a GroupFixture by groupId + unordered home/away pair.
function findMatchResult(
  fixture: GroupFixture,
  matches: MatchResult[],
): MatchResult | undefined {
  const normHome = normalizeTeamName(fixture.home);
  const normAway = normalizeTeamName(fixture.away);

  return matches.find(
    (m) =>
      m.groupId === fixture.groupId &&
      ((normalizeTeamName(m.homeTeam) === normHome && normalizeTeamName(m.awayTeam) === normAway) ||
        (normalizeTeamName(m.homeTeam) === normAway && normalizeTeamName(m.awayTeam) === normHome)),
  );
}

function buildGroupRows(phase: Phase, matches: MatchResult[]): GroupMatchRow[] {
  const fixtures = GROUP_SCHEDULE.filter(
    (f) => f.isoDate >= phase.startDate && f.isoDate <= phase.endDate,
  );

  return fixtures.map((fixture) => {
    const result = findMatchResult(fixture, matches);
    if (!result) {
      return { kind: 'group', fixture, homeScore: null, awayScore: null, status: 'upcoming', isoDate: fixture.isoDate };
    }

    // Result may have home/away swapped if ESPN stored it reversed
    const normHome = normalizeTeamName(fixture.home);
    const isHomeMatch = normalizeTeamName(result.homeTeam) === normHome;

    const homeScore = isHomeMatch ? result.homeScore : result.awayScore;
    const awayScore = isHomeMatch ? result.awayScore : result.homeScore;

    return {
      kind: 'group',
      fixture,
      homeScore,
      awayScore,
      status: toRowStatus(result.status),
      isoDate: fixture.isoDate,
    };
  });
}

// Parse "Winner E" → { type: 'winner', group: 'E' }
// Parse "Runner-up A" → { type: 'runner-up', group: 'A' }
function parseGroupLabel(label: string): { type: 'winner' | 'runner-up'; group: GroupId } | null {
  const winnerMatch = label.match(/^Winner ([A-L])$/);
  if (winnerMatch) return { type: 'winner', group: winnerMatch[1] as GroupId };
  const runnerMatch = label.match(/^Runner-up ([A-L])$/);
  if (runnerMatch) return { type: 'runner-up', group: runnerMatch[1] as GroupId };
  return null;
}

// Returns a display label for a knockout slot (team name or placeholder).
function resolveKnockoutSlot(
  matchup: BracketMatchup,
  isHome: boolean,
  matches: MatchResult[],
  complete: boolean,
  lockedCache: Map<GroupId, Map<number, string>>,
): { label: string; name: string | null } {
  const bracketTeam = isHome ? matchup.home : matchup.away;
  const seedLabel = isHome ? matchup.homeLabel : matchup.awayLabel;
  const matchId = matchup.matchId;

  // After group stage complete, use full bracket resolution
  if (complete) {
    if (bracketTeam.kind === 'team') {
      return { label: bracketTeam.name, name: bracketTeam.name };
    }
    if (bracketTeam.kind === 'tbd-pending-ranking') {
      return { label: seedLabel, name: null };
    }
  }

  // R32: check clinch for group winner/runner-up slots
  if (matchup.round === 'R32') {
    const parsed = parseGroupLabel(seedLabel);
    if (parsed) {
      const groupLocked = lockedCache.get(parsed.group) ?? new Map();
      const position = parsed.type === 'winner' ? 1 : 2;
      const lockedTeam = groupLocked.get(position);
      if (lockedTeam) {
        return { label: lockedTeam, name: lockedTeam };
      }
      // Convert "Winner E" → "1E", "Runner-up A" → "2A"
      const prefix = parsed.type === 'winner' ? '1' : '2';
      return { label: `${prefix}${parsed.group}`, name: null };
    }

    // Third-place slot
    if (seedLabel.startsWith('3rd Group')) {
      const setLabel = THIRD_PLACE_SLOT_LABELS[matchId];
      return { label: setLabel ?? seedLabel, name: null };
    }
  }

  // Later rounds: winner-of / loser-of placeholders
  if (bracketTeam.kind === 'winner-of') {
    return { label: `W${bracketTeam.matchId.slice(1)}`, name: null };
  }
  if (bracketTeam.kind === 'loser-of') {
    return { label: `L${bracketTeam.matchId.slice(1)}`, name: null };
  }
  if (bracketTeam.kind === 'team') {
    return { label: bracketTeam.name, name: bracketTeam.name };
  }

  return { label: seedLabel, name: null };
}

function buildKnockoutRows(
  phase: Phase,
  bracket: BracketMatchup[],
  matches: MatchResult[],
): KnockoutMatchRow[] {
  const complete = isGroupStageComplete(matches);

  // Pre-compute locked positions per group (only relevant for R32)
  const lockedCache = new Map<GroupId, Map<number, string>>();
  if (!complete && phase.key === 'R32') {
    const groupIds: GroupId[] = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    for (const groupId of groupIds) {
      lockedCache.set(groupId, lockedGroupPositions(groupId, matches));
    }
  }

  const phaseMatchups = bracket.filter((m) => {
    const sched = KNOCKOUT_SCHEDULE[m.matchId];
    if (!sched) return false;
    return sched.isoDate >= phase.startDate && sched.isoDate <= phase.endDate;
  });

  return phaseMatchups.map((matchup) => {
    const sched = KNOCKOUT_SCHEDULE[matchup.matchId]!;
    const homeSlot = resolveKnockoutSlot(matchup, true, matches, complete, lockedCache);
    const awaySlot = resolveKnockoutSlot(matchup, false, matches, complete, lockedCache);

    return {
      kind: 'knockout',
      matchId: matchup.matchId,
      homeLabel: homeSlot.label,
      awayLabel: awaySlot.label,
      homeName: homeSlot.name,
      awayName: awaySlot.name,
      venueCity: sched.venueCity,
      kickoffTime: sched.kickoffTime,
      isoDate: sched.isoDate,
    };
  });
}

export function buildSchedule(
  phase: Phase,
  matches: MatchResult[],
  bracket: BracketMatchup[],
): ScheduleDaySection[] {
  let rows: ScheduleMatchRow[];

  if (GROUP_PHASES.has(phase.key)) {
    rows = buildGroupRows(phase, matches);
  } else if (KNOCKOUT_PHASES.has(phase.key)) {
    rows = buildKnockoutRows(phase, bracket, matches);
  } else {
    rows = [];
  }

  const sorted = [...rows].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  return groupByDay(sorted).map(({ isoDate, header, items }) => ({ isoDate, header, rows: items }));
}
