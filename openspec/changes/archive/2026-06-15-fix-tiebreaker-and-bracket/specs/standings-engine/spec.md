## MODIFIED Requirements

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
- The tied teams SHALL be ordered by the FIFA/Coca-Cola Men's World Ranking, using the frozen
  pre-tournament snapshot; the team with the better (numerically lower) ranking position SHALL rank
  above. The engine SHALL emit `tiedPendingRanking: true` **only** when two tied teams share the same
  ranking position, or a tied team is absent from the snapshot.

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

#### Scenario: FIFA World Ranking (Step 3) tiebreak
- **WHEN** two or more teams remain equal through Step 1 and Step 2
- **THEN** they SHALL be ordered by the frozen FIFA World Ranking snapshot, the better-ranked (lower position) team first, and SHALL NOT be flagged `tiedPendingRanking`

### Requirement: Emit tiedPendingRanking for unresolvable ties
When two or more teams within a group are equal through every measurable tiebreaker criterion (Steps 1 and 2) **and** the FIFA World Ranking snapshot (Step 3) cannot separate them — because they share a ranking position or a tied team is absent from the snapshot — the engine SHALL NOT invent an ordering. Instead it SHALL mark those teams with a `tiedPendingRanking` flag. This is a rare fallback; when the snapshot resolves the tie (the normal case), the flag SHALL NOT be set.

#### Scenario: Ranking resolves the tie
- **WHEN** two teams are equal through Step 1 and Step 2 but have distinct FIFA World Ranking positions
- **THEN** the better-ranked team SHALL rank above and neither SHALL be flagged `tiedPendingRanking`

#### Scenario: Ranking cannot resolve the tie
- **WHEN** two teams are equal through Step 1 and Step 2 and share a ranking position (or one is absent from the snapshot)
- **THEN** both SHALL be returned with `tiedPendingRanking: true` and their relative order SHALL be considered undefined

### Requirement: Cross-group third-place ranking
The engine SHALL rank all 12 third-placed teams (one per group) against each other to identify the best 8 that advance to the Round of 32.

#### Scenario: Ranking third-place teams
- **WHEN** each group's third-place team is known
- **THEN** the engine SHALL rank all 12 by Step 2 criteria (no H2H — these teams are from different groups and never played each other): overall GD → overall GS → fair-play, then by the frozen FIFA World Ranking snapshot (Step 3) as the final tiebreaker

#### Scenario: Best-8 cutoff
- **WHEN** the cross-group third-place ranking is complete
- **THEN** the engine SHALL identify the top 8 as advancing and the bottom 4 as eliminated

#### Scenario: Third-place tie resolved by ranking
- **WHEN** two third-placed teams are equal through GD, GS, and fair-play
- **THEN** they SHALL be ordered by the FIFA World Ranking snapshot, and `tiedPendingRanking` SHALL be set only if the ranking cannot separate them

## ADDED Requirements

### Requirement: Resolve ties using a frozen FIFA World Ranking snapshot
The engine SHALL include a committed, offline snapshot of the FIFA/Coca-Cola Men's World Ranking covering all 48 finalists, and SHALL use it as the final tiebreaker (Step 3) for both within-group ties and cross-group third-place ranking. The snapshot represents the published ranking edition in effect for the tournament, which is frozen for the tournament's duration; it SHALL NOT be fetched over the network at request time.

#### Scenario: Lookup returns a ranking position
- **WHEN** a finalist team name is looked up in the snapshot
- **THEN** the engine SHALL return that team's ranking position, where a numerically lower position is better

#### Scenario: Unknown team falls back safely
- **WHEN** a team name is not present in the snapshot
- **THEN** the lookup SHALL return a high sentinel position so the team sorts last, and the affected tie SHALL fall back to `tiedPendingRanking`

#### Scenario: No network dependency
- **WHEN** standings are computed
- **THEN** tie resolution SHALL read only the committed snapshot and SHALL NOT perform any network request
