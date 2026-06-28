## MODIFIED Requirements

### Requirement: Display clinch badges on the standings tables

The standings page SHALL show a clinch badge next to a team's name reflecting its clinch status:
a green "through" badge for `through` and a red "out" badge for `out`, with no badge for `none`.
The badges SHALL appear on both the per-group tables and the standalone best-thirds table. Where
horizontal space is constrained (the per-group tables) the badge MAY render as a compact icon-only
form (a colored `✓` / `✗` with a tooltip) so the team name is not truncated; the wider best-thirds
table SHALL render the full `✓ THROUGH` / `✗ OUT` text. The badges SHALL be additive to — and SHALL
NOT replace — the existing position-based row colouring, and the legend SHALL communicate both that
the colours reflect a team's current position while the badges reflect mathematically clinched
status, and the meaning of the `✓` / `✗` icons. Once the group stage is complete (all 72 group
fixtures final), the clinch badges SHALL NOT be rendered, since advancement is then fully determined
and the badges no longer add information; the clinch computation itself SHALL be retained.

#### Scenario: Through badge on a clinched team
- **WHEN** a team's clinch status is `through` and the group stage is not yet complete
- **THEN** its row SHALL display a green clinch badge (`✓ THROUGH`, or a `✓` icon where space is
  constrained) next to the team name

#### Scenario: Out badge on an eliminated team
- **WHEN** a team's clinch status is `out` and the group stage is not yet complete
- **THEN** its row SHALL display a red clinch badge (`✗ OUT`, or a `✗` icon where space is
  constrained) next to the team name

#### Scenario: No badge while undecided
- **WHEN** a team's clinch status is `none` and the group stage is not yet complete
- **THEN** its row SHALL display no clinch badge, while still showing its current position colour

#### Scenario: Badges hidden after the group stage is complete
- **WHEN** all 72 group fixtures are final
- **THEN** no clinch badge SHALL be rendered on either the per-group tables or the best-thirds table,
  while the position-based row colouring SHALL remain
