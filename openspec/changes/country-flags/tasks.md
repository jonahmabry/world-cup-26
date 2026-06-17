## 1. Team → country-code map

- [x] 1.1 Add `lib/flags.ts`: `TEAM_CODES: Record<string, string>` with one entry per
  canonical team name in `GROUPS` (`lib/engine/groups.ts`); home nations use `gb-eng`,
  `gb-sct`, plus `gb-wls` for completeness
- [x] 1.2 Add `flagCode(teamName: string): string | null` (direct lookup, `null` if unknown)

## 2. Flag assets (vendored)

- [x] 2.1 Add `flag-icons` as a devDependency (asset source only)
- [x] 2.2 Copy `node_modules/flag-icons/flags/4x3/<code>.svg` → `public/flags/<code>.svg`
  for all mapped codes (48 teams + `gb-wls`)
- [x] 2.3 Add `public/flags/README.md` recording provenance + MIT license

## 3. `<Flag>` component + render sites

- [x] 3.1 Add `app/components/Flag.tsx`: resolve name→code, render `<img src="/flags/<code>.svg">`
  at fixed 20×15, `alt=""` / `aria-hidden`; render nothing for unknown names
- [x] 3.2 `GroupTable.tsx` — render `<Flag>` left of the team name in the row
- [x] 3.3 `Bracket.tsx` — render `<Flag>` left of the name in the `kind === 'team'` slot
- [x] 3.4 `app/page.tsx` — render `<Flag>` left of the name in the third-place table

## 4. Tests

- [x] 4.1 `lib/flags.test.ts`: every team in `GROUPS` has a non-null `flagCode`, and each
  mapped code has an existing `public/flags/<code>.svg` file

## 5. Verification

- [x] 5.1 `npm run lint` green (handle `@next/next/no-img-element` with a scoped disable if it fires)
- [x] 5.2 `npm run typecheck`, `npm run test`, `npm run build` all green
- [x] 5.3 `npm run dev`: flags show in group tables, bracket R32 slots, and the thirds
  table; Scotland and England render distinct flags; no layout shift / no badge clipping
- [x] 5.4 `npx changeset` to record a `patch` release note
- [x] 5.5 Commit, push `feat/country-flags`, open PR; confirm CI green
