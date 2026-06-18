## Why

The projected knockout bracket renders each resolved team as a flag + name only. The group
standings already lean on the **FIFA World Ranking** (the frozen Step-3 tiebreaker snapshot in
`lib/engine/fifaRanking.ts`), and surfacing that same number next to each bracket team gives an
at-a-glance read on how the seeding stacks up across a matchup — without bouncing back to the
group tables.

The number must read as a clean column: aligned in a fixed right-hand gutter so the gap from
team name to ranking is identical on every row, rather than trailing the variable-length name
(where a short name like "Iran" and a long one like "Bosnia and Herzegovina" would put the
number in different horizontal positions).

This is the **frozen** pre-tournament snapshot only. A live, projection-driven ranking that
reacts to results is the separate later `live-ranking-bracket` change and is out of scope here.

## What Changes

- **Render the FIFA World Ranking in the bracket.** In `app/components/Bracket.tsx`, the
  resolved-team slot (`team.kind === 'team'`) gains the team's ranking number, displayed as
  `#<rank>` (e.g. `#1`, `#11`) to the right of the name.
- **Fixed-gutter alignment.** The name fills a flexible, truncating column and the ranking sits
  in a fixed-width, right-aligned gutter, so every row's ranking aligns vertically regardless of
  name length.
- **Placeholders carry no ranking.** Unresolved slots (`tbd-pending-ranking`, `winner-of`,
  `unknown`) are untouched — they have no resolved country, so no number is shown.
- **Reuse the existing snapshot.** The number comes from the existing `fifaRank(team)` lookup
  (`lib/engine/fifaRanking.ts`); no new data and no engine changes. An unranked name (sentinel
  `UNRANKED`) degrades gracefully to no number.

## Capabilities

### New Capabilities

- `bracket-fifa-ranking`: every resolved team in the projected knockout bracket renders its
  frozen FIFA World Ranking position, right-aligned in a fixed gutter so rankings form a clean
  column across rows.

### Modified Capabilities

_None._

## Impact

- **Modified:** `app/components/Bracket.tsx` (rendering only).
- **New files:** the OpenSpec change scaffold under `openspec/changes/bracket-fifa-ranking/`.
- **Dependencies:** none.
- **Risk:** low — additive, rendering-only UI; reuses the already-tested `fifaRank` snapshot.
  No engine, data-model, or API behavior changes.
- **Out of scope:** rankings for placeholder bracket slots; group tables / third-place table /
  schedule (bracket only); any live/projection-driven ranking (`live-ranking-bracket`).
