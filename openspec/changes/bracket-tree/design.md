## Context

The Phase 1 bracket engine (`lib/engine/bracket.ts`) already uses real FIFA match numbers for the R32
(M73–M88) and slots teams from `top-2 per group + 8 best thirds` via the allocation table. The UI
(`app/components/Bracket.tsx`) renders those 16 matchups in a flat responsive grid. There is no
representation of later rounds, how matches feed forward, or where/when matches are played.

The 2026 knockout structure and its venues/dates/times are fixed by *slot*, not by which teams qualify —
so they can be hardcoded and verified once, exactly like the Annex C allocation table. Match numbering:
R32 = M73–M88, R16 = M89–M96, QF = M97–M100, SF = M101–M102, third-place play-off = M103 (excluded),
Final = M104.

## Goals / Non-Goals

**Goals:**
- Compute the full knockout tree R32 → Final, with later-round slots referencing the winner of a prior
  match.
- Attach host city, date, and kickoff time to every match, sourced from the official FIFA schedule.
- Render a connected bracket tree (round columns) that shows the path to the Final.

**Non-Goals:**
- No changes to standings, tiebreakers, third-place ranking, or the allocation table.
- No projecting of *who* wins a knockout match — later rounds always show winner-of placeholders.
- No third-place play-off (M103) in the tree.

## Decisions

### 1. A hardcoded knockout schedule keyed by match number
Add `lib/engine/knockoutSchedule.ts`: for each match M73–M104 (excluding M103), record
`{ round, feedsFrom: [matchIdA, matchIdB] | null, venueCity, date, kickoffTime }`. R32 entries have
`feedsFrom: null` (they come from groups). The structure is the single source of truth for the tree shape
and the card metadata. *Alternative considered:* deriving feeds from ESPN's knockout fixtures — rejected,
because teams are TBD and the official slot mapping is fixed; hardcoding from the official schedule is more
reliable and matches the allocation-table precedent.

### 2. `winner-of` BracketTeam variant
Add `{ kind: 'winner-of'; matchId: string }` to `BracketTeam` in `lib/types.ts`. R16-and-later home/away
slots are built directly from `feedsFrom` as winner-of references and render as `W74` etc. *Alternative
considered:* resolving winners from results — out of scope (we project the draw structure, not outcomes).

### 3. Engine emits all rounds; R32 keeps existing logic
`computeBracket` keeps its current R32 slotting (teams + allocation) and additionally emits R16/QF/SF/Final
matchups built from the schedule's `feedsFrom`. Each emitted matchup is enriched with `venueCity`, `date`,
and `kickoffTime` from the schedule. *Alternative considered:* a parallel schedule-lookup consumed only by
the UI — rejected; carrying venue/date/time on the matchup keeps the UI a pure renderer and makes the data
testable in the engine.

### 4. Tree layout by round columns
Rebuild `Bracket.tsx` as columns (R32 | R16 | QF | SF | Final) with vertical spacing so each later card
sits between the two it feeds from, with simple connectors. Each card shows the matchId, both slots
(team / `Wxx` / TBD — reusing the existing tied-pending-ranking handling), host city, and date over time
(`JUN 30` / `3:30PM`). *Alternative considered:* a third-party bracket library — rejected to avoid a new
dependency for a fixed 5-column layout; CSS grid/flex is sufficient.

## Risks / Trade-offs

- **Schedule data entered wrong (feeds/venues/times)** → source only from the official FIFA 2026 fixture
  list; add a self-consistency check (every non-R32 match's `feedsFrom` references two valid earlier
  matches; the tree forms a single root at M104) and a unit test on the structure.
- **Time zone / format ambiguity** → store a displayable CDT kickoff string (all times converted from
  venue-local at data-entry time); the UI formats `MON DD` / `H:MMAM/PM` and does no timezone math.
- **Tree CSS complexity across rounds** → keep it a static 5-column layout sized to 16/8/4/2/1 cards;
  acceptable for desktop-first per the blueprint.

## Open Questions

- None blocking. Connector styling is cosmetic and can be refined during implementation.
