## Purpose

The match-schedule capability presents the full tournament fixture list on a `/schedule` page: all 72 group-stage fixtures plus the projected knockout matchups, organized one phase at a time (Matchday 1–3, Round of 32 through the Final). Group-stage rows join live scores from the snapshot's merged match results to a static, validated fixture table; knockout rows render projected matchups from the bracket, placing clinched teams early and falling back to seed placeholders otherwise.

## Requirements

### Requirement: Provide a static group-stage fixture model

The system SHALL include a hardcoded table of all 72 group-stage fixtures, sourced from the
official FIFA 2026 schedule. Each fixture SHALL carry its group, matchday (1–3), the two teams
by **canonical** name, an ISO local date, a kickoff time (Central Daylight Time display string),
and a host city. The table SHALL be validated at load: exactly 12 groups, 6 fixtures per group,
and each team appearing in exactly 3 fixtures. Live scores SHALL come from ingested match
results, not from this table.

#### Scenario: Fixture table completeness
- **WHEN** the group-fixtures table is loaded
- **THEN** validation SHALL assert 72 fixtures total, 6 per group across 12 groups, and each of
  the 48 teams in exactly 3 fixtures, treating any deviation as a build-time error

#### Scenario: Fixtures use canonical team names
- **WHEN** a fixture references a team
- **THEN** it SHALL use the canonical name (e.g. `Bosnia and Herzegovina`, `USA`, `DR Congo`),
  matching the names used by the standings engine

### Requirement: Join live scores to group fixtures

Each group fixture's result SHALL be resolved from the merged match results on the snapshot by
matching `(groupId, normalized home team, normalized away team)` as an unordered pair, applying
the existing team-name normalization to the ingested match before comparing.

#### Scenario: Score joined regardless of name variant
- **WHEN** an ingested match for a fixture uses a non-canonical ESPN name (e.g.
  `Bosnia-Herzegovina`)
- **THEN** normalization SHALL still match it to the canonical fixture and attach its score

#### Scenario: Unplayed fixture has no score
- **WHEN** no merged match result matches a fixture
- **THEN** the fixture SHALL be treated as upcoming and render its kickoff time instead of a
  score

### Requirement: Show one phase at a time, defaulting to the current phase

The `/schedule` page SHALL present exactly one phase at a time, drawn from the ordered phase
list: Matchday 1, Matchday 2, Matchday 3, Round of 32, Round of 16, Quarter-finals,
Semi-finals, Third place, Final. Each phase SHALL have a calendar date window, and every match
SHALL belong to the phase whose window contains its date. On load with no phase specified, the
page SHALL display the current phase.

#### Scenario: Default to current phase
- **WHEN** the schedule is opened without a phase specified
- **THEN** it SHALL display the phase whose date window contains today; if today falls in a gap
  between phases it SHALL display the next upcoming phase; before the tournament it SHALL
  display Matchday 1 and after the Final it SHALL display the Final

#### Scenario: Only one phase visible
- **WHEN** a phase is displayed
- **THEN** only that phase's matches SHALL be shown; selecting a different phase SHALL replace
  the displayed matches entirely

### Requirement: Address the displayed phase with a date query parameter

The displayed phase SHALL be addressable via a `?date=` query parameter whose value is the
phase's start date in `YYYY-MM-DD` form (e.g. Matchday 1 → `/schedule?date=2026-06-11`).
Navigating between phases SHALL update the URL. An unknown, missing, or malformed value SHALL
fall back to the current phase.

#### Scenario: Phase resolved from the param
- **WHEN** the page is opened with `?date=` equal to a phase's start date
- **THEN** that phase SHALL be displayed

#### Scenario: Invalid param falls back
- **WHEN** the `?date=` value matches no phase start date or is malformed
- **THEN** the current phase SHALL be displayed

### Requirement: Navigate phases with a clamped ±1 sliding window

The phase navigation SHALL render only the previous, current, and next phase as buttons,
recomputed around whichever phase is displayed, and clamped at the ends of the phase list.

#### Scenario: Middle of the sequence shows three buttons
- **WHEN** a phase with both a predecessor and a successor is displayed
- **THEN** the navigation SHALL show exactly three buttons: previous, current, next

#### Scenario: Ends are clamped
- **WHEN** the first phase (Matchday 1) is displayed
- **THEN** the navigation SHALL show only Matchday 1 and Matchday 2; likewise the Final SHALL
  show only Third place and Final

### Requirement: Split a phase into day-sections sorted by calendar day

Within the displayed phase, matches SHALL be grouped into sections by calendar day, ordered
chronologically, with a header naming the weekday and date (e.g. `THU, JUN 18`). Day-of-week
SHALL be derived from each match's ISO date.

#### Scenario: Day-grouped layout
- **WHEN** a phase spanning multiple days is displayed
- **THEN** each day SHALL appear as its own section in date order with a weekday + date header,
  listing that day's matches

### Requirement: Render group-stage rows with score or kickoff

A group-stage match row SHALL show both teams with their flags, the host city, and either the
final/in-progress score or, for an upcoming match, the kickoff time. In-progress matches SHALL
be visually marked as live.

#### Scenario: Finished group match
- **WHEN** a group fixture has a final result
- **THEN** its row SHALL show the inline score and the venue

#### Scenario: Upcoming group match
- **WHEN** a group fixture has no result yet
- **THEN** its row SHALL show the kickoff time and the venue instead of a score

#### Scenario: Live group match
- **WHEN** a group fixture is in progress
- **THEN** its row SHALL show the current score with a live indicator

### Requirement: Render knockout rows as projected matchups

Knockout-phase rows (Round of 32 through the Final) SHALL be rendered from the projected
bracket. Each row SHALL show the matchup — a resolved team with its flag where known, otherwise
a placeholder — the host city, and the kickoff time. Knockout rows SHALL NOT show a score.

#### Scenario: Projected knockout fixture
- **WHEN** a knockout phase is displayed
- **THEN** each row SHALL show its projected matchup, venue, and kickoff time, and SHALL NOT
  render a score

### Requirement: Place clinched teams into the Round of 32, else show seed placeholders

Before the group stage is complete, a Round-of-32 group slot (group winner or runner-up) SHALL
show the concrete team only when that team is mathematically locked into that group position;
otherwise it SHALL show a seed placeholder (e.g. `1E`, `2A`). Third-place slots SHALL show their
static group-set placeholder (e.g. `3ABCDF`) and later-round slots SHALL show a winner-of
placeholder (e.g. `W73`) until they resolve. Once every group fixture is final, all Round-of-32
slots SHALL show concrete teams from the projected bracket. The group stage SHALL be considered
complete only when all 72 group fixtures have a final result.

#### Scenario: Clinched group winner placed early
- **WHEN** a team has secured 1st in its group with group matches still to play
- **THEN** that team SHALL appear in its Round-of-32 slot while the group stage is still ongoing

#### Scenario: Unclinched slot shows a seed placeholder
- **WHEN** a group position is not yet mathematically locked
- **THEN** the corresponding Round-of-32 slot SHALL show its seed placeholder rather than a team

#### Scenario: Full resolution after the group stage
- **WHEN** all 72 group fixtures are final
- **THEN** every Round-of-32 slot SHALL show the concrete team assigned by the projected bracket

### Requirement: Expose the schedule in navigation

The site navigation SHALL include a link to the `/schedule` page alongside the existing
Standings and Bracket links.

#### Scenario: Schedule tab present
- **WHEN** the navigation is rendered
- **THEN** it SHALL include a Schedule link pointing to `/schedule`
