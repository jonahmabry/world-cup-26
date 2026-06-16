## Why

The CI pipeline pins Node 20 (`actions/setup-node@v4` with `node-version: '20'`), and GitHub is
deprecating the Node 20 runtime its `actions/*` steps run on — so the pipeline will start emitting
deprecation warnings and eventually break. The original `hardening` change explicitly chose Node 20
"to match the declared `@types/node`… trivial to bump later"
(`openspec/changes/archive/2026-06-14-hardening/design.md`); this change executes that bump, moving CI and
local engines to **Node 24** (the current LTS) before the next feature work lands on the toolchain.

## What Changes

- **CI runner → Node 24:** `.github/workflows/ci.yml` sets `node-version: '24'` (from `'20'`). The pipeline
  (lint → typecheck → test → build) is unchanged; only the runtime it executes on moves.
- **Type definitions → Node 24:** `package.json` bumps `@types/node` from `^20` to `^24` so editor/CI types
  match the runtime; `package-lock.json` is refreshed accordingly.
- **Declare a supported engine:** add `"engines": { "node": ">=24.0.0" }` to `package.json` so `npm`
  warns when the project is built on an unsupported Node.
- **Pin local dev:** add a new `.nvmrc` (`24`) so contributors' local Node matches CI (the repo currently
  has no version-manager file).
- **Docs:** `README.md` prerequisites change `Node.js 20+` → `Node.js 24+`; reconcile the `CHANGELOG.md`
  Unreleased entry that already names this change.

No production code, APIs, or runtime behavior change — this is a toolchain/runtime bump only. Next.js 16,
React 19, Vitest 4, ESLint 9, and TypeScript 5 all support Node 24.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `ci-pipeline`: add a requirement that the project targets a **supported (current-LTS) Node.js runtime**,
  enforced consistently across CI (the `setup-node` version) and local development (`engines.node` +
  `.nvmrc`). The existing lint/typecheck/test/build gating requirements are unchanged — this adds the
  runtime-version guarantee, it does not alter what the pipeline runs.

## Impact

- **Config:** `.github/workflows/ci.yml` (runner version); `package.json` (`@types/node`, new `engines`);
  new `.nvmrc`; `package-lock.json` refreshed.
- **Docs:** `README.md` prerequisites; `CHANGELOG.md` Unreleased entry.
- **Dependencies:** `@types/node` major bump (`^20` → `^24`), dev-only. No runtime dependency changes.
- **Risk:** low — version-agnostic pipeline steps, no source changes. The first green CI run on Node 24 is
  the baseline check. `@types/node ^24` could surface stricter Node typings at `typecheck`; resolved in the
  same change if so.
- **Out of scope:** bumping Next/React/other dependencies, and any deployment/CD work (still deferred per
  the `ci-pipeline` spec).
