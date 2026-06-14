## Purpose

The knockout bracket capability computes and renders a deterministic projected Round-of-32 bracket derived from the current group stage standings snapshot. The bracket is always computed on-the-fly — never persisted — and uses the official FIFA 2026 third-place allocation table to assign slots.

## Requirements

### Requirement: Compute a deterministic snapshot bracket
The system SHALL compute a projected Round-of-32 bracket representing the knockout draw "if the group stage ended at this moment." The bracket SHALL be recomputed on every refresh using the current standings snapshot.

#### Scenario: Bracket computed from current standings
- **WHEN** a refresh is triggered
- **THEN** the bracket module SHALL read the current standings (top-2 per group + 8 best thirds) and produce a full R32 matchup tree

#### Scenario: Snapshot label
- **WHEN** the bracket is rendered
- **THEN** the UI SHALL display a label such as "Projected bracket — if the group stage ended now" to communicate the snapshot nature

### Requirement: Slot third-place teams using the official FIFA 2026 allocation table
The 8 best third-place teams SHALL be assigned to R32 slots using the official FIFA 2026 third-place allocation table. The allocation table SHALL be hardcoded from the official source (not computed dynamically) and SHALL cover all 495 combinations of 8 groups from 12 producing a third-place qualifier.

#### Scenario: Known group combination
- **WHEN** the set of 8 qualifying third-place groups is known (e.g., groups A, B, C, D, E, F, G, H)
- **THEN** the system SHALL look up that combination in the hardcoded allocation table and assign each third-place team to the correct R32 slot

#### Scenario: Allocation table completeness
- **WHEN** any valid combination of 8 groups from 12 is presented
- **THEN** the allocation table SHALL contain an entry for that combination; a missing entry SHALL be treated as a build-time error

### Requirement: Bracket is read-only and never persisted
The knockout bracket SHALL be derived on-the-fly from standings on every refresh. It SHALL NOT be stored in the cache or written to disk.

#### Scenario: Bracket after refresh
- **WHEN** the pipeline re-runs
- **THEN** the bracket is recomputed from scratch from the latest standings; no stale bracket state is carried forward

### Requirement: Propagate tiedPendingRanking into bracket slots
When a bracket slot is occupied by a team that is only tentatively ranked due to a `tiedPendingRanking` tie (FIFA World Ranking required), the bracket SHALL indicate the slot is uncertain.

#### Scenario: Tied slot
- **WHEN** a bracket slot's team is determined by a `tiedPendingRanking` rank
- **THEN** that slot SHALL be marked as "TBD — FIFA Ranking" rather than showing a definitive team name
