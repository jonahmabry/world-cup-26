## Purpose

The refresh controls capability covers both the manual refresh button exposed in the UI and the server-side background poller that auto-detects match completions. Together they ensure standings and bracket data stay current without requiring constant user interaction.

## Requirements

### Requirement: Manual refresh button
The UI SHALL provide a manual refresh button that re-runs the full data pipeline: reads the cache, fetches updated data from ESPN for live/scheduled matches, writes any newly-completed matches to disk, and recomputes standings and bracket.

#### Scenario: User triggers manual refresh
- **WHEN** the user clicks the refresh button
- **THEN** the pipeline SHALL run end-to-end and the UI SHALL update with the latest standings and bracket upon completion

#### Scenario: Refresh in progress
- **WHEN** a refresh is already running
- **THEN** the button SHALL be disabled or show a loading state to prevent concurrent pipeline runs

### Requirement: Background poller auto-detects match completion
The system SHALL run a background poller that periodically checks ESPN for match status updates. The poller SHALL trigger a cache write for any match that transitions to `final` during its watch window.

#### Scenario: Match completes during polling
- **WHEN** the poller detects a match that transitioned to `final` since the last poll
- **THEN** the match result SHALL be written to the on-disk cache without requiring a manual refresh

#### Scenario: No matches in window
- **WHEN** no matches are scheduled within ±90 minutes of the current time
- **THEN** the poller SHALL skip its ESPN call for that tick and remain idle

#### Scenario: Active match window
- **WHEN** at least one match is scheduled within ±90 minutes of the current time
- **THEN** the poller SHALL call ESPN approximately every 60 seconds

### Requirement: Poller is a server-side singleton
The background poller SHALL be initialized once on the server (lazy-started on first API request) and SHALL run for the lifetime of the Next.js process. It SHALL NOT create multiple concurrent poll loops if the API route is hit multiple times.

#### Scenario: Multiple requests to the API route
- **WHEN** the Next.js API route that initializes the poller receives multiple requests
- **THEN** only one poller instance SHALL be running at any time
