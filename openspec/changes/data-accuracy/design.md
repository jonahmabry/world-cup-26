## Context

Phase 1 shipped a two-tier cache (disk = finals, memory = live), an in-house standings engine, and a
snapshot bracket — all fed by `runPipeline()` (`lib/pipeline.ts`). Two gaps surfaced once the live group
stage started:

- `runPipeline()` calls `fetchScoreboard()` with no `dates` argument, and ESPN's scoreboard returns only
  ~today's events. Matches played before the app first ran (June 11–12) are never ingested.
- `computeGroupStandings()` (`lib/engine/standings.ts:160`) filters `status === 'final'`, so in-progress
  matches contribute nothing until full time.

Constraints carried from Phase 1: no database, no API keys, completed-match data is immutable and
write-once to disk, all ESPN calls are server-side, and the bracket must stay consistent with the group
tables (same engine, same inputs).

## Goals / Non-Goals

**Goals:**
- Every finished match across the tournament window is ingested and cached, regardless of when the app
  first ran.
- In-progress matches contribute provisional results to standings (and therefore the bracket), clearly
  flagged as live.
- Steady-state ESPN call volume is unchanged after the initial backfill.

**Non-Goals:**
- No change to the tiebreaker sequence, third-place ranking, or bracket allocation logic.
- No knockout-stage scheduling (handled by the separate `bracket-tree` change).
- No new persistence layer — the existing JSON disk cache remains the only store.

## Decisions

### 1. Date-range fetch in the ESPN adapter, single call
ESPN's scoreboard accepts `?dates=YYYYMMDD-YYYYMMDD` and returns every event in the range in one
response. Add `fetchScoreboardRange(start, end)` to `lib/espn/client.ts`, reusing the existing
`parseEvent` pipeline. *Alternative considered:* a per-day loop (one call per date) — rejected as the
default because it multiplies calls; kept as a documented fallback if a range response is ever truncated.

### 2. One-time backfill driven by a persisted watermark
Persist a small `backfillWatermark` (the latest date for which all matches are final and cached) to the
disk-cache file. On each run, `runPipeline()` sweeps `[watermark+1 .. yesterday]` once via the range
fetch, writes finals through the existing write-once guard, then advances the watermark. The current/live
day is always fetched fresh into the memory tier. *Alternative considered:* an in-memory "backfilled this
process" flag — rejected because a restart would re-sweep the whole window; the persisted watermark makes
restarts cheap and keeps steady-state volume flat. *Alternative considered:* deriving coverage from a
hardcoded fixture list — rejected as redundant with the disk cache.

### 3. In-progress matches accumulate as provisional results
`computeGroupStandings()` includes `status === 'in-progress'` matches in accumulation using the current
live score exactly as a final would be counted (W/D/L, GF/GA/GD/Pts, MP). `scheduled` matches still
contribute nothing. A row is flagged `provisional: true` when any of its contributing matches is
in-progress. The tiebreaker sequence runs unchanged on the provisional numbers — it is a live snapshot,
not a prediction. *Alternative considered:* computing a separate "provisional" table alongside the final
one — rejected as more surface area for no user benefit; a per-row flag is enough for the UI.

### 4. Bracket inherits live data for free
The bracket is computed from standings, so provisional standings automatically shift the projected
bracket. This matches the existing "if the group stage ended now" framing; no bracket-engine change.

## Risks / Trade-offs

- **Initial backfill spikes ESPN calls** → one range sweep, bounded by the persisted watermark; the live
  window is the only thing fetched thereafter.
- **ESPN range response could be truncated or change shape** → all parsing stays behind the
  `lib/espn/client.ts` adapter; documented per-day-loop fallback if a single range call proves unreliable.
- **Provisional tiebreakers can show transient orderings mid-match** → acceptable and expected; affected
  rows are flagged LIVE so users read them as volatile.
- **Watermark advanced too eagerly could skip a late-finalizing match** → only advance the watermark past
  a date once every match on that date is `final`; a date with any non-final match stays in the sweep.

## Migration Plan

No data migration. First run after deploy performs the one-time backfill sweep and writes the watermark.
Rollback is a code revert; the disk cache is unaffected (any extra cached finals are harmless and the
watermark field is ignored by older code).

## Open Questions

- Exact backfill window bounds — group stage is June 11–27, 2026; the sweep can simply use the tournament
  start through "yesterday," so no hard end date is needed.
