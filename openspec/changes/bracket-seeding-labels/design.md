## Context

`lib/engine/bracket.ts` builds each R32 matchup with an origin label per slot:
`winner()` / `runnerUp()` emit `"Winner <G>"` / `"Runner-up <G>"`, and `slotPair()` emits
`"3rd Group <G>"` for the third-place slots. `app/components/Bracket.tsx` already receives
these as `homeLabel` / `awayLabel` and passes them into `TeamSlot`, but only renders the
label text when a slot is **unknown** — a resolved team shows flag + name only. Later
rounds carry `"Winner of M…"` labels and `winner-of` team kinds.

## Decisions

### Derive the seed in the component, from the existing label

The badge is computed by a pure `seedFromLabel(label): string | null` helper in
`Bracket.tsx`, matching the three known label shapes and mapping to position digit + group
letter; everything else (including `"Winner of M74"` and `"Annex C pending"`) returns
`null`.

Deriving from the label — rather than adding a structured seed field to `BracketMatchup`
and the engine — keeps the change presentation-only, matching the blueprint's constraint
that "the engine already emits the underlying labels; only `app/components/Bracket.tsx`
rendering changes." The label formats are produced and consumed in the same repo and are
already pinned by `lib/engine/bracket.test.ts`; the new `Bracket.test.ts` pins the
derivation, so a future label change that breaks the mapping fails CI.

### R32-only falls out of the team kind

A seed only makes sense for a slot with a group origin. Resolved `kind: 'team'` slots
occur **only** in R32 (R16+ are always `winner-of`, asserted by `bracket.test.ts`), and
`seedFromLabel` returns `null` for the `"Winner of M…"` labels regardless. So rendering the
badge in the resolved-team branch is intrinsically R32-only with no round check needed.

### Placement and styling

The badge trails the team name (`ml-auto shrink-0`, small muted monospace) with the flag
pinned at the left edge of the existing `TeamSlot` flex row. `shrink-0` plus the name's
`truncate` means the badge is never clipped and the fixed-size flag and the card's
city/date column are never displaced. TBD, `winner-of`, and `unknown` branches are
untouched (the `unknown` branch keeps showing the verbose label as before).

## Risks / Trade-offs

- **Label-format coupling.** The helper parses engine strings. Mitigated by co-located
  tests on both sides; the formats are internal to this repo.
- **Visual crowding** in the narrow R32 card. Mitigated by 9px monospace and `ml-auto`,
  which keeps the badge tight against the right edge of the slot.

## Migration

None. Additive UI; no data, API, or engine changes.
