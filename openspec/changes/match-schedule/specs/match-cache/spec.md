## MODIFIED Requirements

### Requirement: In-memory cache for live data
The system SHALL maintain an in-memory store for live and in-progress match data. In-memory data SHALL be discarded on server restart and re-fetched from ESPN on the next request. The unified merged result set (on-disk finals merged with in-memory live/scheduled matches) SHALL be exposed on the snapshot returned by the pipeline, so that view-layer consumers can read individual match results without performing their own cache access.

#### Scenario: Live match data
- **WHEN** a match is `in-progress` or `scheduled`
- **THEN** its data SHALL be held in memory only, not written to disk

#### Scenario: Cache merge on read
- **WHEN** the standings engine or bracket module requests all match results
- **THEN** the system SHALL merge the on-disk completed matches with the in-memory live matches and return a unified result set

#### Scenario: Merged matches exposed on the snapshot
- **WHEN** the pipeline produces a snapshot
- **THEN** that snapshot SHALL include the unified merged match result set, so consumers such as the schedule view can read per-match scores from the snapshot rather than calling the cache directly
