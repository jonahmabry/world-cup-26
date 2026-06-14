## MODIFIED Requirements

### Requirement: Compute per-group standings from match results
The standings engine SHALL compute a standings table for each of the 12 groups (A–L) from raw match
results. Group membership SHALL be hardcoded from the completed 2026 draw and SHALL NOT be fetched from
any API. The engine SHALL incorporate `in-progress` matches as **provisional** results, accumulating them
from the current live score exactly as a `final` match would be counted; `scheduled` matches that have not
kicked off SHALL NOT contribute.

#### Scenario: Standard standings computation
- **WHEN** a set of match results is provided
- **THEN** the engine SHALL produce a table per group with: team name, matches played, wins, draws,
  losses, goals scored, goals against, goal difference, and points (W=3, D=1, L=0)

#### Scenario: In-progress match contributes provisionally
- **WHEN** a match is `in-progress` with a current score (e.g. a team leading 1–0)
- **THEN** both teams' rows SHALL reflect that live result provisionally — matches played, W/D/L, goals,
  goal difference, and points are accumulated from the current score

#### Scenario: Provisional result updates as the live score changes
- **WHEN** the live score of an in-progress match changes (e.g. equalizer makes it 1–1)
- **THEN** the affected rows SHALL recompute from the new score on the next pipeline run

#### Scenario: Unplayed matches
- **WHEN** a match is `scheduled` and has not kicked off
- **THEN** it SHALL NOT contribute to either team's standings row

## ADDED Requirements

### Requirement: Flag provisional standings rows
The standings engine SHALL mark each standings row that reflects at least one in-progress match with a
`provisional` flag, so consumers can distinguish a live/volatile row from one derived solely from final
results.

#### Scenario: Row derived from a live match
- **WHEN** any match contributing to a team's row is `in-progress`
- **THEN** that team's row SHALL be returned with `provisional: true`

#### Scenario: Row derived only from finals
- **WHEN** every match contributing to a team's row is `final`
- **THEN** that team's row SHALL be returned with `provisional: false`
