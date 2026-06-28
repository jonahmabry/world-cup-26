## Why

The 2026 World Cup knockout stage is live (Round of 32 began 2026-06-28), but knockout results never
reach the UI. `lib/espn/client.ts` `parseEvent` returns `null` for any ESPN event without a `Group X`
note, so every knockout game is silently discarded — confirmed against live ESPN data, where today's
`South Africa 0–1 Canada` (M73) is served but dropped. As a result the bracket only ever shows its
projected group-stage seeding (`W73`/`L101` placeholders forever) and the schedule shows no knockout
scores. We want the bracket and schedule to follow the knockout stage live, just like matchdays 1–3.

## What Changes

- Ingest knockout matches from the existing ESPN scoreboard endpoint: parse the round from
  `competition.altGameNote`, capture each competitor's `winner` boolean, and capture penalty
  shootout scores when present (no new endpoint required).
- Resolve the bracket with **actual** results: winners advance into the next round's slot (replacing
  `W##`), and semi-final losers drop into the third-place card (replacing `L##`).
- Add three display states to bracket match cards: **unplayed** (current layout, unchanged), **live**
  (red `LIVE` badge + running score), and **final** (`FT` / `FT-Pens` + final score, penalties shown
  as `1 (4)`). The losing team's row is visually faded.
- Show knockout live scores on the schedule page, matching the matchday 1–3 rows (score + pulsing
  `LIVE`), with penalty results rendered as `1 (4) – 1 (2)`.
- Make the bracket caption dynamic: keep "Projected bracket…" until R32 begins, then switch to a live
  knockout caption.
- Hide the group-stage clinch badges (`✓ THROUGH` / `✗ OUT`) once the group stage is complete; the
  underlying clinch logic is retained.

## Capabilities

### New Capabilities

_None — this change extends existing capabilities._

### Modified Capabilities

- `espn-ingestion`: ingest knockout-stage matches (round parsing, winner boolean, penalty shootout
  scores) instead of discarding non-group events; group standings must continue to ignore them.
- `knockout-bracket`: cards gain live/final result states (score, `FT`/`FT-Pens`, penalty notation,
  faded loser); winners advance through the tree and semi-final losers feed the third-place card; the
  caption reflects whether the knockout stage has started.
- `match-schedule`: knockout rows display live and final scores (with penalty notation) matching the
  group-stage rows, rather than only kickoff times/placeholders.
- `group-clinch-indicators`: clinch badges stop rendering once the group stage is complete.

## Impact

- **Data model** (`lib/types.ts`): `MatchResult.groupId` becomes nullable; add optional `round`,
  `homeShootout`/`awayShootout`, and `winner` fields; add optional result fields to `BracketMatchup`.
  `MatchStatus` is unchanged (penalties are `final` + shootout scores, labelled at render time).
- **Ingestion** (`lib/espn/client.ts`): round parsing, winner/penalty extraction, stop returning
  `null` for knockout events.
- **Engine** (`lib/engine/standings.ts` null-group guard; `lib/engine/bracket.ts` advancement +
  result enrichment; `lib/engine/scheduleAssembly.ts` knockout row scores).
- **UI** (`app/components/Bracket.tsx`, `app/components/ScheduleMatchRow.tsx`,
  `app/components/GroupTable.tsx` + standings page).
- **No new dependencies, endpoints, or breaking API changes.** Penalty shootout field shape is
  unverified against live ESPN data (no shootout has occurred yet) and parsing is defensive.
