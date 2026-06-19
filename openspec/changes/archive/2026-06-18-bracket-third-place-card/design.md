## Context

The projected bracket (`lib/engine/bracket.ts` → `app/components/Bracket.tsx`) models the full knockout
tree R32 → Final but omits the third-place play-off (M103). The omission is structural, not cosmetic:

- `KNOCKOUT_SCHEDULE` (`lib/engine/knockoutSchedule.ts`) has no M103 entry, and `KnockoutRound`
  (`lib/types.ts`) has no round for it.
- `computeBracket` builds every later-round matchup from a single rule — *for every schedule entry with
  `feedsFrom !== null`, both slots are the **winners** of the feeding matches* (`bracket.ts:93–110`).
  M103 is contested by the two Semi-final **losers**, which that rule cannot express; `BracketTeam`
  (`lib/types.ts`) has `winner-of` but no `loser-of`.
- The renderer drives its columns from `ROUND_DEFS` (R32…Final) with a fixed-pixel absolute layout
  (`SLOT_H`/`CARD_H`/`COL_W`, `BRACKET_H = 16 * SLOT_H`). The Final card is vertically centered, leaving
  the bottom-right of the diagram empty.

This change introduces the third-place data model and renders M103. It is the model that the later
`match-schedule` change consumes, so the schedule entry and round are the durable deliverable; the card
is the visible surface.

**Branch note:** this branch is cut from `master`, which does **not** yet contain the sibling
`bracket-fifa-ranking` change (that work lives on `feat/bracket-fifa-ranking`). On `master`, `TeamSlot`
renders flag + name only. Per the roadmap, `bracket-fifa-ranking` lands first; the detached card reuses
`TeamSlot`, so it inherits the ranking gutter automatically once that change is merged — no extra work
here. See Risks.

## Goals / Non-Goals

**Goals:**

- Add M103 to the knockout data model as a first-class `ThirdPlace`-round match fed by M101/M102.
- Introduce a `loser-of` slot reference and resolve M103's two slots to the losers of the Semi-finals.
- Render M103 as a single detached card at the bottom-right of the bracket, reusing `MatchCard` /
  `TeamSlot`, with no tree connectors.
- Keep the existing winner-of tree, schedule validation, and 1-root (M104) invariant intact.

**Non-Goals:**

- Resolving the *actual* third-place participants/winner from live results — the bracket stays a
  projected snapshot; M103 slots remain loser-of references that never resolve to concrete teams.
- Generalizing the schedule into arbitrary winner/loser feed graphs — `ThirdPlace` is the only
  loser-fed match and is handled as such.
- The `/schedule` section (separate `match-schedule` change), which only *consumes* this model.

## Decisions

### 1. New round `ThirdPlace`, not folding M103 into `Final`

Add `'ThirdPlace'` to `KnockoutRound`. M103 is a distinct fixture on a distinct date/venue, and
`match-schedule` needs to address it as its own phase. Crucially, `ThirdPlace` is **not** added to
`ROUND_DEFS`, so the column renderer (`byRound`) naturally ignores it — M103 never appears as a tree
column and is drawn only by the dedicated detached-card code path.

_Alternative considered:_ tag M103 onto the `Final` round and special-case in the UI. Rejected — it
muddies `byRound('Final')`, breaks the "one match per Final column" assumption, and gives
`match-schedule` no clean handle.

### 2. New `loser-of` slot type, resolved by special-casing the `ThirdPlace` round

Add `{ kind: 'loser-of'; matchId: string }` to `BracketTeam`, parallel to `winner-of`. In
`computeBracket`, narrow the existing later-rounds builder so it skips the third-place round
(`entry.feedsFrom !== null && entry.round !== 'ThirdPlace'`), then append M103 explicitly with its two
slots built as `loser-of` M101 / M102 (labels `Loser of M101` / `Loser of M102`), carrying schedule
metadata exactly like the winner-of branch.

_Alternative considered:_ add a `feedKind: 'winner' | 'loser'` field to `KnockoutMatchEntry` and branch
generically in the map. Rejected as over-engineering — there is exactly one loser-fed match; a
round-keyed special-case is shorter, is self-documenting, and keeps `KnockoutMatchEntry` unchanged.
If a future format adds more loser-fed matches, promote to `feedKind` then.

### 3. M103 schedule entry as a leaf

Add M103 to `KNOCKOUT_SCHEDULE` with `round: 'ThirdPlace'`, `feedsFrom: ['M101', 'M102']`, and
venue/date/kickoff metadata. M103 is referenced by nothing, so the existing `validateSchedule()`
single-root invariant (M104 is the root, nothing may reference M104) still holds unchanged. Add one
assertion mirroring the M104 check: M103 exists and no other match lists M103 in `feedsFrom` (it is a
leaf, never a feed). The `feedsFrom` reference check already covers M103 → M101/M102 validity.

### 4. Detached card: absolutely positioned in the bracket viewport, lower-right

Give the existing bracket-columns flex container `position: relative` and mount one absolutely
positioned `MatchCard` for M103 in the lower-right of that container (within the `overflow-x-auto`
viewport, so it scrolls with the tree rather than floating over page chrome), with a small
"Third-place match" caption below it. The card is aligned horizontally with the **Final** column
(`left = 4 * (COL_W + CONN_W)`) and vertically with **M100** (the last QF card, Kansas City —
`top = 14 * SLOT_H - CARD_H / 2`), so it sits in the empty space below the centered Final card. No
connector arms are drawn. The card is selected out of `matchups` by `round === 'ThirdPlace'` and
rendered outside the `ROUND_DEFS.map`.

`TeamSlot` gains a `loser-of` branch rendering `L{matchId.slice(1)}` (e.g. `L101`), styled like the
existing `winner-of` branch.

_Alternative considered:_ render M103 as a sibling block beneath the tree. Rejected — the spec calls for
the card *within* the diagram's bottom-right footprint; a stacked block reads as a separate section and
shifts page layout. The empty space below the centered Final card is exactly where a detached card
belongs.

## Risks / Trade-offs

- **Sequencing with `bracket-fifa-ranking`** (this branch lacks it) → The card reuses `TeamSlot`, so it
  picks up the ranking gutter for free once that change merges; no card-specific ranking code is
  written. Land `bracket-third-place-card` after `bracket-fifa-ranking` (the roadmap order) or rebase
  onto it so the merged `TeamSlot` is the one in play.
- **Existing structure test asserts 31 matches** (`lib/engine/bracket.test.ts`) → Update to 32 and add
  M103 = `loser-of` M101/M102 assertions; this is an intended, covered change.
- **`hasUnknown` warning scans only R32 slots** → M103's `loser-of` slots are not `unknown`, so the
  warning banner is unaffected. No change needed.
- **Detached card overlap at narrow widths** → It is mounted inside the same horizontally scrollable
  viewport and anchored to the columns container, so it tracks the tree; the Final-column / M100-row
  placement sits in empty space below the centered Final card, clear of its connectors.

## Migration Plan

Additive, no data migration. Sequence: types (`KnockoutRound`, `BracketTeam`) → schedule (M103 entry +
leaf assertion) → engine (`computeBracket` skip-and-append) → UI (`TeamSlot` loser-of branch + detached
card) → tests. Rollback is a straight revert; nothing is persisted (the bracket is recomputed per
refresh) and no other capability depends on M103 until `match-schedule`.

## Open Questions

- **M103 venue / date / kickoff:** _Resolved._ Miami, JUL 18, 4:00PM CDT (5:00PM ET, the day before the
  Final at New York/New Jersey on JUL 19), confirmed against the official FIFA 2026 schedule.
