## 1. Seed derivation + rendering

- [x] 1.1 Add exported pure helper `seedFromLabel(label: string): string | null` to
  `app/components/Bracket.tsx` — `"Winner <G>"`→`1<G>`, `"Runner-up <G>"`→`2<G>`,
  `"3rd Group <G>"`→`3<G>`, else `null` (groups A–L only)
- [x] 1.2 In `TeamSlot`'s resolved-team branch (`kind === 'team'`), render the seed (when
  non-null) as a small muted monospace badge trailing the name (`ml-auto shrink-0`), flag
  pinned left; leave TBD / `winner-of` / `unknown` branches unchanged

## 2. Tests

- [x] 2.1 `app/components/Bracket.test.ts`: assert `seedFromLabel` maps the three label
  shapes (`Winner F`→`1F`, `Runner-up A`→`2A`, `3rd Group C`→`3C`) and returns `null` for
  `Winner of M74`, `Annex C pending`, empty, and an out-of-range group letter

## 3. Verification

- [x] 3.1 `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all green
- [x] 3.2 Verified via headless screenshot of `/bracket`: R32 resolved slots show
  `1x`/`2x`/`3x` matching origin, badges aligned vertically (anchored after the flag);
  all R16→Final `Wnn` slots show no badge; venue column and names not clipped
- [x] 3.3 `npx changeset` to record a `patch` release note
- [x] 3.4 Commit, push `feat/bracket-seeding-labels`, open PR; confirm CI green
