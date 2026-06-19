## Purpose

Every resolved team in the projected knockout bracket renders its frozen FIFA World Ranking
position — the same Step-3 group-tiebreaker snapshot (`lib/engine/fifaRanking.ts`) — so the
seeding behind each matchup is readable at a glance without bouncing back to the group tables.
The ranking sits in a fixed-width gutter between the flag and the team name so the names line
up across rows. This is the frozen pre-tournament snapshot; a live, projection-driven ranking
is the separate `live-ranking-bracket` capability.

## Requirements

### Requirement: Resolved bracket teams render their FIFA World Ranking

The projected knockout bracket SHALL display each resolved team's frozen FIFA World Ranking
position (from the `lib/engine/fifaRanking.ts` snapshot) between the team's flag and its name.
The ranking SHALL occupy a fixed-width gutter so that the team names line up at a consistent
horizontal start position across rows, independent of how many digits the ranking has. The
ranking SHALL be shown as the bare position number (e.g. `1`, `11`).

#### Scenario: Resolved team shows its ranking

- **WHEN** a knockout bracket match slot is filled by a resolved team (`kind === 'team'`)
- **THEN** that team's FIFA World Ranking SHALL render as the bare position number, positioned
  between the team's flag and its name

#### Scenario: Team names align across rows of differing ranking width

- **WHEN** resolved teams with one-digit and two-digit rankings (e.g. `5` and `24`) render in
  the bracket
- **THEN** the ranking SHALL sit in a fixed-width gutter so that the team names start at the
  same horizontal position regardless of ranking width

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
