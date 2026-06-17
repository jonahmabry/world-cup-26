## Why

Teams are rendered as bare text names in every section — group tables, the projected
bracket, and the third-place ranking table. Scanning 48 teams across 12 groups by name
alone is slow, and a flag is the fastest visual key for a country.

Emoji flags are not an option: the regional-indicator emoji flags **do not render on
Windows** (the primary dev/target platform — see the blueprint), and emoji has no glyphs
at all for the home nations (England, Scotland, Wales), which compete as separate teams.
So flags must be **bundled SVG assets**, keyed by a stable country code, with distinct
sub-region flags for the home nations.

## What Changes

- **Add a team → country-code map.** A new `lib/flags.ts` maps each canonical team name
  (as it appears in `lib/engine/groups.ts`) to an ISO 3166-1 alpha-2 code (lowercase),
  with the home nations using the GB sub-region codes `gb-eng` / `gb-sct` / `gb-wls`.
- **Vendor SVG flag assets.** The needed flags are copied from the MIT-licensed
  `flag-icons` set into `public/flags/<code>.svg` and served as static files. No runtime
  dependency — `flag-icons` is a devDependency used only as the asset source.
- **A `<Flag>` component.** A small `app/components/Flag.tsx` resolves a team name to its
  code and renders the bundled SVG at a fixed size (no layout shift). Unknown names render
  nothing rather than a broken image.
- **Wire flags into all three render sites.** Group tables (`GroupTable.tsx`), the bracket
  R32 team slots (`Bracket.tsx`), and the third-place ranking table (`app/page.tsx`).
- **Tests.** `lib/flags.test.ts` asserts every team in `GROUPS` has a code and that the
  corresponding SVG exists on disk, so a missing flag fails CI.

## Capabilities

### New Capabilities

- `country-flags`: every group-stage team renders with its national flag (bundled SVG,
  keyed by country code), including distinct flags for the home nations, across all team
  lists in the UI.

### Modified Capabilities

_None._

## Impact

- **New files:** `lib/flags.ts`, `lib/flags.test.ts`, `app/components/Flag.tsx`,
  `public/flags/*.svg` (48 teams + `gb-wls`), `public/flags/README.md` (provenance).
- **Modified:** `app/components/GroupTable.tsx`, `app/components/Bracket.tsx`,
  `app/page.tsx`; `package.json` / `package-lock.json` (devDependency `flag-icons`).
- **Dependencies:** `flag-icons` — **devDependency only** (asset source). No runtime deps.
- **Risk:** low — additive UI; no engine, API, or data-model behavior changes. Worst case a
  flag is missing, which the test guards against.
- **Out of scope:** flags for knockout placeholder slots ("Winner of M…", "TBD"), since
  those carry no resolved country; club/player crests; the stats section.
