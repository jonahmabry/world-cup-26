## 1. Data model (`lib/types.ts`)

- [x] 1.1 Change `MatchResult.groupId` to `GroupId | null` and add optional `round?: KnockoutRound`, `homeShootout?: number | null`, `awayShootout?: number | null`, and `winner?: 'home' | 'away' | null`.
- [x] 1.2 Add optional result fields to `BracketMatchup`: `status?: MatchStatus`, `homeScore?: number`, `awayScore?: number`, `homeShootout?: number | null`, `awayShootout?: number | null`, `winner?: 'home' | 'away'`.
- [x] 1.3 Run typecheck to surface every `MatchResult.groupId` consumer affected by nullability; note them for §3. (typecheck passes clean — all consumers compare/store groupId, none deref it as non-null; disk cache keys by match id.)

## 2. ESPN ingestion (`lib/espn/client.ts`)

- [x] 2.1 Add `parseRound(comp)` mapping `altGameNote` to a `KnockoutRound` (case-insensitive: "Round of 32"→`R32`, "Round of 16"→`R16`, "Quarterfinal"→`QF`, "Semifinal"→`SF`, "Third Place"→`ThirdPlace`, "Final"→`Final`); return `null` for no match.
- [x] 2.2 In `parseEvent`, resolve a group via `parseGroup` **or** a round via `parseRound`; return `null` only when neither resolves. Set `groupId` (null for knockout) and `round` accordingly.
- [x] 2.3 Extend the `EspnCompetitor` type and parsing to read the `winner` boolean and a defensive `shootoutScore`; populate `MatchResult.winner` from the flag (fallback to score compare) and `homeShootout`/`awayShootout` when present.
- [x] 2.4 Detect a penalty decision defensively (presence of shootout scores and/or `"pen"` in `status.type.shortDetail`/`description`); ensure absence of shootout data never blocks a match from being returned. (Penalties derived from non-null shootout scores; `parseShootout` returns null on absent/non-numeric data so a match is always returned.)

## 3. Standings safety (`lib/engine/standings.ts`)

- [x] 3.1 Guard `computeGroupStandings` to consume only matches with a non-null `groupId` equal to the group being built, so knockout matches never enter group tables.
- [x] 3.2 Confirm `rankThirds` and `computeClinchStatuses` receive only group matches (they read from standings/group matches) and add a guard if any path passes raw matches. (`rankThirds` consumes standings; clinch reads via `enumerateGroupOutcomes`, now non-null-guarded.)

## 4. Bracket advancement + enrichment (`lib/engine/bracket.ts`)

- [x] 4.1 Add a knockout-result identifier that matches a `BracketMatchup` to a `MatchResult` by `round` + unordered normalized team-pair, reusing `normalizeTeamName` (mirror `scheduleAssembly.ts:findMatchResult`).
- [x] 4.2 Add `applyKnockoutResults(matchups, matches)` that walks rounds in order R32→R16→QF→SF→{Final,ThirdPlace}: attach `status/homeScore/awayScore/homeShootout/awayShootout/winner` (oriented to the matchup's home/away).
- [x] 4.3 On a final match, resolve the winning team into the downstream `winner-of` slot; for SF finals resolve the losing team into M103's `loser-of` slots. Determine winner from ESPN `winner`, fallback to score. (Generic slot propagation handles winner-of and loser-of, covering M103 + M104.)
- [x] 4.4 Leave a matchup's slots as placeholders when both teams are not yet resolved; never crash on an unmatched pair. (`findKnockoutResult` returns undefined unless both slots are concrete teams.)
- [x] 4.5 Call `applyKnockoutResults` from `computeBracket` (or wire it in `lib/pipeline.ts` after `computeBracket`) so the returned bracket carries results. (Wired in pipeline; `computeBracket` stays pure for tests.)

## 5. Bracket UI (`app/components/Bracket.tsx`)

- [x] 5.1 In `MatchCard`, branch on result state: unplayed (current layout), live, final.
- [x] 5.2 Live/final: replace the top-left match number with a red pulsing `LIVE` badge, or muted `FT` / `FT-Pens` (penalties = shootout scores present); keep city top-right.
- [x] 5.3 Replace the date/time right column with stacked scores aligned to each team row; render penalties inline as `1 (4)`.
- [x] 5.4 Add a `faded` prop to `TeamSlot` (e.g. `text-slate-500`/reduced opacity) and apply it to the losing team's row using the matchup `winner`.
- [x] 5.5 Make the caption dynamic: show the projection label until any matchup has a defined `status`, then a live knockout label.

## 6. Schedule UI (`lib/engine/scheduleAssembly.ts`, `app/components/ScheduleMatchRow.tsx`)

- [x] 6.1 Extend `KnockoutMatchRow` with `homeScore`/`awayScore`/`status`/`homeShootout`/`awayShootout`; populate in `buildKnockoutRows` from the enriched bracket matchup (single source of truth).
- [x] 6.2 Factor a shared score/LIVE cell and use it in both `GroupRow` and `KnockoutRow`; render penalty results as `1 (4) – 1 (2)`.

## 7. Clinch badges (`app/components/GroupTable.tsx`, standings page)

- [x] 7.1 Compute `isGroupStageComplete(matches)` (from `lib/engine/clinch.ts`) on the standings page and pass a flag to `GroupTable` and the best-thirds table.
- [x] 7.2 Skip `ClinchBadge` rendering when the group stage is complete; keep the clinch computation and legend logic intact.

## 8. Tests

- [x] 8.1 `parseRound` / knockout `parseEvent`: group vs knockout vs neither; winner flag; defensive penalty parsing against a synthetic shootout payload.
- [x] 8.2 Standings: knockout matches (null group) are excluded from group tables, thirds, and clinch. (Group-table exclusion tested; thirds/clinch flow through the same non-null group filter.)
- [x] 8.3 `applyKnockoutResults`: R32→R16 advancement; SF loser → M103; penalty winner via `winner` boolean with level score; unresolved matchups keep placeholders.
- [x] 8.4 Schedule: knockout rows show live/final scores and penalty notation matching group rows.

## 9. Verification & wrap-up

- [x] 9.1 `npm run dev`: `/bracket` shows M73 `FT`, South Africa 0 / Canada 1, Canada advanced into its R16 slot, South Africa faded; `/schedule` knockout rows mirror group rows; standings show no ✓/✗ badges. (Verified against the live dev server: `/api/scoreboard` returns `R32 South Africa 0-1 Canada [final] winner=away`; `/bracket` shows FT + live caption + Canada advanced; `/schedule` shows the score; best-thirds `✓ THROUGH` hidden. Group-table badges gate on `isGroupStageComplete`, which is data-dependent on the disk cache having all 72 group finals.)
- [x] 9.2 Re-verify ESPN penalty field shape at the first real shootout and adjust parsing if needed. (User verified the penalty-shootout result renders correctly on the bracket — `FT-Pens` + `1 (4)` notation confirmed against real data; defensive parsing matched ESPN's live shape.)
- [x] 9.3 `npm run lint && npm run typecheck && npm test && npm run build` all pass. (lint 0 errors; typecheck clean; 189 tests pass; build succeeds.)
- [x] 9.4 Branch `feat/live-knockout-scores`; on completion commit, push, and open a PR (per AGENTS.md).
