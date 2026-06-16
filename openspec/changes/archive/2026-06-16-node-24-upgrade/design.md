## Context

CI (`.github/workflows/ci.yml`) provisions Node via `actions/setup-node@v4` with `node-version: '20'`,
and `package.json` declares `@types/node ^20` with no `engines` field and no version-manager file in the
repo. The `hardening` change chose Node 20 to match `@types/node` and left an open question to "bump later"
(`openspec/changes/archive/2026-06-14-hardening/design.md`). "Later" is now: GitHub is deprecating the
Node 20 runtime its `actions/*` steps execute on, so the pipeline will warn and eventually fail. The app's
toolchain — Next.js 16, React 19, Vitest 4, ESLint 9, TypeScript 5 — all support Node 24 (current LTS).
This change is config/runtime only; no source module changes.

## Goals / Non-Goals

**Goals:**
- Move CI off the deprecated Node 20 runtime onto Node 24 LTS.
- Make the supported version explicit and consistent across CI and local dev (`engines.node` + `.nvmrc`).
- Keep `@types/node` aligned with the runtime so type-checking reflects the real Node API surface.

**Non-Goals:**
- No bump of Next/React/other dependencies (separate, larger concern).
- No deployment/CD work — still deferred per the `ci-pipeline` spec.
- No source-code or test-logic changes; the pipeline steps themselves are unchanged.

## Decisions

### 1. Target Node 24 LTS, pin CI to the major (`'24'`)
`ci.yml` sets `node-version: '24'`. Pinning the major (not a full `24.x.y`) lets `setup-node` resolve the
latest patch, getting security fixes without churn. *Alternatives considered:* Node 22 (also supported, but
24 is the current LTS and maximizes runway before the next deprecation); a version **matrix** (22 + 24) —
rejected, this is a single-target localhost app and one pinned version keeps CI fast, consistent with the
`hardening` decision against a matrix.

### 2. Declare `engines.node` as a floor (`">=24.0.0"`), not an exact pin
`package.json` gains `"engines": { "node": ">=24.0.0" }`. A floor warns contributors on older Node without
hard-failing local installs on newer patch/minor releases. *Alternative considered:* a tighter range (e.g.
`^24`) — rejected as needlessly restrictive for a dev tool; the `.nvmrc` already steers contributors to the
intended major, and CI is the authoritative gate.

### 3. Add `.nvmrc` (`24`) for local/CI parity
The repo has no version-manager file. A bare `.nvmrc` containing `24` lets `nvm`/`fnm` users match CI with
`nvm use`. Kept at the major so it tracks `setup-node`'s resolution rather than pinning a stale patch.

### 4. Bump `@types/node` to `^24` and refresh the lockfile
Move `@types/node ^20` → `^24` so editor and `tsc --noEmit` typings match the Node 24 runtime, then
`npm install` to update `package-lock.json`. This is the one change that can produce real fallout: newer
Node typings are occasionally stricter and may surface a `typecheck` error. If so, it is fixed within this
change (narrow type adjustment), keeping the upgrade atomic.

### 5. Docs reconciliation only
`README.md` prerequisites change `Node.js 20+` → `Node.js 24+`. The `CHANGELOG.md` Unreleased entry already
names this change; reconcile wording rather than add a new entry.

## Risks / Trade-offs

- **`@types/node ^24` surfaces stricter typings** → run `npm run typecheck` immediately after the bump;
  resolve any error in-change. Low likelihood given the small, app-level TS surface.
- **A toolchain dep secretly needs Node < 24** → mitigated by the first full green CI run on Node 24
  (`npm ci → lint → typecheck → test → build`) before merge; all named deps document Node 24 support.
- **Contributors still on Node 20 locally** → `engines.node` warning + `.nvmrc` make the requirement
  visible without blocking; CI is the hard gate.

## Migration Plan

1. Edit `ci.yml`, `package.json` (`@types/node`, `engines`), add `.nvmrc`, update docs.
2. `npm install` to refresh the lockfile; run `npm run typecheck && npm run test` locally on Node 24.
3. Push; confirm the CI run is green on Node 24 with no Node-20 deprecation warning.
4. **Rollback:** revert the commit — pure config, no data/state migration, so reverting fully restores the
   Node 20 setup.

## Open Questions

_None._ The `hardening` "bump later" question is resolved here in favor of Node 24 LTS.
