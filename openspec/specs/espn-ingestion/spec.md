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

### Requirement: All ESPN calls are server-side only
The system SHALL route all ESPN HTTP requests through Next.js API route handlers. No ESPN calls SHALL be made from browser-side code.

#### Scenario: Browser request
- **WHEN** the browser needs scoreboard data
- **THEN** it SHALL call the internal Next.js API route, which proxies to ESPN server-side
