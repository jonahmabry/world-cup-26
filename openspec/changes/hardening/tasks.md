## 1. Test scripts & scaffolding

- [x] 1.1 Add `"typecheck": "tsc --noEmit"` to `package.json` scripts
- [x] 1.2 Confirm `npm run test` (vitest) and `npm run typecheck` run clean on the current tree

## 2. Engine unit tests

- [x] 2.1 `lib/engine/standings.test.ts` — tiebreaker Step 1 (H2H), Step 2 (overall GD/GS/fair-play),
  `tiedPendingRanking`, and the provisional in-progress pass (final-only vs provisional inputs)
- [x] 2.2 `lib/engine/thirds.test.ts` — cross-group third-place ranking + best-8 / bottom-4 cutoff
- [x] 2.3 `lib/engine/bracket.test.ts` — R32 slotting (fixed + third-place slots) beyond the existing
  allocation-table test

## 3. Ingestion & cache unit tests

- [x] 3.1 Capture small ESPN scoreboard JSON fixture(s) under a test fixtures path
- [x] 3.2 `lib/espn/client.test.ts` — `parseEvent` / `parseStatus` / `parseGroup` / `parseCards` and
  `detectNewlyFinished` against the fixtures (no network)
- [x] 3.3 `lib/cache/index.test.ts` — `getMergedResults` merges disk (final) + memory (live) correctly

## 4. GitHub Actions CI

- [x] 4.1 Add `.github/workflows/ci.yml` triggered on `push` and `pull_request`
- [x] 4.2 Job steps: checkout → setup-node (Node 20, npm cache) → `npm ci` → `lint` → `typecheck` →
  `test` → `build`
- [x] 4.3 Add a disabled deploy-job stub (e.g. `if: false`) with a comment documenting the persistent-host
  requirement for the disk cache + poller

## 5. Verification

- [x] 5.1 Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` locally; all green
- [ ] 5.2 Push a branch / open a PR and confirm the GitHub Actions run passes end to end
