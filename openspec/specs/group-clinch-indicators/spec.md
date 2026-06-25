## Purpose

The group-clinch-indicators capability surfaces mathematical advancement/elimination on the
standings page. For every group-stage team it computes a clinch status — `through` (guaranteed
into the Round of 32), `out` (eliminated), or `none` (undecided) — using a conservative engine
that enumerates remaining within-group outcomes and bounds the cross-group best-thirds race, so it
never reports a false clinch. The status is rendered as a `✓` / `✗` badge alongside (not replacing)
the existing position-based row colouring.

## Requirements

### Requirement: Compute a per-team group-stage clinch status

The system SHALL compute, for every team in the group stage, a clinch status of `through`
(mathematically guaranteed to reach the Round of 32), `out` (mathematically eliminated), or
`none` (not yet decided). Advancement SHALL account for both qualification routes — finishing in
the top 2 of a group and finishing among the best 8 third-placed teams — and a team SHALL be
`through` even when its eventual bracket slot is not yet determined. The computation SHALL be
conservative: it SHALL NOT report `through` or `out` unless that outcome holds in every remaining
combination of results, treating in-progress matches as undecided.

#### Scenario: Clinched group winner or runner-up
- **WHEN** a team is mathematically locked into 1st or 2nd place in its group
- **THEN** its clinch status SHALL be `through`

#### Scenario: Clinched best-third before the group stage ends
- **WHEN** a team is guaranteed to finish among the qualifying third-placed teams in every
  remaining outcome, even though its Round-of-32 slot is not yet known
- **THEN** its clinch status SHALL be `through`

#### Scenario: Mathematically eliminated team
- **WHEN** a team can no longer finish in the top 2 of its group and cannot reach the best-8
  third-placed teams in any remaining outcome
- **THEN** its clinch status SHALL be `out`

#### Scenario: Outcome still open
- **WHEN** a team can still either advance or be eliminated depending on remaining results
- **THEN** its clinch status SHALL be `none`

#### Scenario: In-progress match treated as undecided
- **WHEN** a result that would clinch a team's advancement is currently in progress (not final)
- **THEN** the team SHALL NOT be reported as `through` on the strength of that unfinished match

#### Scenario: Unresolved ranking tie is not a clinch
- **WHEN** a team's advancement or elimination depends on a tie that the FIFA World Ranking could
  not separate (`tiedPendingRanking`)
- **THEN** the team SHALL NOT be reported as `through` or `out`

#### Scenario: Exact resolution once the group stage is complete
- **WHEN** all 72 group fixtures are final
- **THEN** every top-2 team and every qualifying third-placed team SHALL be `through`, and every
  remaining team SHALL be `out`

### Requirement: Display clinch badges on the standings tables

The standings page SHALL show a clinch badge next to a team's name reflecting its clinch status:
a green "through" badge for `through` and a red "out" badge for `out`, with no badge for `none`.
The badges SHALL appear on both the per-group tables and the standalone best-thirds table. Where
horizontal space is constrained (the per-group tables) the badge MAY render as a compact icon-only
form (a colored `✓` / `✗` with a tooltip) so the team name is not truncated; the wider best-thirds
table SHALL render the full `✓ THROUGH` / `✗ OUT` text. The badges SHALL be additive to — and SHALL
NOT replace — the existing position-based row colouring, and the legend SHALL communicate both that
the colours reflect a team's current position while the badges reflect mathematically clinched
status, and the meaning of the `✓` / `✗` icons.

#### Scenario: Through badge on a clinched team
- **WHEN** a team's clinch status is `through`
- **THEN** its row SHALL display a green clinch badge (`✓ THROUGH`, or a `✓` icon where space is
  constrained) next to the team name

#### Scenario: Out badge on an eliminated team
- **WHEN** a team's clinch status is `out`
- **THEN** its row SHALL display a red clinch badge (`✗ OUT`, or a `✗` icon where space is
  constrained) next to the team name

#### Scenario: No badge while undecided
- **WHEN** a team's clinch status is `none`
- **THEN** its row SHALL display no clinch badge, while still showing its current position colour
