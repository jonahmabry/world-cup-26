## ADDED Requirements

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
