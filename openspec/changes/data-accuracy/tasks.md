## 1. ESPN date-range fetch

- [ ] 1.1 Add `fetchScoreboardRange(startYYYYMMDD, endYYYYMMDD)` to `lib/espn/client.ts` using the
  `?dates=YYYYMMDD-YYYYMMDD` query, reusing `parseEvent`; throw the existing `EspnError` on failure
- [ ] 1.2 Add a `formatDate(date): YYYYMMDD` helper (or reuse one) and document the per-day-loop fallback
  in a comment for the case where a single range response is truncated

## 2. Backfill + coverage tracking

- [ ] 2.1 Persist a `backfillWatermark` (latest date fully final + cached) in the on-disk cache via
  `lib/cache/disk.ts` — add read/write helpers without breaking the existing `matches.json` shape
- [ ] 2.2 In `lib/pipeline.ts`, add a one-time backfill pass: sweep `[watermark+1 .. yesterday]` via
  `fetchScoreboardRange`, write finals through the existing write-once `writeMatchToDisk`
- [ ] 2.3 Advance the watermark only past a date once all of that date's matches are `final`; leave dates
  with any non-final match in the sweep
- [ ] 2.4 Ensure routine refreshes fetch only the current/live window after backfill (no full re-sweep)

## 3. Provisional standings engine

- [ ] 3.1 Add `provisional: boolean` to `StandingRow` in `lib/types.ts`
- [ ] 3.2 In `lib/engine/standings.ts`, include `status === 'in-progress'` matches in accumulation using
  the current live score; keep `scheduled` matches excluded
- [ ] 3.3 Set `provisional: true` on any row whose contributing matches include an in-progress match;
  `false` otherwise
- [ ] 3.4 Confirm the tiebreaker pipeline runs unchanged on provisional numbers (no special-casing)
- [ ] 3.5 In `lib/pipeline.ts`, pass live (memory) matches into `computeGroupStandings` so in-progress
  results reach standings (and, transitively, the bracket)

## 4. Group tables UI

- [ ] 4.1 In `app/components/GroupTable.tsx`, render a LIVE indicator on rows with `provisional: true`,
  distinct from the qualification color coding and the tied-pending-ranking badge

## 5. Tests (ship with this change)

- [ ] 5.1 `lib/espn/client.test.ts`: `fetchScoreboardRange` builds the `?dates=START-END` query and parses
  a multi-day fixture into matches (extend rather than replace any existing client test)
- [ ] 5.2 `lib/cache/disk.test.ts`: watermark advances only past a date once all its matches are `final`;
  a date with any non-final match stays in the sweep; write-once guard is preserved
- [ ] 5.3 `lib/engine/standings.test.ts`: an `in-progress` match contributes provisional W/D/L, GF/GA/GD,
  points, and matches-played; affected rows get `provisional: true`; `scheduled` matches are excluded;
  the row settles (and `provisional` clears) once the match is `final`

## 6. Verification

- [ ] 6.1 Run `npm run lint`, `npx tsc --noEmit`, and `npm run test`; all green
- [ ] 6.2 `npm run dev` → load `/`; confirm June 11–12 matches now populate standings and goal difference
- [ ] 6.3 During (or simulating) a live match, confirm the leading team shows a provisional W + LIVE badge
  and that `/bracket` shifts accordingly; confirm the row settles at full time
