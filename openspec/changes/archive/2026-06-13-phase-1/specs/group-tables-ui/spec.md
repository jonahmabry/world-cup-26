## ADDED Requirements

### Requirement: Render color-coded group standings tables
The UI SHALL display one standings table per group (A–L), each showing all 4 teams ranked by the standings engine. Each team row SHALL be color-coded to reflect its current qualification status.

#### Scenario: Top-2 qualifier (green)
- **WHEN** a team is ranked 1st or 2nd in its group
- **THEN** its row SHALL be highlighted green

#### Scenario: Inside best-8-thirds cutoff (amber)
- **WHEN** a team is ranked 3rd in its group AND the cross-group ranking places it inside the top-8 third-place threshold
- **THEN** its row SHALL be highlighted amber

#### Scenario: Eliminated (red)
- **WHEN** a team is ranked 4th in its group, OR ranked 3rd but outside the top-8 thirds cutoff
- **THEN** its row SHALL be highlighted red

#### Scenario: Status is indeterminate mid-tournament
- **WHEN** not all group matches have been played and qualification is not yet mathematically decided
- **THEN** the color coding SHALL reflect the current snapshot standings (not a projection), and the page SHALL display a note that standings are live and subject to change

### Requirement: Surface tiedPendingRanking state
When the standings engine emits a `tiedPendingRanking` flag for two or more teams (meaning the FIFA World Ranking must be consulted to break the tie), the UI SHALL make this visible rather than showing a false ranking.

#### Scenario: Unresolvable tie
- **WHEN** two teams share a row rank with `tiedPendingRanking: true`
- **THEN** the UI SHALL display a visual indicator (e.g., "TIE — FIFA World Ranking required") alongside the affected rows

### Requirement: Show per-team stats columns
Each row in a group table SHALL show: MP (matches played), W, D, L, GF (goals for), GA (goals against), GD (goal difference), Pts.

#### Scenario: Table columns
- **WHEN** a group table is rendered
- **THEN** all 8 stat columns SHALL be visible for every team in that group
