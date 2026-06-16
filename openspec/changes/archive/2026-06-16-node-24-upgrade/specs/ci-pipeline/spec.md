## ADDED Requirements

### Requirement: Supported Node.js runtime across CI and local development
The project SHALL target a supported, non-deprecated Node.js LTS — currently **Node 24** — and SHALL
enforce it consistently in both continuous integration and local development. CI SHALL provision that
Node version for every pipeline run; the project SHALL declare the minimum version via `engines.node` in
`package.json`; and the repository SHALL pin the same major version in a version-manager file (`.nvmrc`)
so contributors' local Node matches CI. The declared `@types/node` major SHALL track the targeted runtime.

#### Scenario: CI runs on the supported Node version
- **WHEN** the CI pipeline runs on any push or pull request
- **THEN** it SHALL provision Node 24 (the version declared by `engines.node`) and SHALL NOT run on the
  deprecated Node 20 runtime

#### Scenario: Unsupported local Node is flagged
- **WHEN** dependencies are installed on a Node version below the declared `engines.node` minimum
- **THEN** the package manager SHALL surface an engines warning identifying the required version

#### Scenario: Local environment matches CI
- **WHEN** a contributor selects the project's Node version via a version manager (e.g. `nvm use`)
- **THEN** the `.nvmrc` SHALL resolve to the same major version that CI provisions

#### Scenario: Pipeline behavior is unchanged by the runtime bump
- **WHEN** the pipeline runs on the supported Node version
- **THEN** it SHALL still run linting, type checking, the test suite, and a production build, and SHALL
  fail if any step fails
