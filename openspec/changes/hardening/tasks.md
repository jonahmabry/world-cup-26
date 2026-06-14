## 1. Test scripts & scaffolding

- [ ] 1.1 Add `"typecheck": "tsc --noEmit"` to `package.json` scripts
- [ ] 1.2 Confirm `npm run test` (vitest) and `npm run typecheck` run clean on the current tree

## 2. Engine unit tests

- [ ] 2.1 `lib/engine/standings.test.ts` — tiebreaker Step 1 (H2H), Step 2 (overall GD/GS/fair-play),
  `tiedPendingRanking`, and the provisional in-progress pass (final-only vs provisional inputs)
- [ ] 2.2 `lib/engine/thirds.test.ts` — cross-group third-place ranking + best-8 / bottom-4 cutoff
- [ ] 2.3 `lib/engine/bracket.test.ts` — R32 slotting (fixed + third-place slots) beyond the existing
  allocation-table test

## 3. Ingestion & cache unit tests

- [ ] 3.1 Capture small ESPN scoreboard JSON fixture(s) under a test fixtures path
- [ ] 3.2 `lib/espn/client.test.ts` — `parseEvent` / `parseStatus` / `parseGroup` / `parseCards` and
  `detectNewlyFinished` against the fixtures (no network)
- [ ] 3.3 `lib/cache/index.test.ts` — `getMergedResults` merges disk (final) + memory (live) correctly

## 4. GitHub Actions CI

- [ ] 4.1 Add `.github/workflows/ci.yml` triggered on `push` and `pull_request`
- [ ] 4.2 Job steps: checkout → setup-node (Node 20, npm cache) → `npm ci` → `lint` → `typecheck` →
  `test` → `build`
- [ ] 4.3 Add a disabled deploy-job stub (e.g. `if: false`) with a comment documenting the persistent-host
  requirement for the disk cache + poller

## 5. Verification

- [ ] 5.1 Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` locally; all green
- [ ] 5.2 Push a branch / open a PR and confirm the GitHub Actions run passes end to end
