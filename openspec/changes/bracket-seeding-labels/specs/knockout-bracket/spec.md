## ADDED Requirements

### Requirement: Display a group-seed badge on resolved Round-of-32 slots

Each Round-of-32 slot that is filled by a resolved team SHALL additionally display a
compact group-seed badge derived from how that team entered the knockout stage: the
group-finish position (1 for a group winner, 2 for a runner-up, 3 for a third-placed
qualifier) immediately followed by the team's group letter (e.g. `1F`, `2A`, `3C`). The
badge SHALL be rendered at a fixed size that does not displace or clip the team flag, name,
or the card's venue/date column.

#### Scenario: Resolved R32 winner slot shows its seed

- **WHEN** an R32 slot is filled by the resolved winner of group F
- **THEN** the slot SHALL display the team (flag + name) together with the badge `1F`

#### Scenario: Resolved R32 runner-up and third-place slots show their seed

- **WHEN** an R32 slot is filled by the resolved runner-up of group A, and another by the
  resolved third-placed qualifier from group C
- **THEN** the first slot SHALL show the badge `2A` and the second SHALL show `3C`

#### Scenario: Later-round and unresolved slots show no seed badge

- **WHEN** a slot belongs to R16 or later (a winner-of reference), or is an unresolved /
  TBD R32 slot
- **THEN** no group-seed badge SHALL be displayed for that slot
