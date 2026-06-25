## Why

The group standings tables already colour each row by its **current** position (green = top-2,
amber = best-third, red = eliminated). That colouring is provisional — it flips around live as
scores change and says nothing about whether a team has actually *secured* anything. The Schedule
page, by contrast, already uses real clinch math (`lockedGroupPositions` in `lib/engine/clinch.ts`)
to place a team into the Round of 32 only once it is mathematically locked in.

This change surfaces that same rigour on the Standings page: a badge that appears **only when a
team has mathematically clinched advancement to the Round of 32 (`✓ THROUGH`) or been
mathematically eliminated (`✗ OUT`)**, shown alongside — not replacing — the existing position
colouring.

## What Changes

- **New clinch engine** (`lib/engine/qualification.ts`) computing a per-team status
  `'through' | 'out' | 'none'` from the merged match results, treating in-progress games as
  undecided. Advancement covers both clinched top-2 **and** clinched best-third (a cross-group
  result), even when the exact bracket slot is not yet known; elimination is the mirror.
- **Conservative bounded algorithm**: per-group outcome enumeration (reusing the
  `lockedGroupPositions` pattern) plus a min/max bound across the other groups' possible
  third-placed teams. The bound never produces a false `THROUGH`/`OUT`; it may under-report a
  clinch by a beat, which is acceptable.
- **Shared enumeration helper**: extract `enumerateGroupOutcomes` out of `lockedGroupPositions`
  in `lib/engine/clinch.ts` and rebuild `lockedGroupPositions` on top of it (no behaviour change).
- **`clinch` field on `StandingRow`**, assigned in `lib/pipeline.ts` next to the existing
  `qualStatus` (which is left untouched).
- **Badges in the UI**: a generic `✓ THROUGH` / `✗ OUT` tag next to the team name in
  `app/components/GroupTable.tsx` (styled like the existing `LIVE` tag) and on the standalone
  best-thirds table in `app/page.tsx`, plus a legend note clarifying that **colours reflect
  current position while badges reflect mathematically clinched status**.

Out of scope: position-detail wording on the badge (always generic THROUGH/OUT), changing the
existing row colouring, and any knockout-stage clinch indicators.

## Capabilities

### New Capabilities

- `group-clinch-indicators`: per-team mathematical clinch status (`through`/`out`/`none`) for the
  group stage — the conservative bounded algorithm (clinched top-2 or best-third → through; the
  mirror → out), its exact resolution once the group stage is complete, and the THROUGH/OUT
  badges rendered on the group tables and the best-thirds table.

## Impact

- **New files**: `lib/engine/qualification.ts` (`computeClinchStatuses`) and
  `lib/engine/qualification.test.ts`.
- **Modified files**: `lib/engine/clinch.ts` (export `enumerateGroupOutcomes`; rebuild
  `lockedGroupPositions`), `lib/types.ts` (`StandingRow.clinch`), `lib/engine/standings.ts`
  (default `clinch: 'none'`), `lib/pipeline.ts` (assign clinch on group rows + `allThirds`),
  `app/components/GroupTable.tsx` and `app/page.tsx` (badges + legend).
- **Reused**: `enumerateGroupOutcomes`/`isGroupStageComplete` (`lib/engine/clinch.ts`),
  `computeGroupStandings` (`lib/engine/standings.ts`), `rankThirds` (`lib/engine/thirds.ts`),
  the existing `LIVE`-tag styling in `GroupTable.tsx`.
- **Dependencies / APIs**: none added.
- **Risk**: clinch correctness. Mitigated by the conservative bound (no false positives in
  either direction), reuse of the existing enumeration + standings engine, and dedicated unit
  tests (clinched winner, clinched best-third, eliminated third, undecided, in-progress, and a
  `tiedPendingRanking` boundary).
