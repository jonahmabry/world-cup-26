## Why

Phase 1 shipped with a single unit test (`lib/engine/allocationTable.test.ts`) and no continuous
integration. The standings/tiebreaker engine, third-place ranking, bracket slotting, and ESPN parsing are
intricate pure-logic modules whose correctness is the whole product. With `data-accuracy` now landed —
and carrying its own tests for the engine behavior it introduced (range fetch, backfill watermark,
provisional standings) — this change locks in a regression net for the *remaining* modules and adds a
GitHub Actions CI pipeline, so the safety net is in place before the next feature (`bracket-tree`) extends
the engine. Without an automated check on every push, mistakes ship silently.

## What Changes

- **Unit test suite (vitest, already configured):** add tests for the high-value pure-logic modules not
  already covered by `data-accuracy` — `standings.ts` (tiebreaker steps on final results),
  `thirds.ts` (cross-group ranking + best-8 cutoff), `bracket.ts` (R32 slotting beyond the
  allocation-table test), `espn/client.ts` (newly-finished detection against fixtures), and
  `cache/index.ts` (disk+memory merge). The range fetch, backfill watermark, and provisional standings
  pass are already tested in `data-accuracy`; this change does not duplicate them.
- **GitHub Actions CI:** add `.github/workflows/ci.yml` that runs, on push and pull request,
  `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build`. Add a `typecheck`
  script (`tsc --noEmit`) to `package.json`.
- **Deploy deferred:** include a documented, disabled deploy-job stub in the workflow noting that the
  app's on-disk cache and in-process poller require a persistent host (not Vercel serverless); the deploy
  step is intentionally not wired up in this change.

No production code behavior changes — this is test and CI infrastructure only.

## Capabilities

### New Capabilities

- `ci-pipeline`: the automated continuous-integration pipeline (lint, typecheck, test, build) that runs on
  every push and pull request, plus the conventions for the project's automated test suite. The unit
  tests themselves are captured as implementation tasks under this capability rather than as separate
  user-facing requirements.

### Modified Capabilities

_None._ (Tests exercise existing capabilities but do not change their requirements.)

## Impact

- **Code / config:** new `.github/workflows/ci.yml`; new `*.test.ts` files alongside the modules under
  `lib/`; a `typecheck` script added to `package.json`. No changes to runtime modules.
- **Dependencies:** none required for unit tests (vitest is already a devDependency). No new runtime deps.
- **CI provider:** GitHub Actions (repo is already on GitHub). First green run establishes the baseline.
- **Sequencing:** lands after `data-accuracy` (which ships its own tests for the range fetch, backfill
  watermark, and provisional pass). This change covers the remaining modules and CI, before `bracket-tree`.
- **Out of scope:** deployment/CD (deferred until a persistent host is chosen) and end-to-end/browser
  tests (Playwright) — may be added later.
