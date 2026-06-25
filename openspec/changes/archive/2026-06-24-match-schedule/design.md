## Context

The app renders Standings (`app/page.tsx`) and the projected Bracket (`app/bracket/page.tsx`),
both as `force-dynamic` server components that call `initPoller()` then `await runPipeline()`.
`runPipeline()` (`lib/pipeline.ts`) returns a `Snapshot` of `groups`, `allThirds`, `bracket`,
`lastUpdated`, `hasStaleData` — it computes `const allMatches = getMergedResults()` internally
but does not expose it.

Match data splits into two worlds:

- **Group stage** — only ingested `MatchResult`s exist (keyed by ESPN id; ISO UTC `kickoff`;
  `groupId`; scores; `status`). They are joined to standings purely by
  `(groupId, homeTeam, awayTeam)`. There is no matchday field and no static fixture list, so
  upcoming group games are absent until ESPN serves them. ESPN names are normalized to
  canonical via `normalizeTeamName` (`lib/engine/groups.ts:10`), and the on-disk cache
  contains both raw and canonical variants.
- **Knockout** — the static `KNOCKOUT_SCHEDULE` (`lib/engine/knockoutSchedule.ts`) holds
  M73–M104 with **display-only** dates (`'JUN 29'`, no year/weekday/sort key). `computeBracket`
  (`lib/engine/bracket.ts`) resolves R32 from *current* standings and labels later rounds
  `"Winner of M89"` / third place `"Loser of M101"`. It places teams **provisionally** with no
  notion of whether a position is mathematically clinched.

