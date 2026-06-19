// R32 fixed matchup structure (16 matches).
// Fixed slots (no third-place team): M73, M75, M76, M78, M83, M84, M86, M88.
// Third-place slots: M74, M77, M79, M80, M81, M82, M85, M87.
//
// Source: ESPN 2026 World Cup format article + FIFA official match schedule.

import type { BracketMatchup, BracketTeam, GroupId, GroupStandings } from '@/lib/types';
import type { ThirdsRanking } from './thirds';
import { getAllocation, type MatchSlot, type ThirdAllocation } from './allocationTable';
import { KNOCKOUT_SCHEDULE } from './knockoutSchedule';

function winner(g: GroupStandings): BracketTeam {
  const row = g.rows[0];
  if (!row) return { kind: 'unknown' };
  if (row.tiedPendingRanking) return { kind: 'tbd-pending-ranking' };
  return { kind: 'team', name: row.team };
}

function runnerUp(g: GroupStandings): BracketTeam {
  const row = g.rows[1];
  if (!row) return { kind: 'unknown' };
  if (row.tiedPendingRanking) return { kind: 'tbd-pending-ranking' };
  return { kind: 'team', name: row.team };
}

function thirdFrom(groupId: GroupId, thirds: ThirdsRanking): BracketTeam {
  const row = thirds.advancing.find((r) => r.groupId === groupId);
  if (!row) return { kind: 'unknown' };
  if (row.tiedPendingRanking) return { kind: 'tbd-pending-ranking' };
  return { kind: 'team', name: row.team };
}

function byGroup(groups: GroupStandings[], id: GroupId): GroupStandings {
  return groups.find((g) => g.groupId === id)!;
}

function slotPair(
  match: MatchSlot,
  homeLabel: string,
  thirds: ThirdsRanking,
  allocation: ThirdAllocation | null,
): Pick<BracketMatchup, 'away' | 'homeLabel' | 'awayLabel'> {
  if (!allocation) {
    return { away: { kind: 'unknown' }, homeLabel, awayLabel: 'Annex C pending' };
  }
  const groupId = allocation[match];
  return {
    away: thirdFrom(groupId, thirds),
    homeLabel,
    awayLabel: `3rd Group ${groupId}`,
  };
}

function mNum(id: string) {
  return parseInt(id.slice(1), 10);
}

export function computeBracket(
  groups: GroupStandings[],
  thirds: ThirdsRanking,
): BracketMatchup[] {
  const g = (id: GroupId) => byGroup(groups, id);
  const allocation = getAllocation(thirds.advancingGroupIds as GroupId[]);

  // Build R32 team-slotted matchups, then enrich with schedule metadata.
  const r32Raw = [
    // Fixed matchups (no third-place team)
    { matchId: 'M73', home: runnerUp(g('A')), away: runnerUp(g('B')), homeLabel: 'Runner-up A', awayLabel: 'Runner-up B' },
    { matchId: 'M75', home: winner(g('F')),   away: runnerUp(g('C')), homeLabel: 'Winner F',    awayLabel: 'Runner-up C' },
    { matchId: 'M76', home: winner(g('C')),   away: runnerUp(g('F')), homeLabel: 'Winner C',    awayLabel: 'Runner-up F' },
    { matchId: 'M78', home: runnerUp(g('E')), away: runnerUp(g('I')), homeLabel: 'Runner-up E', awayLabel: 'Runner-up I' },
    { matchId: 'M83', home: runnerUp(g('K')), away: runnerUp(g('L')), homeLabel: 'Runner-up K', awayLabel: 'Runner-up L' },
    { matchId: 'M84', home: winner(g('H')),   away: runnerUp(g('J')), homeLabel: 'Winner H',    awayLabel: 'Runner-up J' },
    { matchId: 'M86', home: winner(g('J')),   away: runnerUp(g('H')), homeLabel: 'Winner J',    awayLabel: 'Runner-up H' },
    { matchId: 'M88', home: runnerUp(g('D')), away: runnerUp(g('G')), homeLabel: 'Runner-up D', awayLabel: 'Runner-up G' },
    // Third-place slots
    { matchId: 'M74', home: winner(g('E')), ...slotPair('M74', 'Winner E', thirds, allocation) },
    { matchId: 'M77', home: winner(g('I')), ...slotPair('M77', 'Winner I', thirds, allocation) },
    { matchId: 'M79', home: winner(g('A')), ...slotPair('M79', 'Winner A', thirds, allocation) },
    { matchId: 'M80', home: winner(g('L')), ...slotPair('M80', 'Winner L', thirds, allocation) },
    { matchId: 'M81', home: winner(g('D')), ...slotPair('M81', 'Winner D', thirds, allocation) },
    { matchId: 'M82', home: winner(g('G')), ...slotPair('M82', 'Winner G', thirds, allocation) },
    { matchId: 'M85', home: winner(g('B')), ...slotPair('M85', 'Winner B', thirds, allocation) },
    { matchId: 'M87', home: winner(g('K')), ...slotPair('M87', 'Winner K', thirds, allocation) },
  ];

  const r32: BracketMatchup[] = r32Raw.map((m) => {
    const sched = KNOCKOUT_SCHEDULE[m.matchId]!;
    return { ...m, round: sched.round, slot: sched.slot, venueCity: sched.venueCity, date: sched.date, kickoffTime: sched.kickoffTime };
  });

  // Build R16, QF, SF, Final matchups as winner-of slots from the schedule tree.
  // The third-place play-off (M103) is excluded here — it is fed by losers, not winners.
  const laterRounds: BracketMatchup[] = Object.entries(KNOCKOUT_SCHEDULE)
    .filter(([, entry]) => entry.feedsFrom !== null && entry.round !== 'ThirdPlace')
    .sort(([a], [b]) => mNum(a) - mNum(b))
    .map(([matchId, entry]) => {
      const [feedA, feedB] = entry.feedsFrom!;
      return {
        matchId,
        home: { kind: 'winner-of' as const, matchId: feedA },
        away: { kind: 'winner-of' as const, matchId: feedB },
        homeLabel: `Winner of ${feedA}`,
        awayLabel: `Winner of ${feedB}`,
        round: entry.round,
        slot: entry.slot,
        venueCity: entry.venueCity,
        date: entry.date,
        kickoffTime: entry.kickoffTime,
      };
    });

  // Third-place play-off (M103): both slots are the LOSERS of the two Semi-finals.
  const tpEntry = KNOCKOUT_SCHEDULE['M103']!;
  const [tpFeedA, tpFeedB] = tpEntry.feedsFrom!;
  const thirdPlace: BracketMatchup = {
    matchId: 'M103',
    home: { kind: 'loser-of', matchId: tpFeedA },
    away: { kind: 'loser-of', matchId: tpFeedB },
    homeLabel: `Loser of ${tpFeedA}`,
    awayLabel: `Loser of ${tpFeedB}`,
    round: tpEntry.round,
    slot: tpEntry.slot,
    venueCity: tpEntry.venueCity,
    date: tpEntry.date,
    kickoffTime: tpEntry.kickoffTime,
  };

  return [...r32, ...laterRounds, thirdPlace];
}
