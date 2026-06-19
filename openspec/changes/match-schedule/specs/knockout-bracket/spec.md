## MODIFIED Requirements

### Requirement: Display host city, date, and kickoff time per match
Every match in the bracket SHALL carry and display its host city, date, and kickoff time, sourced from the official FIFA 2026 schedule and keyed by match number. Each knockout schedule entry SHALL additionally carry an ISO local date (e.g. `2026-06-30`) alongside the human-readable display date (e.g. `JUN 30`), so that knockout matches can be sorted and grouped by calendar day by downstream consumers (such as the match-schedule view). The bracket UI SHALL continue to render the existing display date and kickoff time unchanged.

#### Scenario: Card shows venue and schedule
- **WHEN** a bracket match card is rendered
- **THEN** it SHALL show the host city (e.g. "Los Angeles", "New York/New Jersey") and the date and kickoff time (e.g. "JUN 30" above "3:30PM")

#### Scenario: Schedule entry carries a sortable ISO date
- **WHEN** a knockout schedule entry is read
- **THEN** it SHALL expose an ISO local date that corresponds to its display date, usable for chronological sorting and day-grouping
