## Purpose

The ESPN ingestion capability is responsible for fetching World Cup match data from the ESPN hidden scoreboard API. It acts as the sole interface between the application and ESPN, isolating the URL and response shape behind a thin adapter so changes can be made in one place.

## Requirements

### Requirement: Fetch scoreboard from ESPN hidden API
The system SHALL fetch World Cup match data from `site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard` without any API key. The client SHALL be isolated behind a thin adapter so the URL and response shape can be updated in one place.

#### Scenario: Successful scoreboard fetch
- **WHEN** the ingestion client is invoked
- **THEN** it SHALL return a list of matches with fixture date/time, home team, away team, current score, and match status

#### Scenario: Match status classification
- **WHEN** a match is returned from the ESPN scoreboard
- **THEN** the client SHALL classify each match as one of: `scheduled`, `in-progress`, or `final`

#### Scenario: "Match just finished" detection
- **WHEN** a match transitions to `final` status that was previously `in-progress` or `scheduled`
- **THEN** the client SHALL surface that match as newly-finished so the cache layer can trigger enrichment

#### Scenario: ESPN API unavailable
- **WHEN** the ESPN endpoint returns a non-2xx response or times out
- **THEN** the client SHALL throw a typed error and the caller SHALL surface a stale-data warning rather than crashing

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

### Requirement: All ESPN calls are server-side only
The system SHALL route all ESPN HTTP requests through Next.js API route handlers. No ESPN calls SHALL be made from browser-side code.

#### Scenario: Browser request
- **WHEN** the browser needs scoreboard data
- **THEN** it SHALL call the internal Next.js API route, which proxies to ESPN server-side

### Requirement: Ingest knockout-stage matches

The ingestion client SHALL parse and return knockout-stage matches from the ESPN scoreboard, not only
group-stage matches. A knockout match SHALL be recognized by its round, parsed from the competition's
`altGameNote` (e.g. `"FIFA World Cup, Round of 32"`), mapped to one of `R32`, `R16`, `QF`, `SF`,
`ThirdPlace`, or `Final`. A knockout match SHALL carry a null group identifier and its parsed round.
An event that resolves to neither a group nor a known knockout round SHALL continue to be skipped.

#### Scenario: Knockout event is no longer discarded
- **WHEN** an ESPN event has no `Group X` note but its `altGameNote` identifies a knockout round
- **THEN** the client SHALL return it as a match with a null group identifier and the parsed
  knockout round, rather than discarding it

#### Scenario: Round parsed from the game note
- **WHEN** a knockout event's `altGameNote` reads "FIFA World Cup, Round of 32"
- **THEN** the match's round SHALL be classified as `R32`; the analogous notes SHALL map to `R16`,
  `QF`, `SF`, `ThirdPlace`, and `Final`

#### Scenario: Unrecognized event still skipped
- **WHEN** an event resolves to neither a valid group nor a known knockout round
- **THEN** the client SHALL skip it as before

#### Scenario: Knockout matches excluded from group standings
- **WHEN** ingested matches include knockout matches with a null group identifier
- **THEN** the standings engine SHALL ignore them so they never enter any group table, the
  third-place ranking, or the clinch computation

### Requirement: Capture match winner and penalty shootout result

For each match the client SHALL capture which competitor ESPN marks as the winner, and, when a match
is decided by a penalty shootout, the per-team shootout score. The winner indication SHALL be taken
from ESPN's per-competitor `winner` flag so that a match level after regulation/extra time still
yields a definite winner. Penalty data SHALL be parsed defensively, since ESPN's shootout field shape
is not yet observed in live data, and its absence SHALL NOT prevent a match from being returned.

#### Scenario: Winner captured from ESPN
- **WHEN** a knockout match is final
- **THEN** the returned match SHALL record whether the home or away team won, taken from ESPN's
  per-competitor winner flag

#### Scenario: Penalty shootout scores captured
- **WHEN** a final knockout match was decided by a penalty shootout
- **THEN** the returned match SHALL include each team's shootout score in addition to the
  regulation/extra-time score

#### Scenario: Missing penalty data does not break ingestion
- **WHEN** a match has no shootout information
- **THEN** the match SHALL still be returned with its score, status, and winner, and no shootout
  scores
