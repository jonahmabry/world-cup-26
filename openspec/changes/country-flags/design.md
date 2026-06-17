## Context

The UI renders teams as plain display-name strings. There is no country code anywhere in
the data model (`lib/engine/groups.ts` holds only names; `lib/types.ts` carries `team:
string`). Adding flags therefore needs (a) a name→code map and (b) bundled SVG assets,
because emoji flags fail on Windows and have no home-nation glyphs.

## Decisions

### Keying: ISO 3166-1 alpha-2, with GB sub-regions for home nations

Flags are keyed by ISO 3166-1 alpha-2 codes (lowercase, e.g. `mx`, `kr`, `cd`). This is
the scheme the `flag-icons` asset set uses, so codes map 1:1 to filenames. The home
nations have no alpha-2 code of their own and so use the GB sub-region codes the asset set
provides: England `gb-eng`, Scotland `gb-sct`, Wales `gb-wls`. Wales is not in the 2026
draw but is included for robustness (and matches the blueprint's explicit call-out).

FIFA 3-letter codes were rejected: the asset library is alpha-2 keyed, and alpha-2 already
handles the home nations via sub-regions.

### Asset source: vendored SVGs, runtime-dependency-free

The needed SVGs are copied from `flag-icons` (`flags/4x3/<code>.svg`) into
`public/flags/<code>.svg`. `flag-icons` is added as a **devDependency** purely as the
licensed (MIT) source of truth; nothing imports it at runtime. Serving static files from
`public/` keeps the flags working offline and avoids coupling the app to the package's file
layout. A `public/flags/README.md` records provenance + license.

### Rendering: plain `<img>`, fixed dimensions

`app/components/Flag.tsx` renders `<img src={`/flags/${code}.svg`}>` at a fixed 20×15 (4:3)
box. Plain `<img>` to a `public/` path avoids `next/image` configuration entirely, which is
the stable choice in this Next version (per `AGENTS.md`, this is not stock Next.js). Fixed
dimensions prevent layout shift and keep the existing `LIVE`/seed badges from being pushed
around. The flag is decorative (`alt=""`, `aria-hidden`) because the team name sits beside
it as text. An unknown name resolves to `null` → renders nothing (no broken image).

### Where the map lives

`lib/flags.ts`, not the engine. The engine is pure tournament logic; flags are a
presentation concern. Names are already canonical at render time (ESPN names are normalized
via `normalizeTeamName` in `lib/engine/groups.ts`), so `flagCode` does a direct lookup with
no re-normalization.

## Risks / Trade-offs

- **`@next/next/no-img-element` lint rule** may flag the `<img>`. Mitigation: a scoped
  `// eslint-disable-next-line` in `Flag.tsx`, justified — a tiny static flag gains nothing
  from `next/image` and avoids its config surface. Preferred over reconfiguring the build.
- **A team could be added without a flag.** Mitigation: `lib/flags.test.ts` iterates
  `GROUPS` and fails if any team lacks a code or its SVG file is missing.
- **Vendored assets can drift from upstream.** Accepted: flags are effectively static;
  provenance is recorded so they can be refreshed deliberately if a design changes.

## Migration

None. Additive UI; no data, API, or engine changes.