The schedule must present both worlds as one phase-at-a-time, day-grouped view, defaulting to
the current phase, with a ±1 sliding window of phase buttons (per the blueprint, narrower than
FoxSports' full button row).

## Goals / Non-Goals

**Goals:**

- A `/schedule` route showing exactly one of 9 phases, split into day-sections sorted by
  calendar day, with group rows (score-or-kickoff + venue) and knockout rows (projected
  matchup + kickoff time).
- Current-phase default; `?date=`-addressed phases; ±1 sliding-window, clamped navigation.
- A static 72-match group-fixtures model so upcoming group games render before ingestion,
  with live scores joined from the snapshot.
- Group-position clinch detection so a locked group winner/runner-up auto-fills its R32 slot
  early; otherwise seed/winner placeholders.
- Reuse existing infrastructure (`force-dynamic`, poller, `RefreshButton`, `Flag`,
  `computeGroupStandings`, `normalizeTeamName`, `snapshot.bracket`) — no new API source.

**Non-Goals:**

- Ingesting or scoring live knockout results — knockout rows are projections (kickoff time
  only). Deferred to a later change.
- Full cross-group third-place / exact-opponent clinch resolution — third-place-set slots stay
  as placeholders until the group stage completes.
- Client-side auto-refresh — "live" means the same `force-dynamic` + poller + manual-refresh
  behavior as the other pages.
- Changing how the Bracket page looks.

## Decisions

### 1. One phase model; bucket every match by date window

Define 9 phases as `{ key, label, startDate, endDate }` (MD1 Jun 11–17 … Final Jul 19) and
assign each match to a phase by its calendar date. The windows are clean and non-overlapping,
so the date window *is* the matchday — no per-match `matchday` lookup is needed at render time.

_Alternative considered:_ derive matchdays by per-group chronological chunking (sort a group's
matches, split into pairs). Rejected — date windows are simpler, match the reference UI's
labeling, and are robust to partially-ingested data.

### 2. ISO `date` on both fixture sources; one day-grouping helper

Group-fixtures rows store an ISO local date (`'2026-06-18'`) plus a CDT display `kickoffTime`.
**Add the same ISO `date` field to every `KNOCKOUT_SCHEDULE` entry** (the MODIFIED
`knockout-bracket` delta). A single helper then formats `'2026-06-18'` → `THU, JUN 18` and
sorts both match types. Day-of-week is derived from a UTC-noon `Date` to avoid timezone
off-by-one; kickoff times render as the stored CDT strings (no TZ math).

_Alternative considered:_ leave `KNOCKOUT_SCHEDULE` untouched and parse `'JUN 29'` + assumed
year. Rejected — fragile string parsing; an explicit ISO field is cheap and reused by both
group and knockout grouping.

### 3. Expose merged matches on the Snapshot

Return the `allMatches` that `runPipeline` already computes as `Snapshot.matches`
(MODIFIED `match-cache`). The page joins each static fixture to its score by
`(groupId, normalizeTeamName(home), normalizeTeamName(away))` as an unordered pair, reusing the
existing normalization.

_Alternative considered:_ have `/schedule` call `getMergedResults()` directly. Rejected — a
second data-access path risks diverging from what `runPipeline` saw and bypasses the snapshot.

### 4. Clinch detection by re-using `computeGroupStandings`

New `lib/engine/clinch.ts`: for each group, take its **remaining** fixtures (static rows with
no `final` result) and enumerate every W/D/L combination (≤ 3^k, k small — at most a handful of
remaining games per group). For each combination, synthesize result rows and run
`computeGroupStandings`; a team's group position (1st/2nd) is **locked** iff it is invariant
across all combinations. "Group stage complete" = all 72 fixtures have a `final` result.

This inherits the real FIFA tiebreakers for free and stays correct as standings evolve.

_Alternative considered:_ hand-rolled clinch math (points gaps, head-to-head reasoning).
Rejected — error-prone and would duplicate tiebreaker logic that already exists.

### 5. R32 placement & placeholder notation

Before the group stage completes: a locked group winner fills the home seed (`Winner E` →
shown as the team, else `1E`); a locked runner-up fills its slot (`Runner-up A` → team, else
`2A`); third-place-set slots show a static set label (`3ABCDF`-style, 8 hardcoded labels);
later rounds show `W<feedMatchNum>` (from the `winner-of` matchId). After completion, all R32
slots resolve from `snapshot.bracket`. Home/seed labels derive programmatically from the
existing `"Winner X"` / `"Runner-up X"` labels.

### 6. Current phase, `?date=`, and the sliding window

- **Current phase**: the phase whose `[startDate, endDate]` contains today (CT); else the next
  phase by `startDate`; before MD1 → MD1; after the Final → Final.
- **`?date=`**: value is a phase `startDate` (`YYYY-MM-DD`); resolved by matching a phase;
  unknown/missing/invalid → current phase. Navigation `Link`s set `?date=<phase.startDate>`.
- **Sliding window**: order the phases; for viewed index `i`, render buttons `[i-1, i, i+1]`
  clamped to `[0, len-1]` — 2 buttons at the ends, 3 in the middle.

### 7. Page structure & reuse

`app/schedule/page.tsx` is `force-dynamic`, calls `initPoller()` + `runPipeline()`, resolves
the phase from `searchParams.date`, assembles the per-day match list, and renders `PhaseNav`
(buttons as `Link`s), `DaySection`, and `ScheduleMatchRow` (reusing `Flag`). A `/schedule` tab
is added to `app/components/Nav.tsx`. No new client-side state.

## Risks / Trade-offs

- **Fixture-data accuracy** (dates, times, venues, matchups for 72 group games; 8
  third-place-set labels) → source from the official FIFA 2026 schedule; add a
  `validateGroupSchedule()` (12 groups × 6 games, each team exactly 3) mirroring the existing
  `validateSchedule()` knockout guard.
- **Team-name join mismatches** (raw vs canonical in cache) → always normalize both sides;
  cover with a test using a known mismatch (`Bosnia-Herzegovina`).
- **Clinch enumeration cost** → bounded (≤ 3^k per group, small k); only remaining fixtures are
  enumerated and the computation runs server-side per request, same cadence as the pipeline.
- **Knockout rows look "empty"** (always placeholders/times, never scores) → acceptable and
  consistent with the projected bracket; clearly out of scope until live knockout ingestion.
- **Gap days between knockout rounds** (e.g. Jul 8, 12–13, 16–17) → the current-phase rule
  falls through to the next upcoming phase, so the page is never blank.

## Migration Plan

Additive only. New route + new data/engine modules; the two MODIFIED touch points
(`KNOCKOUT_SCHEDULE.date`, `Snapshot.matches`) are backward-compatible field additions that
existing consumers ignore. No data migration; rollback = revert the change/branch.

## Open Questions

- Exact official values for the 72 group fixtures and the 8 third-place-set labels — resolved
  at implementation time from the FIFA 2026 schedule (tracked as a data-accuracy task).
- Whether the group-fixtures table + clinch engine should later split into their own capability
  — kept under `match-schedule` for this change as a single shippable unit.
