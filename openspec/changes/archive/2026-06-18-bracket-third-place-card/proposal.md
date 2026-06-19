## Why

The projected bracket models every knockout match except the **third-place playoff (M103)**. Today
`KNOCKOUT_SCHEDULE` jumps from the semi-finals (M101, M102) straight to the Final (M104), because the
existing `winner-of` / `feedsFrom` model can only express a match fed by the **winners** of earlier
matches — and M103 is contested by the two semi-final **losers**. As a result the bracket is missing a
real tournament fixture, and there is no data model for "the loser of match X."

This change adds that missing model and renders M103. It is sequenced before `match-schedule` on
purpose: the `ThirdPlace` round and the M103 schedule entry introduced here are reused by the schedule
section's phase list.

Out of scope: resolving the *actual* third-place winner/loser from live results (the bracket remains a
projected snapshot), and any standings/engine logic beyond surfacing the two semi-final losers.

## What Changes

- **New `ThirdPlace` round:** add `'ThirdPlace'` to the `KnockoutRound` type so M103 is a first-class
  round rather than being folded into `Final`.
- **New M103 schedule entry:** add M103 (third-place playoff, ~JUL 18, Miami) to `KNOCKOUT_SCHEDULE`
  with `round: 'ThirdPlace'` and `feedsFrom: ['M101', 'M102']`, carrying the same venue/date/kickoff
  metadata as every other match.
- **New `loser-of` slot type:** add a `{ kind: 'loser-of'; matchId: string }` variant to `BracketTeam`
  so a slot can reference the loser of a feeding match (parallel to the existing `winner-of`).
- **Engine resolves M103 as losers, not winners:** `computeBracket` special-cases the `ThirdPlace`
  round so M103's two slots become `loser-of` M101 / M102 (e.g. labels like "Loser of M101"), instead
  of the `winner-of` slots every other later-round match gets.
- **Detached third-place card in the UI:** render M103 as a standalone `MatchCard` positioned near the
  **bottom-right** of the bracket diagram, outside the main round-column grid (it has no tree
  connectors). `TeamSlot` gains a `loser-of` branch (e.g. renders `L101` / `L102` until resolved),
  reusing the existing card and team-slot components.
- **Schedule validation accommodates M103:** `validateSchedule()` continues to require the Final and
  validate `feedsFrom` references, now with M103 present (M103 is referenced by nothing, which stays
  valid).

## Capabilities

### New Capabilities

- `bracket-third-place-card`: the third-place data model (`ThirdPlace` round, M103 schedule entry,
  `loser-of` slot type and its engine resolution) and the detached third-place card rendered in the
  bracket.

### Modified Capabilities

- `knockout-bracket`: the deterministic snapshot now **includes M103 / the `ThirdPlace` round**
  (Requirement 1 previously enumerated M73–M88 … M104 and explicitly excluded M103, and described the
  tree as "R32 → Final"). Later-round slot projection is extended so the `ThirdPlace` round resolves to
  `loser-of` references rather than `winner-of`.

## Impact

- **Modified:** `lib/types.ts` (`KnockoutRound` + `BracketTeam`), `lib/engine/knockoutSchedule.ts`
  (M103 entry + validation), `lib/engine/bracket.ts` (`ThirdPlace` → `loser-of` resolution),
  `app/components/Bracket.tsx` (detached card + `TeamSlot` `loser-of` branch).
- **Tests:** `lib/engine/bracket.test.ts` (31 → 32 matches; M103 = `loser-of` M101/M102) and any
  `knockoutSchedule` validation test.
- **New files:** OpenSpec scaffold for this change (`proposal.md`, `specs/…`, `design.md`, `tasks.md`).
- **Dependencies:** none — no new packages or data sources; reuses existing components and schedule
  metadata.
- **Risk:** low — additive data model and an isolated detached card; the only cross-cutting edit is the
  `computeBracket` special-case for the `ThirdPlace` round.
- **Out of scope:** live result resolution of the third-place match; the `/schedule` section (separate
  `match-schedule` change, which consumes the M103/`ThirdPlace` model added here).
