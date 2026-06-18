## ADDED Requirements

### Requirement: Resolved bracket teams render their FIFA World Ranking

The projected knockout bracket SHALL display each resolved team's frozen FIFA World Ranking
position (from the `lib/engine/fifaRanking.ts` snapshot) to the right of the team name. The
ranking SHALL be right-aligned in a fixed-width gutter so that the rankings form a clean
vertical column across rows, independent of team-name length. The ranking SHALL be shown as
`#<position>` (e.g. `#1`, `#11`).

#### Scenario: Resolved team shows its ranking

- **WHEN** a knockout bracket match slot is filled by a resolved team (`kind === 'team'`)
- **THEN** that team's FIFA World Ranking SHALL render as `#<position>` to the right of its name

#### Scenario: Rankings align across rows of differing name length

- **WHEN** two resolved teams with different name lengths (e.g. "Iran" and
  "Bosnia and Herzegovina") render in the bracket
- **THEN** their ranking numbers SHALL appear at the same horizontal position (right-aligned in
  a fixed gutter), not trailing immediately after each variable-length name

### Requirement: Unresolved slots and unranked teams show no ranking

Placeholder bracket slots SHALL NOT show a ranking, and a resolved team whose name is absent
from the ranking snapshot SHALL degrade gracefully to showing no ranking rather than the
`UNRANKED` sentinel value.

#### Scenario: Placeholder slot shows no ranking

- **WHEN** a bracket slot is a placeholder (`tbd-pending-ranking`, `winner-of`, or `unknown`)
- **THEN** no FIFA World Ranking SHALL be rendered for that slot

#### Scenario: Unranked resolved name degrades gracefully

- **WHEN** a resolved team's name has no entry in the ranking snapshot (`fifaRank` returns
  `UNRANKED`)
- **THEN** no ranking number SHALL be rendered and the team name SHALL still display
