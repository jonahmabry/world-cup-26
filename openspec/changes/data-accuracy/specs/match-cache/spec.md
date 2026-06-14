## ADDED Requirements

### Requirement: Backfill past tournament dates into the on-disk cache
The system SHALL perform a one-time backfill that ingests every finished match across the tournament
window into the on-disk cache, so that matches played before the application first ran are present in
standings and bracket computations. The backfill SHALL write finals through the existing write-once guard
and SHALL track coverage so the full window is not re-fetched on every refresh.

#### Scenario: First run ingests previously-missing finals
- **WHEN** the pipeline runs and the on-disk cache is missing finished matches from earlier dates
- **THEN** the system SHALL fetch those earlier dates once and write each finished match to the on-disk
  cache

#### Scenario: Coverage guard prevents repeated full sweeps
- **WHEN** a past date has been fully backfilled (all of its matches are `final` and cached)
- **THEN** subsequent pipeline runs SHALL NOT re-fetch that date, and routine refreshes SHALL fetch only
  the current/live window

#### Scenario: Backfill survives server restart
- **WHEN** the server restarts after a backfill has completed
- **THEN** the previously backfilled finals SHALL be available from disk and SHALL NOT be re-fetched
