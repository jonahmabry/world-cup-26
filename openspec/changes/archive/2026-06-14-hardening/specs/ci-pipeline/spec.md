## ADDED Requirements

### Requirement: Continuous integration on push and pull request
The project SHALL run an automated continuous-integration pipeline on every push and every pull request
that gates merges on code quality. The pipeline SHALL run linting, type checking, the test suite, and a
production build, and SHALL fail if any step fails.

#### Scenario: Passing change
- **WHEN** a commit is pushed or a pull request is opened and all checks succeed
- **THEN** the CI pipeline SHALL report success

#### Scenario: Failing lint, type, test, or build
- **WHEN** any of lint, type check, test, or build fails for a pushed commit or pull request
- **THEN** the CI pipeline SHALL report failure and identify the failing step

#### Scenario: Deterministic, offline test run
- **WHEN** the test step runs in CI
- **THEN** it SHALL complete without any outbound network calls (tests use fixtures, not live ESPN)

### Requirement: Standalone type-check script
The project SHALL expose a `typecheck` script that runs the TypeScript compiler in no-emit mode, so type
errors can be detected independently of the Next.js build, both in CI and locally.

#### Scenario: Type error present
- **WHEN** `npm run typecheck` is run and the codebase contains a type error
- **THEN** the command SHALL exit non-zero and report the error

### Requirement: Automated tests cover the core engine modules
The project SHALL maintain automated unit tests covering the pure-logic correctness modules: standings
computation and tiebreakers (including provisional in-progress results), cross-group third-place ranking,
bracket slotting, ESPN response parsing and newly-finished detection, and the cache merge.

#### Scenario: Engine behavior is regression-tested
- **WHEN** a developer changes a covered engine module in a way that alters its output
- **THEN** at least one test SHALL fail, surfacing the behavior change before merge

#### Scenario: Standings tests cover final and provisional inputs
- **WHEN** the standings tests run
- **THEN** they SHALL assert correct tables for both final-only results and results that include an
  in-progress (provisional) match

### Requirement: Deployment is deferred and documented
The CI configuration SHALL NOT deploy the application. It SHALL include a documented, disabled deploy
placeholder recording that a persistent host (writable storage for the on-disk cache and a long-running
process for the poller) is required before continuous deployment is enabled.

#### Scenario: No deploy runs
- **WHEN** the CI pipeline runs on any push or pull request
- **THEN** no deployment SHALL be performed and the deploy placeholder SHALL remain disabled
