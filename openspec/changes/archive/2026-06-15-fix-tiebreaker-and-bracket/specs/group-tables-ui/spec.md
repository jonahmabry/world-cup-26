## MODIFIED Requirements

### Requirement: Show per-team stats columns
Each row in a group table SHALL show: MP (matches played), W, D, L, GF (goals for), GA (goals against), GD (goal difference), Pts. The numeric stat columns SHALL retain fixed widths so they are never clipped or squeezed — in particular, a `LIVE` or `TIE` badge rendered next to a team's name in the Team column SHALL NOT reduce the visible width of the **Pts** column (or any other numeric column). The Team column SHALL absorb overflow (e.g. via truncation) so the layout is stable regardless of badge state.

#### Scenario: Table columns
- **WHEN** a group table is rendered
- **THEN** all 8 stat columns SHALL be visible for every team in that group

#### Scenario: Badge does not clip numeric columns
- **WHEN** a row shows a `LIVE` (and/or `TIE`) badge next to the team name
- **THEN** the **Pts** column SHALL remain fully visible at its fixed width, and the badge SHALL NOT push numeric columns off the table
