## Purpose

The match cache capability provides a two-tier caching strategy: completed match results are persisted to disk (write-once) and live/scheduled match data is held in memory. The cache is the sole source of truth for all standings and bracket computations — no module may call ESPN directly for match results.

## Requirements

### Requirement: On-disk cache for completed matches
The system SHALL persist finalized match results to a JSON file on disk under `data/cache/`. A match SHALL be written to disk exactly once, when its status transitions to `final`. Completed match data SHALL never be re-fetched from any external API.

#### Scenario: First completion of a match
- **WHEN** a match transitions to `final` status for the first time
- **THEN** its result SHALL be written to the on-disk cache

#### Scenario: Server restart
- **WHEN** the Next.js server restarts
- **THEN** all previously finalized match results SHALL be available from disk without any outbound API calls

#### Scenario: Write-once guard
- **WHEN** a match ID already exists in the on-disk cache
- **THEN** the system SHALL skip the write and SHALL NOT overwrite the existing entry

### Requirement: In-memory cache for live data
The system SHALL maintain an in-memory store for live and in-progress match data. In-memory data SHALL be discarded on server restart and re-fetched from ESPN on the next request.

#### Scenario: Live match data
- **WHEN** a match is `in-progress` or `scheduled`
- **THEN** its data SHALL be held in memory only, not written to disk

#### Scenario: Cache merge on read
- **WHEN** the standings engine or bracket module requests all match results
- **THEN** the system SHALL merge the on-disk completed matches with the in-memory live matches and return a unified result set

### Requirement: Cache is the sole source of truth for match results
All standings and bracket computations SHALL read match results exclusively from the cache layer. No module SHALL call ESPN directly for match results; all ESPN calls are funneled through the ingestion pipeline which writes to cache.

#### Scenario: Standings computation
- **WHEN** the standings engine is invoked
- **THEN** it SHALL receive match results from the cache layer, not from a direct ESPN call
