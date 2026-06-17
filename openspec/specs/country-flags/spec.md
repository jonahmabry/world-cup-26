## Purpose

Every group-stage team renders with its national flag — a fast visual key for scanning 48
teams across the UI. Flags are bundled SVG assets keyed by a stable country code (so they
render on Windows, where emoji flags do not, and offline), with distinct flags for the UK
home nations, which compete as separate teams.

## Requirements

### Requirement: Every group-stage team renders with its national flag

The UI SHALL display a country flag next to every resolved group-stage team name, in every
section that lists teams: the group standings tables, the third-place ranking table, and
the resolved team slots of the projected knockout bracket. The flag SHALL appear to the
left of the team name and SHALL NOT displace or clip adjacent badges (e.g. `LIVE`) or the
points column.

#### Scenario: Group table row shows a flag

- **WHEN** a group standings table renders a team row
- **THEN** the team's flag SHALL appear immediately left of the team name, at a fixed size
  that does not shift the row layout

#### Scenario: Bracket slot shows a flag for a resolved team

- **WHEN** a knockout bracket match slot is filled by a resolved team (not a placeholder)
- **THEN** that team's flag SHALL appear left of its name

#### Scenario: Third-place ranking table shows a flag

- **WHEN** the cross-group third-place ranking table renders
- **THEN** each listed team SHALL show its flag left of the name

### Requirement: Home nations use distinct sub-region flags

Teams that are UK home nations SHALL render their own national flag, never a single Union
Jack standing in for all of them.

#### Scenario: England and Scotland render distinct flags

- **WHEN** England and Scotland are displayed
- **THEN** England SHALL render the `gb-eng` flag and Scotland SHALL render the `gb-sct`
  flag (and Wales, if present, SHALL render `gb-wls`) — each visually distinct from the GB
  flag and from each other

### Requirement: Flags are bundled SVG assets, not emoji or remote images

Flags SHALL be served as bundled SVG assets from the application's static assets, so they
render correctly on Windows and without network access. The UI SHALL NOT rely on
regional-indicator emoji flags.

#### Scenario: Flags render offline on Windows

- **WHEN** the app is viewed on Windows with no outbound network access to a flag CDN
- **THEN** every team's flag SHALL still render from the bundled static assets

### Requirement: Unknown team names degrade gracefully

When a team name has no mapped country code, the UI SHALL render no flag rather than a
broken image, and the team name SHALL still display.

#### Scenario: Unmapped name renders without a flag

- **WHEN** a team name with no entry in the code map is rendered
- **THEN** no flag image SHALL be emitted and the team name SHALL still appear

#### Scenario: Every group-stage team is mapped

- **WHEN** the test suite runs
- **THEN** it SHALL assert that every team in the hardcoded group membership has a country
  code and that the corresponding bundled SVG asset exists
