## Purpose

The standings engine computes per-group standings tables for all 12 groups (A–L) from raw match results, applies the official FIFA 2026 tiebreaker sequence, emits a `tiedPendingRanking` flag for unresolvable ties, and ranks all 12 third-placed teams to determine the best 8 that advance to the Round of 32.

## Requirements

### Requirement: Compute per-group standings from match results
The standings engine SHALL compute a standings table for each of the 12 groups (A–L) from raw match results. Group membership SHALL be hardcoded from the completed 2026 draw and SHALL NOT be fetched from any API. The engine SHALL incorporate `in-progress` matches as **provisional** results, accumulating them from the current live score exactly as a `final` match would be counted; `scheduled` matches that have not kicked off SHALL NOT contribute.

#### Scenario: Standard standings computation
- **WHEN** a set of match results is provided
- **THEN** the engine SHALL produce a table per group with: team name, matches played, wins, draws, losses, goals scored, goals against, goal difference, and points (W=3, D=1, L=0)

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

### Requirement: Apply FIFA 2026 tiebreaker ordering
When two or more teams within a group are level on points, the engine SHALL resolve the tie using the official FIFA 2026 tiebreaker sequence (Step 1 → Step 2 → Step 3 below). The ordering is sourced directly from the FIFA 2026 Competition Regulations.

**Step 1** — applied using only the matches played between the tied teams:
1. Greatest number of points obtained in those matches
2. Superior goal difference from those matches
3. Greatest number of goals scored in those matches

**Step 2** — applied if Step 1 produces no decision, using all group matches:
1. Superior goal difference in all group matches
2. Greatest number of goals scored in all group matches
3. Highest team conduct score (yellow = −1, red = −3, second yellow = −3; higher is better)

**Step 3** — applied if Step 1 and Step 2 produce no decision:
- FIFA/Coca-Cola Men's World Ranking; emits `tiedPendingRanking: true` (cannot be resolved at runtime)

#### Scenario: Head-to-head (Step 1) tiebreak
- **WHEN** two or more teams are equal on points
- **THEN** head-to-head criteria (pts → GD → GS in H2H matches) SHALL be applied first

#### Scenario: Overall goal difference (Step 2) tiebreak
- **WHEN** two or more teams are still equal after Step 1
- **THEN** the team with the higher overall goal difference SHALL rank above the other

#### Scenario: Overall goals scored (Step 2) tiebreak
- **WHEN** two or more teams are still equal after Step 1 and overall GD
- **THEN** the team with more overall goals scored SHALL rank above the other

#### Scenario: Fair-play (Step 2) tiebreak
- **WHEN** two or more teams remain equal through Step 1 and overall GD and overall GS
- **THEN** the team conduct score SHALL be applied (yellow = −1, red = −3, second yellow = −3); higher score ranks above

### Requirement: Emit tiedPendingRanking for unresolvable ties
When two or more teams within a group are equal through every measurable tiebreaker criterion (Steps 1 and 2), the engine SHALL NOT invent an ordering. Instead it SHALL mark those teams with a `tiedPendingRanking` flag, indicating that the FIFA World Ranking must be consulted.

#### Scenario: All criteria exhausted
- **WHEN** two teams are equal through all of Step 1 and Step 2
- **THEN** both SHALL be returned with `tiedPendingRanking: true` and their relative order SHALL be considered undefined until the FIFA World Ranking is applied

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

### Requirement: Cross-group third-place ranking
The engine SHALL rank all 12 third-placed teams (one per group) against each other to identify the best 8 that advance to the Round of 32.

#### Scenario: Ranking third-place teams
- **WHEN** each group's third-place team is known
- **THEN** the engine SHALL rank all 12 by Step 2 criteria only (no H2H — these teams are from different groups and never played each other): overall GD → overall GS → fair-play → tiedPendingRanking

#### Scenario: Best-8 cutoff
- **WHEN** the cross-group third-place ranking is complete
- **THEN** the engine SHALL identify the top 8 as advancing and the bottom 4 as eliminated
