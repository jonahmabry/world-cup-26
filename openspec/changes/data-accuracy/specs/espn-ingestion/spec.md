## ADDED Requirements

### Requirement: Fetch a date range of matches
The ESPN ingestion client SHALL support fetching all matches within an inclusive date range, not only
the default (current day) scoreboard, so that matches played before the application first ran can be
retrieved. The range query SHALL be issued through the same adapter and parsed identically to the default
scoreboard fetch.

#### Scenario: Range fetch returns historical matches
- **WHEN** the client is invoked with a start date and an end date
- **THEN** it SHALL return every match whose fixture date falls within that inclusive range, each
  normalized with date/time, home team, away team, score, and status — identical in shape to a default
  scoreboard result

#### Scenario: Range fetch for a window with no matches
- **WHEN** the client is invoked with a date range that contains no scheduled matches
- **THEN** it SHALL return an empty list rather than throwing

#### Scenario: Range fetch failure
- **WHEN** the ESPN endpoint returns a non-2xx response or times out during a range fetch
- **THEN** the client SHALL throw the same typed error used for the default fetch so callers can surface
  a stale-data warning rather than crashing
