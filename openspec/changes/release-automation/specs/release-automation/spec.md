## ADDED Requirements

### Requirement: Release notes are recorded per change as changeset files

The project SHALL record release notes as committed changeset files (one per change),
each declaring the semantic-version bump type, so that release content is reviewed
alongside the code it describes rather than written by hand at release time.

#### Scenario: Contributor records a release note

- **WHEN** a contributor makes a user-facing change and runs the changeset tool
- **THEN** a markdown changeset file declaring the bump type (`major` / `minor` /
  `patch`) and a summary SHALL be created and committed with the change

#### Scenario: Pending release content is discoverable

- **WHEN** `changeset status` is run with unreleased changeset files present
- **THEN** it SHALL list the pending changesets and the version bump they imply

### Requirement: Automated version bump and changelog generation

The project SHALL bump `package.json` `version` and regenerate `CHANGELOG.md`
automatically from accumulated changeset files, rather than by manual edits. New
changelog entries SHALL be prepended above the preserved pre-automation history.

#### Scenario: Version step consumes pending changesets

- **WHEN** the version step runs with pending changeset files
- **THEN** `package.json` `version` SHALL be bumped according to the highest pending bump
  type, a corresponding entry SHALL be prepended to `CHANGELOG.md`, and the consumed
  changeset files SHALL be removed

#### Scenario: Existing history is preserved

- **WHEN** the changelog is regenerated
- **THEN** the hand-written `0.1.0`–`0.1.3` history SHALL remain intact below the newly
  generated entries

### Requirement: Automated git tag and GitHub Release on release

The project SHALL, on release, create a git tag for the new version and publish a
matching GitHub Release, driven by a CI workflow that opens a review pull request for the
version bump before it is applied.

#### Scenario: Release pull request is opened

- **WHEN** one or more changeset files are present on the base branch
- **THEN** the release workflow SHALL open or update a pull request containing the version
  bump and changelog update

#### Scenario: Tag and release on merge

- **WHEN** the release pull request is merged to the base branch
- **THEN** the workflow SHALL create a git tag for the new version and publish a GitHub
  Release for that tag

### Requirement: No registry publish for the private package

The project is a private package and SHALL NOT be published to any package registry. The
release automation SHALL still version and tag the private package.

#### Scenario: Release does not publish to a registry

- **WHEN** the release workflow runs its publish step
- **THEN** it SHALL create git tags and GitHub Releases only, and SHALL NOT publish the
  package to npm or any other registry

### Requirement: Documented pre-1.0 versioning convention

While the project is pre-`1.0.0`, the version bump convention SHALL be documented so that
changeset bump types map predictably: a breaking change selects a **minor** bump, a
feature or fix selects a **patch** bump, and a **major** bump is reserved for the
`1.0.0` tournament-stable launch.

#### Scenario: Convention is available to contributors

- **WHEN** a contributor needs to choose a bump type for a changeset
- **THEN** project documentation SHALL state that pre-1.0 breaking changes use `minor`,
  features/fixes use `patch`, and `major` is reserved for `1.0.0`
