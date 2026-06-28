## Purpose

The knockout bracket capability computes and renders a deterministic projected knockout bracket derived from the current group stage standings snapshot, covering the full tree from Round of 32 through the Final. The bracket is always computed on-the-fly — never persisted — and uses the official FIFA 2026 third-place allocation table to assign R32 slots. Later rounds are expressed as winner-of references built on top of the R32 layer.

## Requirements

### Requirement: Compute a deterministic snapshot bracket
The system SHALL compute a knockout bracket covering the full knockout tree — Round of 32 (M73–M88),
Round of 16 (M89–M96), Quarter-finals (M97–M100), Semi-finals (M101–M102), the Final (M104), and the
third-place play-off (M103). The Round of 32 SHALL be recomputed on every refresh from the current
standings snapshot (top-2 per group + 8 best thirds via the allocation table). Later rounds are fixed
structural slots referencing prior matches — the winners of their feeding matches, except the
third-place play-off (M103), whose slots reference the losers of the two Semi-finals. When actual
knockout results are available, those references SHALL be resolved into concrete teams (see "Resolve
knockout results into the bracket"); until then they remain winner-of / loser-of references. Before
the knockout stage begins the bracket represents the draw "if the group stage ended at this moment."

#### Scenario: Bracket computed from current standings
- **WHEN** a refresh is triggered
- **THEN** the bracket module SHALL read the current standings (top-2 per group + 8 best thirds) and
  produce the Round-of-32 matchups, plus the R16, QF, SF, Final, and third-place (M103) matchups that
  build on them

#### Scenario: Snapshot label before knockout begins
- **WHEN** the bracket is rendered and no knockout match has started
- **THEN** the UI SHALL display a projection label such as "Projected bracket — if the group stage
  ended now" to communicate the snapshot nature

#### Scenario: Live label once knockout begins
- **WHEN** the bracket is rendered and at least one knockout match is in progress or final
- **THEN** the UI SHALL display a live knockout label rather than the projection label

#### Scenario: Later rounds resolve from knockout results, not group results
- **WHEN** group standings change but no knockout match has been played
- **THEN** the R32 team slots SHALL update while R16-and-later slots remain winner-of references and
  M103 remains loser-of references; once a feeding knockout match is final, its dependent slot SHALL
  resolve to the actual qualifying team

### Requirement: Project later rounds as winner-of references
Each Round-of-16, Quarter-final, Semi-final, and Final slot SHALL be expressed as a reference to the
winner of a specific earlier match (and each third-place play-off slot as a reference to the loser of
a Semi-final), identified by that match's number, until the feeding match is final. The feed structure
(which two matches feed each later match) SHALL come from the official FIFA 2026 knockout schedule.
Once a feeding match is final, the dependent slot SHALL display the resolved team — flag, FIFA
ranking, and name — in place of the winner-of / loser-of reference.

#### Scenario: Winner-of slot rendering before resolution
- **WHEN** a bracket slot belongs to a match in R16 or later and its feeding match is not yet final
- **THEN** that slot SHALL display the winner-of reference for its feeding match (e.g. "W74")

#### Scenario: Resolved slot after the feeding match
- **WHEN** a feeding match has finished and produced a winner
- **THEN** the dependent slot SHALL display that team's flag, FIFA ranking, and name in place of the
  winner-of reference

#### Scenario: Feed structure forms one tree
- **WHEN** the bracket is computed
- **THEN** every non-R32 match SHALL reference exactly two valid earlier matches, and the structure
  SHALL resolve to a single Final (M104)

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

### Requirement: Resolve knockout results into the bracket

The bracket SHALL be enriched with actual knockout results. Each knockout matchup's result SHALL be
identified by matching its round and its unordered pair of resolved team names against the ingested
matches, using the existing team-name normalization. Resolution SHALL proceed in knockout order (R32 →
R16 → QF → SF → Final and third-place) so that a match's winner populates its dependent slot before
that dependent match is itself resolved. The winning team SHALL be taken from the match's recorded
winner (ESPN's per-competitor flag), falling back to the score where that flag is absent. The winner
of a match SHALL advance into the next round's slot; the losers of the two Semi-finals SHALL populate
the third-place play-off (M103). A matchup whose teams are not both resolved SHALL retain its
placeholder slots.

#### Scenario: Winner advances to the next round
- **WHEN** a Round-of-32 match is final
- **THEN** its winning team SHALL appear in the Round-of-16 slot fed by that match

#### Scenario: Semi-final losers feed the third-place play-off
- **WHEN** both Semi-finals are final
- **THEN** the two losing teams SHALL populate the third-place play-off (M103)

#### Scenario: Penalty winner advances despite a level score
- **WHEN** a knockout match is level after regulation/extra time and decided on penalties
- **THEN** the team marked as the winner SHALL advance, even though the regulation score is equal

#### Scenario: Unresolved matchup keeps placeholders
- **WHEN** a matchup's two teams are not both known (a feeding match has not finished)
- **THEN** that matchup SHALL keep its winner-of / loser-of placeholders and SHALL show no result

### Requirement: Render live and final results on bracket cards

A bracket match card SHALL render one of three states. An unplayed match SHALL keep the existing card
layout (match number top-left, host city top-right, teams, and date/time on the right). An in-progress
match SHALL replace the match number with a live indicator and replace the date/time with the current
score, each team's score aligned to its team row. A final match SHALL replace the match number with an
`FT` label — or `FT-Pens` when decided by penalties — and replace the date/time with the final score;
a penalty result SHALL be shown as regulation goals with shootout goals in parentheses (e.g. `1 (4)`).
The losing team's row SHALL be visually faded to indicate the loss.

#### Scenario: Unplayed card unchanged
- **WHEN** a knockout match has not started
- **THEN** its card SHALL show the existing layout with match number, host city, teams, and date/time

#### Scenario: Live card shows the running score
- **WHEN** a knockout match is in progress
- **THEN** its card SHALL show a live indicator in place of the match number and the current score in
  place of the date/time, aligned to each team's row

#### Scenario: Final card shows FT and the score
- **WHEN** a knockout match is final and not decided by penalties
- **THEN** its card SHALL show an `FT` label in place of the match number and the final score in place
  of the date/time, with the losing team's row faded

#### Scenario: Final card shows penalty result
- **WHEN** a knockout match is final and decided by a penalty shootout
- **THEN** its card SHALL show an `FT-Pens` label and each team's score as regulation goals with
  shootout goals in parentheses (e.g. `1 (4)`)
