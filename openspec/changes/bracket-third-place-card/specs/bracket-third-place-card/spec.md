## ADDED Requirements

### Requirement: Model the third-place play-off as match M103

The knockout schedule SHALL include the third-place play-off as match **M103**, a first-class
knockout match on the `ThirdPlace` round. M103 SHALL be fed by the two Semi-finals (M101 and M102),
carry the same metadata as every other match (host city, date, kickoff time keyed by match number),
and SHALL NOT be referenced by any other match.

#### Scenario: M103 present in the schedule

- **WHEN** the knockout schedule is read
- **THEN** it SHALL contain an entry for M103 on the `ThirdPlace` round whose feed structure is the two
  Semi-finals (M101, M102)

#### Scenario: M103 carries venue and schedule metadata

- **WHEN** the third-place card is rendered
- **THEN** M103 SHALL show its host city, date, and kickoff time (e.g. "Miami", "JUL 18") sourced from
  the official FIFA 2026 schedule, in the same format as every other bracket match

#### Scenario: M103 is a leaf of the tree

- **WHEN** the knockout schedule is validated
- **THEN** the Final (M104) SHALL remain the single tree root and no match SHALL reference M103 as a feed

### Requirement: Express a slot as the loser of a feeding match

A bracket slot SHALL be expressible as a reference to the **loser** of a specific earlier match,
identified by that match's number, parallel to the existing winner-of reference. The third-place
play-off (M103) SHALL use loser-of references for both of its slots: the losers of M101 and M102.

#### Scenario: M103 slots are loser-of references

- **WHEN** the bracket is computed
- **THEN** M103's two slots SHALL be loser-of references to M101 and M102, never winner-of references

#### Scenario: Loser-of slot rendering

- **WHEN** a slot is a loser-of reference and its feeding match has not resolved
- **THEN** that slot SHALL display the loser-of reference for its feeding match (e.g. "L101") rather
  than a team name

#### Scenario: Only the third-place round uses loser-of

- **WHEN** any match other than M103 is computed
- **THEN** its later-round slots SHALL remain winner-of references; loser-of references SHALL appear
  only on the `ThirdPlace` round

### Requirement: Render the third-place play-off as a detached card

The bracket UI SHALL render M103 as a single detached match card positioned near the bottom-right of
the bracket diagram, outside the per-round column tree. The card SHALL reuse the standard match-card
and team-slot presentation and SHALL NOT draw tree connectors to the Semi-finals or the Final.

#### Scenario: Detached card is shown

- **WHEN** the bracket page is rendered
- **THEN** a third-place card for M103 SHALL appear near the bottom-right of the diagram, visually
  separate from the R32 → Final column tree and without connector lines

#### Scenario: Card reuses standard slot presentation

- **WHEN** the third-place card renders its two slots
- **THEN** each slot SHALL use the same team-slot rendering as the rest of the bracket — resolved teams
  show their flag, name, and FIFA ranking; unresolved slots show their loser-of reference
