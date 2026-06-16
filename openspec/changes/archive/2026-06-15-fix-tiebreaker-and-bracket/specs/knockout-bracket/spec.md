## MODIFIED Requirements

### Requirement: Propagate tiedPendingRanking into bracket slots
A bracket slot SHALL show the resolved team whenever the standings engine determines that team — including ties broken by the FIFA World Ranking snapshot (Step 3). The bracket SHALL fall back to a "TBD — FIFA Ranking" marker **only** for the rare case where a slot's team remains `tiedPendingRanking` because the ranking could not separate the tie (equal ranking position, or a team absent from the snapshot). Because ties are now resolved by ranking, the Round of 32 SHALL populate with concrete teams from the first day of the group stage, including groups whose teams are level or have not yet played (ordered by FIFA ranking as part of the provisional snapshot).

#### Scenario: Tie resolved by ranking populates the slot
- **WHEN** a bracket slot's team was level with another through Steps 1–2 but is separated by the FIFA World Ranking
- **THEN** that slot SHALL display the resolved team name, not "TBD"

#### Scenario: Unresolved tie falls back to TBD
- **WHEN** a bracket slot's team remains `tiedPendingRanking` because the ranking could not separate the tie
- **THEN** that slot SHALL be marked "TBD — FIFA Ranking" rather than showing a definitive team name

#### Scenario: Round of 32 populated from day one
- **WHEN** the bracket is computed early in the group stage (teams level or not yet played)
- **THEN** the R32 team slots SHALL still show concrete teams, ordered using the FIFA World Ranking snapshot where measurable criteria are tied
