## Context

The app fetches all World Cup matches from one ESPN scoreboard endpoint
(`site.api.espn.com/.../fifa.world/scoreboard`) via `lib/espn/client.ts`, caches finals on disk, merges
them with in-memory live data in `lib/pipeline.ts`, and renders three server components: standings
(`/`), bracket (`/bracket`), schedule (`/schedule`). The bracket is computed purely from group
standings in `lib/engine/bracket.ts` as a *projection* — `winner-of`/`loser-of` slots render as
`W##`/`L##` and never resolve.

`parseEvent` (`client.ts:87-112`) returns `null` unless `parseGroup` finds a `Group X` note, so
knockout events are discarded before they reach the cache. Verified against live ESPN data on
2026-06-28:

- Knockout events are returned by the same endpoint (today's `South Africa 0–1 Canada`, M73).
- `competition.altGameNote` = `"FIFA World Cup, Round of 32"` — the only round signal.
- Each competitor has `winner: true/false` — authoritative even when penalties leave the score level.
- `status.type`: `state` ∈ `pre|in|post`, `shortDetail` = `"FT"`, `description` = `"Full Time"`.
- No penalty shootout has occurred yet, so ESPN's shootout field shape is **unobserved**.

## Goals / Non-Goals

**Goals:**
- Ingest knockout matches (scores, status, round, winner, penalty shootout) from the existing endpoint.
- Resolve the bracket from actual results: winners advance; SF losers feed the third-place card.
- Render three bracket-card states (unplayed / live / final) with penalty notation and a faded loser.
- Show knockout live/final scores on the schedule, matching the matchday 1–3 rows.
- Hide clinch badges once the group stage is complete.

**Non-Goals:**
- No new ESPN endpoint, polling change, or data-refresh mechanism (the poller already picks up any
  parsed match within its window).
- No new `MatchStatus` value for penalties (derived at render time).
- No champion/winner highlight beyond fading the loser.
- No change to group-stage standings, tiebreakers, or thirds ranking behaviour.

## Decisions

### D1: Identify knockout matches by round + unordered team-pair, resolved round-by-round
ESPN events expose no stable mapping to our `M73`–`M104` IDs. We identify each `BracketMatchup`'s
result by matching `round` (from `altGameNote`) plus the normalized unordered home/away team pair —
reusing the `normalizeTeamName` + unordered-pair approach already in
`scheduleAssembly.ts:findMatchResult`. A bracket is single-elimination, so a `(round, team-pair)` is
unique. Because later-round teams are unknown until upstream winners resolve, a post-processing pass
walks rounds in order **R32 → R16 → QF → SF → {Final, ThirdPlace}**, resolving each winner into the
downstream slot before that downstream match is identified.

_Alternatives:_ (a) match by ESPN event date+venue — brittle with multiple games per day and TZ skew;
(b) persist ESPN event IDs against M-numbers — requires a hand-maintained mapping table. Team-pair
matching reuses existing code and needs no new data.

### D2: Use ESPN's `winner` boolean as the source of truth for advancement
Penalty shootouts leave regulation/AET scores level, so score comparison cannot determine the winner.
ESPN sets `competitor.winner` correctly in those cases. We take `winner` as primary and fall back to
score comparison only if the boolean is absent.

### D3: Penalties are `status: 'final'` + shootout scores, not a new status
Keeping `MatchStatus` as `scheduled | in-progress | final` avoids touching standings, schedule status
mapping, and every existing status switch. `FT` vs `FT-Pens` and the `1 (4)` notation are derived at
render time from the presence of `homeShootout`/`awayShootout`.

### D4: Knockout matches carry `groupId: null`; standings filter them out
`MatchResult.groupId` becomes `GroupId | null`. `computeGroupStandings` must consume only matches
whose `groupId` equals the group being built (it already iterates per-group membership; we add an
explicit non-null/group-match guard so a stray knockout match can never enter a group table, third
ranking, or clinch computation).

### D5: Enrich `BracketMatchup` as the single source of truth for knockout results
The bracket resolution pass attaches `status`, `homeScore`, `awayScore`, `homeShootout`,
`awayShootout`, and `winner` onto each `BracketMatchup`. Both the bracket UI and the schedule's
knockout rows read these enriched matchups, so scoring/advancement logic lives in one place
(`lib/engine/bracket.ts`) and the two views cannot diverge. `buildKnockoutRows` switches to reading
the enriched matchup rather than re-deriving results.

### D6: Bracket card score layout — stacked, row-aligned
For live/final cards the right column (previously date/time) shows the two scores stacked so each
aligns with its team row (home score beside home team). Penalties render inline on that row as
`1 (4)`. The top-left match-ID slot becomes the status badge: red pulsing `LIVE`, or muted
`FT`/`FT-Pens`. City stays top-right. Unplayed cards are untouched.

### D7: Dynamic caption and badge hiding via derived flags
"Knockout started" is derived from any `BracketMatchup` having a defined `status`; the bracket caption
switches accordingly. "Group stage complete" uses the existing `isGroupStageComplete` helper
(`lib/engine/clinch.ts`), passed to `GroupTable`/standings page to gate `ClinchBadge` rendering.

## Risks / Trade-offs

- **Unverified penalty field shape** → ESPN's shootout representation is unobserved. Parse defensively
  (read `competitor.shootoutScore`; detect penalties via shootout presence and/or `"pen"` in
  `status.type.shortDetail`/`description`), unit-test the parser against a synthetic shootout payload,
  and re-verify at the first real shootout.
- **ESPN round-label wording** (e.g. "Quarterfinal" vs "Quarter-final", "Third Place" wording) may
  vary → centralize the `altGameNote` → `KnockoutRound` mapping in one tolerant function with
  case-insensitive matching; fall back to `null` (treated as a non-knockout, ignored) rather than
  mis-binding.
- **Team-name normalization gaps** for knockout opponents not seen in the group stage → reuse and, if
  needed, extend `ESPN_TEAM_NAMES` in `lib/engine/groups.ts`; an unmatched pair simply leaves the slot
  as its placeholder (graceful, no crash).
- **`groupId` nullability churn** → making `groupId` nullable touches every `MatchResult` consumer.
  Mitigate with the D4 guard and `typecheck`/tests to surface any unguarded access.

## Migration Plan

Additive and behind real data — no schema migration or flag. Disk-cached group finals are unaffected
(new fields are optional). Knockout finals are written to the existing write-once disk cache as they
complete. Rollback = revert the change; cached group data remains valid. Deploy is a normal build.

## Open Questions

- Exact ESPN penalty field name(s) and the status wording for a shootout — to confirm at the first
  real knockout shootout; defensive parsing ships in the meantime.
