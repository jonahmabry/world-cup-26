## 1. Types

- [x] 1.1 Add `matches: MatchResult[]` to the `Snapshot` interface in `lib/types.ts`.
- [x] 1.2 Add an ISO `date` field (e.g. `isoDate: string`, `YYYY-MM-DD`) to `KnockoutMatchEntry`
  in `lib/engine/knockoutSchedule.ts`, alongside the existing display `date`.
- [x] 1.3 Add schedule/phase types to `lib/types.ts`: a `PhaseKey` union
  (`'MD1'|'MD2'|'MD3'|'R32'|'R16'|'QF'|'SF'|'ThirdPlace'|'Final'`) and a `Phase`
  (`{ key: PhaseKey; label: string; startDate: string; endDate: string }`), plus a
  `GroupFixture` type (`{ groupId; matchday: 1|2|3; home; away; isoDate; kickoffTime; venueCity }`).

## 2. Group-stage fixture data

- [x] 2.1 Create `lib/engine/groupSchedule.ts` exporting `GROUP_SCHEDULE: GroupFixture[]` — all
  72 fixtures from the official FIFA 2026 schedule, using **canonical** team names (matching
  `GROUPS` in `lib/engine/groups.ts`), ISO local date, CDT `kickoffTime`, host city, matchday.
- [x] 2.2 Source the exact date/time/venue/matchup for each of the 72 fixtures from the official
  schedule (data-accuracy task — cross-check against the reference schedule).
- [x] 2.3 Add the 8 third-place R32 slot set labels (e.g. `3ABCDF`) as static constants for the
  placeholder rendering, sourced from the official R32 bracket.
- [x] 2.4 Add `validateGroupSchedule()` (run at module load, mirroring `validateSchedule()` in
  `knockoutSchedule.ts`): assert 72 fixtures, 6 per group across 12 groups, each team in exactly
  3 fixtures; throw on any deviation.

## 3. Knockout schedule ISO dates

- [x] 3.1 Populate the new ISO `date` for every entry in `KNOCKOUT_SCHEDULE` so it matches the
  existing display date (e.g. `JUN 30` → `2026-06-30`).
- [x] 3.2 Confirm `app/components/Bracket.tsx` still renders the display `date`/`kickoffTime`
  unchanged (no visual change to the bracket).

## 4. Pipeline / Snapshot

- [x] 4.1 In `lib/pipeline.ts`, return the already-computed `allMatches` as `Snapshot.matches`.
- [x] 4.2 Confirm existing snapshot consumers (`app/page.tsx`, `app/bracket/page.tsx`) are
  unaffected by the additive field.

## 5. Phase engine

- [x] 5.1 Create `lib/engine/phases.ts` exporting the ordered `PHASES: Phase[]` with the 9 date
  windows (MD1 Jun 11–17 … Final Jul 19).
- [x] 5.2 Implement `currentPhase(now: Date): Phase` — the phase whose window contains `now`
  (CT); else the next phase by `startDate`; before MD1 → MD1; after Final → Final.
- [x] 5.3 Implement `resolvePhase(dateParam: string | undefined, now: Date): Phase` — match a
  phase by `startDate`; fall back to `currentPhase` on missing/unknown/malformed input.
- [x] 5.4 Implement `phaseWindow(phase: Phase): Phase[]` — the clamped `[prev, current, next]`
  slice for the nav.
- [x] 5.5 Implement `formatDayHeader(isoDate: string): string` → `THU, JUN 18` (derive weekday
  from a UTC-noon `Date` to avoid off-by-one) and a `groupByDay` helper that buckets a phase's
  matches into date-ordered day-sections.

## 6. Clinch engine

- [x] 6.1 Create `lib/engine/clinch.ts` with `isGroupStageComplete(matches): boolean` — true
  iff all 72 group fixtures have a matching `final` result.
- [x] 6.2 Implement `lockedGroupPositions(groupId, matches): Map<position, teamName>` — enumerate
  every W/D/L combination of the group's remaining (non-final) fixtures, synthesize result rows,
  run `computeGroupStandings` for each, and report a position (1st/2nd) as locked iff the team in
  it is invariant across all combinations. Reuse `computeGroupStandings` (`lib/engine/standings.ts`)
  so real tiebreakers apply.

## 7. Schedule data assembly

- [x] 7.1 Create a builder that, for a given phase, produces a date-ordered list of day-sections
  of renderable rows. For group phases: map each `GROUP_SCHEDULE` fixture in the window, join its
  score by `(groupId, normalizeTeamName(home), normalizeTeamName(away))` (unordered), and tag
  status (final/in-progress/upcoming).
- [x] 7.2 For knockout phases: map `snapshot.bracket` matchups in the window to rows showing the
  projected matchup (resolved team or placeholder), venue, kickoff time; no score.
- [x] 7.3 R32 placement: when the group stage is incomplete, fill a group slot with its team only
  if `lockedGroupPositions` locks it, else render the seed placeholder (`1E`/`2A` derived from the
  existing `Winner X`/`Runner-up X` labels); third-place slots → static set label; later rounds →
  `W<feedNum>`. When complete, use the resolved teams from `snapshot.bracket`.

## 8. Page and components

- [x] 8.1 Create `app/schedule/page.tsx` (`export const dynamic = 'force-dynamic'`): call
  `initPoller()` + `runPipeline()`, resolve the phase from `searchParams.date`, assemble the
  day-sections, and render the nav + sections + updated/stale indicator (matching the other pages).
- [x] 8.2 Create `app/components/PhaseNav.tsx` — the clamped ±1 buttons as `next/link` `Link`s
  with `?date=<phase.startDate>`, active state for the current phase.
- [x] 8.3 Create `app/components/DaySection.tsx` — a day header + its rows.
- [x] 8.4 Create `app/components/ScheduleMatchRow.tsx` — teams + `Flag`s, score-or-kickoff, venue,
  live indicator for in-progress; placeholder-aware for knockout/unresolved slots.
- [x] 8.5 Add a `{ href: '/schedule', label: 'Schedule', key: 'schedule' }` tab to the `TABS`
  array in `app/components/Nav.tsx`.

## 9. Tests

- [x] 9.1 `phases` tests: current-phase default (in-window, gap day, pre-tournament,
  post-Final), `?date=` resolution + invalid fallback, clamped window at both ends, day-header
  formatting (no off-by-one).
- [x] 9.2 `clinch` tests: a locked group winner (Mexico-style, one game to play) reported as
  locked; an unlocked position reported as not locked; `isGroupStageComplete` gating.
- [x] 9.3 Fixture-join tests: score joined across a name-variant (`Bosnia-Herzegovina`);
  unordered home/away match; unplayed fixture → no score.
- [x] 9.4 `validateGroupSchedule` test: the 72-fixture / 6-per-group / 3-per-team invariants hold.
- [x] 9.5 Assembly test: R32 shows placeholders pre-completion with clinched teams filled, and
  resolved teams post-completion.

## 10. Finalize

- [x] 10.1 Run `npm test` and `npm run build`; fix any failures.
- [ ] 10.2 Manual check: `/schedule` defaults to the current phase, ±1 buttons navigate and
  update the URL, days render in order with scores/times + venue, R32 placeholders/clinch behave.
- [ ] 10.3 Add a changeset (per `release-automation`) describing the new `/schedule` section.
- [ ] 10.4 Commit, push `feat/match-schedule`, and open a PR (per AGENTS.md).
