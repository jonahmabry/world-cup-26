## Why

Two Phase 1 defects make the live group stage wrong right now, before any Phase 2 work:

1. **Past matches are missing.** `runPipeline()` calls `fetchScoreboard()` with no date, so ESPN's
   scoreboard returns only ~today's events. The June 11–12 matches that already finished were never
   fetched, never written to the disk cache, and are therefore silently absent from every group table
   and from the projected bracket.
2. **Live matches don't move the table.** `computeGroupStandings()` filters to `status === 'final'`, so
   a team currently winning 1–0 has no effect on standings until full time. The app should reflect the
   live state of the tournament as it unfolds.

Both undermine the app's core value (accurate live standings + bracket), so they are fixed first.

## What Changes

- **Full-tournament backfill (ESPN ingestion + cache):** add date-range fetching to the ESPN client
  (ESPN supports `?dates=YYYYMMDD-YYYYMMDD`) and a one-time backfill pass in the pipeline that sweeps the
  whole tournament window, writing every finished match to the disk cache via the existing write-once
  guard. A coverage guard ensures the full range is swept only until all past dates are cached; routine
  refreshes then fetch only the current/live window.
- **Provisional live standings (standings engine + group UI):** the standings engine includes
  `in-progress` matches as **provisional** results — accumulating W/D/L, GF/GA/GD, points, and matches
  played from the current live score — and flags affected rows. The group tables render a **LIVE**
  indicator on provisional rows. Because the bracket is computed from standings, it shifts live
  automatically, consistent with the existing "if the group stage ended now" snapshot model.

- **Tests ship with the fix:** add unit tests for the new engine behavior introduced here —
  `fetchScoreboardRange` parsing, the backfill/coverage watermark logic, and the provisional standings
  pass — so these engine changes land with their own regression net. Broader coverage for the untouched
  modules and CI follow in `hardening`.

No breaking changes to public behavior; these correct and extend Phase 1 behavior.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `espn-ingestion`: the client SHALL support fetching a date range, not just the default (today)
  scoreboard, so historical matches can be retrieved.
- `match-cache`: the pipeline/cache SHALL perform a one-time backfill of all past tournament dates into
  the on-disk cache and track coverage so the full range is not re-fetched on every refresh.
- `standings-engine`: standings SHALL incorporate `in-progress` matches as provisional results and mark
  affected rows as provisional (distinct from final results).
- `group-tables-ui`: group tables SHALL visually indicate rows whose standing reflects a provisional
  (in-progress) result.

## Impact

- **Code:** `lib/espn/client.ts` (range fetch), `lib/pipeline.ts` (backfill pass + feed live matches to
  standings), `lib/cache/disk.ts` (coverage tracking), `lib/engine/standings.ts` (provisional pass),
  `lib/types.ts` (`provisional` flag on `StandingRow`), `app/components/GroupTable.tsx` (LIVE indicator);
  plus `*.test.ts` covering the range fetch, backfill watermark, and provisional standings pass.
- **External calls:** more ESPN calls on first run (one backfill sweep across the tournament window);
  steady-state call volume is unchanged (live window only). No new dependencies, no API keys.
- **Data:** disk cache (`data/cache/matches.json`) gains the previously-missing finished matches;
  completed-match data remains immutable and write-once.
- **Downstream:** the projected bracket will now reflect both the backfilled results and live in-progress
  matches, with no bracket-engine changes required.
