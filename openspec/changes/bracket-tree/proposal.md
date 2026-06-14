## Why

The Phase 1 bracket only computes the Round of 32 and renders it as a flat grid of 16 cards
(`app/components/Bracket.tsx`). That reads as a list, not a bracket: you can't see how matches feed
forward, and there is no venue or schedule context. Users want a real tournament tree showing the path to
the Final, with each match's host city and kickoff. This change extends the bracket from R32-only to the
full knockout tree and rebuilds the UI as a connected bracket diagram.

## What Changes

- **Full knockout tree (engine):** extend the bracket computation from R32-only to the complete tree —
  R32 (M73–M88) → R16 (M89–M96) → Quarter-finals (M97–M100) → Semi-finals (M101–M102) → Final (M104).
  R32 slots are filled with teams via the existing standings + allocation logic; every later-round slot is
  a reference to the **winner of a prior match** (e.g. "W74"). The third-place play-off (M103) is
  intentionally excluded from the tree.
- **Knockout schedule data:** add a hardcoded `lib/engine/knockoutSchedule.ts` describing, for each
  knockout match, which two matches feed it (`feedsFrom`), its **host city**, **date**, and **kickoff
  time**. This is sourced from the official FIFA 2026 schedule and verified at build time, mirroring the
  Annex C allocation-table approach.
- **Winner-of slot type:** add a `BracketTeam` variant representing "winner of match N" so later-round
  slots render as `W74`/`W77` until the feeding matches resolve.
- **Tree UI:** rebuild `app/components/Bracket.tsx` from a flat grid into a connected tree laid out by
  round, where each card shows its matchup (team / `Wxx` / TBD), host city, and date and time on stacked
  lines (`JUN 30` over `3:30PM`).

No change to the standings engine, tiebreakers, third-place ranking, or the allocation table.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `knockout-bracket`: the bracket SHALL be computed and rendered as the full knockout tree (R32 → Final),
  with later-round slots expressed as winner-of references, and each match SHALL carry and display its
  host city, date, and kickoff time.

## Impact

- **Code:** `lib/engine/bracket.ts` (emit full tree), `lib/engine/knockoutSchedule.ts` (new, hardcoded
  schedule + feed structure), `lib/types.ts` (`winner-of` `BracketTeam` variant; venue/date/time fields on
  the matchup or a parallel lookup), `app/components/Bracket.tsx` (tree layout).
- **Data sourcing:** the knockout schedule (feeds, cities, dates, times) must be taken from the official
  FIFA 2026 fixture list and verified — treated as a build-time correctness task like the allocation table.
- **Behavior:** the projected R32 continues to update live from standings; R16-and-later cards show
  winner-of placeholders (they are fixed slots, not standings-derived), so they do not change with group
  results.
- **Out of scope:** the third-place play-off (M103); any actual knockout results (the tree projects the
  draw structure, not match outcomes).
