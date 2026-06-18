## Why

The projected knockout bracket renders each resolved Round-of-32 team as just a flag and
a name. The engine already knows how every R32 team entered the knockout stage — group
winner, runner-up, or one of the 8 best third-placed teams — and carries it in each
matchup's `homeLabel` / `awayLabel` (`"Winner F"`, `"Runner-up A"`, `"3rd Group C"`). But
once a slot resolves to a concrete team the UI drops that origin, so you can't tell at a
glance whether a team entered as `1F`, `2A`, or `3C`. That seed is exactly how people read
a World Cup draw.

## What Changes

- **Render a compact group-seed badge** next to each **resolved** team in the **R32**
  column of `app/components/Bracket.tsx`: `1<group>` for a group winner, `2<group>` for a
  runner-up, `3<group>` for a third-placed qualifier (e.g. `1F`, `2A`, `3C`).
- **Derive the seed from the existing label** via a small pure helper `seedFromLabel` in
  `Bracket.tsx`. No engine change — the labels already exist in `lib/engine/bracket.ts`.
- **R32-only.** Later rounds are `winner-of` references (`"Winner of M74"`) and carry no
  seed; `seedFromLabel` returns `null` for them, and resolved `kind: 'team'` slots only
  ever occur in R32. TBD / unresolved slots also get no badge.
- **Test.** `app/components/Bracket.test.ts` pins the label → seed derivation.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `knockout-bracket`: resolved Round-of-32 slots additionally display a compact group-seed
  badge (group-finish position + group letter) derived from the slot's origin label.

## Impact

- **New files:** `app/components/Bracket.test.ts`; the OpenSpec change artifacts.
- **Modified:** `app/components/Bracket.tsx` (add `seedFromLabel`; render the badge in the
  resolved-team branch of `TeamSlot`).
- **Risk:** low — additive, presentation-only. No engine, data-model, or API change. The
  badge uses fixed sizing so it cannot displace the flag, name, or schedule columns.
- **Out of scope:** seeds on later-round / placeholder / TBD slots (they have no group
  origin); any change to how the engine computes or labels slots.
