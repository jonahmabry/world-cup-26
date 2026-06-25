## Why

The tracker has Standings and Bracket pages but **no fixtures view** — there is no way to see
"what games are on today" or step through the tournament day by day. `match-schedule` is the
next roadmap item: a new `/schedule` section that shows **one phase at a time** (a single
matchday or knockout round), split into day-sections, defaulting to the current phase. It
reuses data the app already has — group fixtures from ESPN ingestion and knockout dates/venues
from `KNOCKOUT_SCHEDULE` — so it adds a user-facing schedule with **no new API source**.

## What Changes

- **New `/schedule` route** (added to `app/components/Nav.tsx`) rendering exactly one phase at
  a time. Phase sequence: Matchday 1, Matchday 2, Matchday 3, Round of 32, Round of 16,
  Quarter-finals, Semi-finals, Third place, Final.
- **Phase navigation** as a **±1 sliding window** of buttons (previous, current, next),
  recomputed around the viewed phase and clamped at the ends. Phase is addressed by a
  **`?date=` query param** keyed to the phase's start date (e.g. `/schedule?date=2026-06-11`),
  defaulting to the current phase on load.
- **Day-sections**: the displayed phase is split into sections by calendar day (`THU, JUN 18`),
  each listing its games — final score inline, or kickoff time + venue if upcoming.
- **New static group-fixtures data model** — all 72 group matches (canonical team names, ISO
  local date, CDT kickoff time, venue, matchday), so upcoming group games show before ESPN
  has returned them. Scores join from ingested `MatchResult`s via `normalizeTeamName`.
- **Group-position clinch detection** — a team mathematically locked into 1st/2nd of its group
  is placed into its Round-of-32 slot early; otherwise R32 shows seed placeholders (`1E`,
  `2A`, `3ABCDF`-style sets) and later-round placeholders (`W73`) until the feeding results
  resolve. Once the group stage is complete, R32 resolves fully from the projected bracket.
- **ISO dates on the knockout schedule** so group and knockout matches can be bucketed and
  day-grouped by a single helper; the Bracket UI is unchanged.
- **`matches[]` exposed on the `Snapshot`** so the page can read per-fixture scores.

Out of scope: live knockout result ingestion/scoring (knockout rows show projected matchups +
kickoff time only), full cross-group/opponent clinch resolution, and any client-side
auto-refresh (the page is `force-dynamic` and "live" on refresh like the other pages).

## Capabilities

### New Capabilities

- `match-schedule`: the `/schedule` page and its behavior — phase model (9 phases with date
  windows), current-phase default, `?date=` addressing, the ±1 sliding-window phase nav, the
  per-day match list and row rendering (group score-or-kickoff + venue, knockout projection),
  the static 72-match group-fixtures data, group-position clinch detection, and R32
  placeholder/auto-fill rules.

### Modified Capabilities

- `knockout-bracket`: each `KNOCKOUT_SCHEDULE` entry SHALL additionally carry an ISO `date`
  (alongside the existing display date) so knockout matches can be sorted and grouped by
  calendar day; the projected bracket's rendering and structure are otherwise unchanged.
- `match-cache`: the unified merged result set (on-disk finals + in-memory live) SHALL be
  exposed on the snapshot returned by the pipeline, so downstream views can read individual
  match scores.

## Impact

- **New files**: `lib/engine/groupSchedule.ts` (72-match table + validation),
  `lib/engine/phases.ts` (phase list, resolve/current/window, ISO→day-header formatter),
  `lib/engine/clinch.ts` (locked group positions, group-stage-complete), `app/schedule/page.tsx`,
  `app/components/{PhaseNav,DaySection,ScheduleMatchRow}.tsx`, plus engine/UI tests.
- **Modified files**: `lib/types.ts` (`Snapshot.matches`, `KnockoutMatchEntry.date`, phase
  types), `lib/engine/knockoutSchedule.ts` (ISO dates), `lib/pipeline.ts` (return merged
  matches), `app/components/Nav.tsx` (schedule tab).
- **Reused**: `normalizeTeamName` (`lib/engine/groups.ts`), `computeGroupStandings`
  (`lib/engine/standings.ts`), `Flag`, `RefreshButton`/`initPoller`, `snapshot.bracket` labels.
- **Dependencies / APIs**: none added. No new network source; group fixtures are static and
  scores continue to come from existing ESPN ingestion.
- **Risk**: fixture-data accuracy (dates/times/venues/matchups for all 72 group games and the
  8 third-place-set labels must be sourced from the official FIFA 2026 schedule) and clinch
  correctness (mitigated by reusing `computeGroupStandings` over enumerated remaining results).
