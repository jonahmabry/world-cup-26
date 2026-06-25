## Purpose

The knockout bracket capability computes and renders a deterministic projected knockout bracket derived from the current group stage standings snapshot, covering the full tree from Round of 32 through the Final. The bracket is always computed on-the-fly — never persisted — and uses the official FIFA 2026 third-place allocation table to assign R32 slots. Later rounds are expressed as winner-of references built on top of the R32 layer.

## Requirements

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

### Requirement: Project later rounds as winner-of references
Each Round-of-16, Quarter-final, Semi-final, and Final slot SHALL be expressed as a reference to the winner of a specific earlier match, identified by that match's number, rather than a team name. The feed structure (which two matches feed each later match) SHALL come from the official FIFA 2026 knockout schedule.

#### Scenario: Winner-of slot rendering
- **WHEN** a bracket slot belongs to a match in R16 or later
- **THEN** that slot SHALL display the winner-of reference for its feeding match (e.g. "W74") until that match resolves

#### Scenario: Feed structure forms one tree
- **WHEN** the bracket is computed
- **THEN** every non-R32 match SHALL reference exactly two valid earlier matches, and the structure SHALL resolve to a single Final (M104)

### Requirement: Display host city, date, and kickoff time per match
Every match in the bracket SHALL carry and display its host city, date, and kickoff time, sourced from the official FIFA 2026 schedule and keyed by match number. Each knockout schedule entry SHALL additionally carry an ISO local date (e.g. `2026-06-30`) alongside the human-readable display date (e.g. `JUN 30`), so that knockout matches can be sorted and grouped by calendar day by downstream consumers (such as the match-schedule view). The bracket UI SHALL continue to render the existing display date and kickoff time unchanged.

#### Scenario: Card shows venue and schedule
- **WHEN** a bracket match card is rendered
- **THEN** it SHALL show the host city (e.g. "Los Angeles", "New York/New Jersey") and the date and kickoff time (e.g. "JUN 30" above "3:30PM")

#### Scenario: Schedule entry carries a sortable ISO date
- **WHEN** a knockout schedule entry is read
- **THEN** it SHALL expose an ISO local date that corresponds to its display date, usable for chronological sorting and day-grouping

### Requirement: Render the bracket as a connected tree
The bracket UI SHALL render the matches as a connected tree organized by round (R32 → R16 → QF → SF → Final), so the path from the Round of 32 to the Final is visually apparent, rather than as an unordered grid of cards.

#### Scenario: Round-organized layout
- **WHEN** the bracket page is rendered
- **THEN** matches SHALL be grouped into per-round columns in knockout order with each later-round match positioned relative to the two matches that feed it

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
A bracket slot SHALL show the resolved team whenever the standings engine determines that team — including ties broken by the FIFA World Ranking snapshot (Step 3). The bracket SHALL fall back to a "TBD — FIFA Ranking" marker **only** for the rare case where a slot's team remains `tiedPendingRanking` because the ranking could not separate the tie (equal ranking position, or a team absent from the snapshot). Because ties are now resolved by ranking, the Round of 32 SHALL populate with concrete teams from the first day of the group stage, including groups whose teams are level or have not yet played (ordered by FIFA ranking as part of the provisional snapshot).

#### Scenario: Tie resolved by ranking populates the slot
- **WHEN** a bracket slot's team was level with another through Steps 1–2 but is separated by the FIFA World Ranking
- **THEN** that slot SHALL display the resolved team name, not "TBD"

#### Scenario: Unresolved tie falls back to TBD
- **WHEN** a bracket slot's team remains `tiedPendingRanking` because the ranking could not separate the tie
- **THEN** that slot SHALL be marked "TBD — FIFA Ranking" rather than showing a definitive team name

#### Scenario: Round of 32 populated from day one
- **WHEN** the bracket is computed early in the group stage (teams level or not yet played)
- **THEN** the R32 team slots SHALL still show concrete teams, ordered using the FIFA World Ranking snapshot where measurable criteria are tied
