## Why

Three reported defects share **one** root cause, and they break the app's core feature during the
live group stage happening right now:

1. **Tied runner-up teams vanish from the bracket.** A 2nd-place team flagged `tiedPendingRanking`
   renders as "TBD" instead of the team.
2. **The 8 advancing third-place teams don't appear.** Same cause — any third flagged
   `tiedPendingRanking` renders as "TBD".
3. **The LIVE badge clips the Pts column** in the group tables (a `LIVE`/`TIE` badge on the Team cell
   squeezes the numeric columns).

The standings engine sets `tiedPendingRanking` whenever teams are level through Step 1 and Step 2, but
**Step 3 (FIFA World Ranking) was never implemented** — the engine emits the flag and stops. Early in a
live group stage many teams are level through Step 2, so the flag fires constantly and `bracket.ts`
blanks those teams to "TBD". The fix is to implement Step 3 with a **frozen FIFA World Ranking
snapshot** (the published ranking is frozen for the duration of a tournament — FIFA does not republish
mid-event), which resolves essentially all ties deterministically and repopulates the bracket. The
table layout is hardened separately so a badge can never squeeze the numeric columns.

## What Changes

- **FIFA World Ranking Step-3 tiebreaker (standings engine):** add a frozen ranking snapshot
  (`lib/engine/fifaRanking.ts`) covering all 48 finalists and apply it as Step 3 in both within-group
  (`standings.ts`) and cross-group third-place (`thirds.ts`) ordering. `tiedPendingRanking` becomes a
  rare fallback that fires only when two teams share a ranking position or a team is missing from the
  snapshot.
- **Bracket slots resolve to real teams (knockout bracket):** with ties resolved, the bracket's
  winner / runner-up / third slots show concrete teams; "TBD — FIFA Ranking" remains only for the rare
  unresolved fallback. No allocation-table change (it is already complete at 495 entries).
- **Table layout hardening (group tables UI):** the group table uses fixed column widths so the
  numeric columns — especially **Pts** — are never clipped or squeezed by a badge on the Team cell.
- **Tests ship with the fix:** unit tests for the ranking lookup/fallback, Step-3 resolution in
  `standings` and `thirds`, and bracket slots populating instead of TBD; existing dead-heat fixtures
  updated to expect the rank-resolved order.

No breaking changes to public behavior; this corrects Phase 1 / Phase 3 behavior.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `standings-engine`: ties SHALL be resolved by a frozen FIFA World Ranking snapshot as Step 3 (both
  within-group and cross-group third-place ranking); `tiedPendingRanking` SHALL be emitted only when the
  ranking cannot resolve the tie.
- `knockout-bracket`: a bracket slot SHALL show the resolved team whenever the FIFA ranking breaks the
  tie; the "TBD — FIFA Ranking" state SHALL appear only for the rare unresolved fallback.
- `group-tables-ui`: numeric stat columns SHALL retain fixed widths so a `LIVE`/`TIE` badge cannot clip
  or squeeze them.

## Impact

- **Code:** new `lib/engine/fifaRanking.ts`; `lib/engine/standings.ts` (Step 3 in `applyOverall`),
  `lib/engine/thirds.ts` (Step 3 in `compareThirds`), `app/components/GroupTable.tsx` (fixed-width
  layout). `lib/engine/bracket.ts` only if the fallback wording changes. Plus `*.test.ts` covering the
  ranking lookup, Step-3 resolution, and bracket population.
- **Data:** a committed ranking snapshot; refreshable via a small fetch script if FIFA ever republishes
  (will not happen before the knockout stage).
- **External calls:** none added at runtime — the snapshot is static and offline.
- **Downstream:** the projected bracket repopulates with real teams from day 0 of the group stage, and
  the LIVE badge no longer affects table layout.
