## Context

The project has vitest configured (`vitest.config.ts`, node environment, `@` alias) and one test
(`lib/engine/allocationTable.test.ts`), run via `npm run test` (`vitest run`). There is no CI. The repo is
on GitHub. The runtime is Next.js 16 with TypeScript strict mode. This change adds engine-level unit tests
and a GitHub Actions pipeline; it deliberately defers deployment because the app's on-disk cache and
in-process `setInterval` poller are incompatible with serverless hosting without a refactor.

## Goals / Non-Goals

**Goals:**
- A fast, deterministic unit-test suite over the pure-logic modules that encode the product's correctness.
- A CI workflow that fails a push/PR on lint, type, test, or build errors.
- Keep the door open for deploy without committing to a host now.

**Non-Goals:**
- No deployment/CD wiring (documented stub only).
- No end-to-end/browser tests (Playwright) — engine logic is the priority and is pure/Node-testable.
- No change to any runtime module's behavior.

## Decisions

### 1. Unit tests target pure-logic modules with fixture inputs
Tests cover `standings.ts`, `thirds.ts`, `bracket.ts`, `espn/client.ts` (parsing + `detectNewlyFinished`),
and `cache/index.ts`. ESPN parsing is tested against small captured JSON fixtures rather than live calls,
keeping tests offline and deterministic. *Alternative considered:* mocking `fetch` for integration-style
tests — deferred; parsing is the risky part and is better tested directly on fixtures. Standings tests
cover both final-only and provisional (in-progress) inputs so they lock in the `data-accuracy` behavior.

### 2. Single GitHub Actions workflow, one Node version
`ci.yml` runs on `push` and `pull_request`: checkout → `actions/setup-node` (Node 20 LTS, matching
`@types/node ^20`, npm cache) → `npm ci` → `lint` → `typecheck` → `test` → `build`. *Alternative
considered:* a Node version matrix — unnecessary for a single-target localhost app; one pinned version is
faster and sufficient.

### 3. `typecheck` as an explicit script
Add `"typecheck": "tsc --noEmit"` to `package.json` so CI (and developers) get a standalone type gate
independent of `next build`. `next build` still runs as the final, build-level check.

### 4. Deploy is a disabled stub, not wired
Include a commented/`if: false` deploy job documenting that a persistent host (writable volume +
long-running process for the disk cache and poller) is required before CD is enabled. *Alternative
considered:* omit deploy entirely — keeping a documented stub records the decision and the follow-up.

## Risks / Trade-offs

- **Tests pin current (possibly imperfect) behavior** → focus assertions on regulation-derived rules
  (tiebreaker order, best-8 cutoff, known allocation combos) rather than incidental output.
- **CI flakiness from network** → tests use fixtures, not live ESPN; no network in CI test runs.
- **`next build` slows CI** → acceptable; it is the only check that catches build-time/RSC issues.

## Open Questions

- Pin Node 20 vs 22 — defaulting to 20 to match the declared `@types/node`. Trivial to bump later.
