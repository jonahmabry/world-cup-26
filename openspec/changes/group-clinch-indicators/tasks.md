## 1. Shared enumeration refactor

- [x] 1.1 In `lib/engine/clinch.ts`, extract the 3^k within-group enumeration into an exported
  `enumerateGroupOutcomes(groupId, matches): GroupStandings[]` (base = finals-only; remaining =
  fixtures with no final), and rebuild `lockedGroupPositions` as a thin consumer of it.
- [x] 1.2 Run the existing `lib/engine/clinch.test.ts` to confirm no behaviour change.

## 2. Clinch engine

- [x] 2.1 Add `ClinchStatus = 'through' | 'out' | 'none'` and the `clinch` field to `StandingRow`
  in `lib/types.ts`; default rows to `clinch: 'none'` in `computeGroupStandings`
  (`lib/engine/standings.ts`).
- [x] 2.2 Create `lib/engine/qualification.ts` exporting
  `computeClinchStatuses(groupStandings, matches): Map<string, ClinchStatus>` keyed by
  `` `${groupId}|${team}` ``.
- [x] 2.3 Complete case (`isGroupStageComplete`): resolve exactly via `rankThirds` — `through`
  when position ≤ 2 or 3rd in an advancing group; else `out`.
- [x] 2.4 Bounded case: one pass over `enumerateGroupOutcomes` per group to derive each team's
  possible positions, worst/best 3rd triple, and the group's best/worst possible 3rd triple.
- [x] 2.5 Decide `through`/`out`/`none` per the bounded rules, applying the three correctness
  rules: `(pts,gd,gf)`-only comparator with conservative tie handling; finals-only rebuild
  (in-progress = undecided); mirror `tiedPendingRanking`.

## 3. Pipeline wiring

- [x] 3.1 In `lib/pipeline.ts`, call `computeClinchStatuses` once and set `row.clinch` on every
  group standings row and on each `allThirds` row. Leave the existing `qualStatus` logic and row
  colouring untouched.

## 4. UI

- [x] 4.1 Add a shared `ClinchBadge` rendering `✓ THROUGH` (emerald) / `✗ OUT` (red) / nothing,
  styled like the existing `LIVE` tag.
- [x] 4.2 Render the badge next to the team name in `app/components/GroupTable.tsx` (do not change
  `rowBg`).
- [x] 4.3 Render the badge on each best-thirds row in `app/page.tsx`, and add a legend note that
  colours reflect current position while badges reflect mathematically clinched status.

## 5. Tests

- [x] 5.1 `lib/engine/qualification.test.ts`: clinched group winner → `through`; clinched
  best-third → `through`; mathematically eliminated 3rd-place → `out`; not-yet-decided → `none`.
- [x] 5.2 Group-stage-complete exact case cross-checked against `rankThirds`; empty input → all
  `none`.
- [x] 5.3 In-progress scoreline that *would* clinch if final → still `none` (in-progress treated as
  undecided); a `tiedPendingRanking` boundary → `none` (no false positive).

## 6. Finalize

- [x] 6.1 Run `npm run lint && npm run typecheck && npm run test && npm run build`; fix failures.
- [x] 6.2 Manual check: badges appear only where mathematically justified; row colours unchanged;
  badges on both the group tables and the best-thirds table; legend updated.
- [x] 6.3 Add a changeset describing the clinch badges.
- [x] 6.4 Commit, push `feat/group-clinch-indicators`, and open a PR (per AGENTS.md).
