## MODIFIED Requirements

### Requirement: Render knockout rows as projected matchups

Knockout-phase rows (Round of 32 through the Final) SHALL be rendered from the bracket. Each row SHALL
show the matchup — a resolved team with its flag where known, otherwise a placeholder — the host city,
and, depending on match state, either the kickoff time (upcoming) or the score (in-progress or final).
The score presentation SHALL match the group-stage rows: an in-progress match SHALL show the current
score with the same live indicator used for group matches, and a final match SHALL show the final
score. A match decided by a penalty shootout SHALL show each team's regulation goals with shootout
goals in parentheses (e.g. `1 (4) – 1 (2)`).

#### Scenario: Upcoming knockout fixture
- **WHEN** a knockout match has not started
- **THEN** its row SHALL show the matchup (resolved teams or placeholders), the venue, and the kickoff
  time, and SHALL NOT show a score

#### Scenario: Live knockout fixture
- **WHEN** a knockout match is in progress
- **THEN** its row SHALL show the current score with the same live indicator as group-stage rows

#### Scenario: Final knockout fixture
- **WHEN** a knockout match is final
- **THEN** its row SHALL show the final score, matching the group-stage row presentation

#### Scenario: Penalty shootout result in the schedule
- **WHEN** a final knockout match was decided by a penalty shootout
- **THEN** its row SHALL show each team's regulation goals with shootout goals in parentheses
  (e.g. `1 (4) – 1 (2)`)
