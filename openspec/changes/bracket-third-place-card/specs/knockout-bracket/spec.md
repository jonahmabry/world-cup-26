## MODIFIED Requirements

### Requirement: Compute a deterministic snapshot bracket
The system SHALL compute a projected knockout bracket representing the draw "if the group stage ended at this moment." The bracket SHALL cover the full knockout tree — Round of 32 (M73–M88), Round of 16 (M89–M96), Quarter-finals (M97–M100), Semi-finals (M101–M102), the Final (M104), and the third-place play-off (M103). The Round of 32 SHALL be recomputed on every refresh from the current standings snapshot; later rounds are fixed structural slots referencing prior matches — the winners of their feeding matches, except the third-place play-off (M103), whose slots reference the losers of the two Semi-finals.

#### Scenario: Bracket computed from current standings
- **WHEN** a refresh is triggered
- **THEN** the bracket module SHALL read the current standings (top-2 per group + 8 best thirds) and produce the Round-of-32 matchups, plus the R16, QF, SF, Final, and third-place (M103) matchups that build on them

#### Scenario: Snapshot label
- **WHEN** the bracket is rendered
- **THEN** the UI SHALL display a label such as "Projected bracket — if the group stage ended now" to communicate the snapshot nature

#### Scenario: Later rounds do not change with group results
- **WHEN** group standings change between refreshes
- **THEN** the R32 team slots SHALL update, while R16-and-later slots SHALL remain winner-of references — and the third-place play-off (M103) SHALL remain loser-of references — because they depend on knockout results, not standings
