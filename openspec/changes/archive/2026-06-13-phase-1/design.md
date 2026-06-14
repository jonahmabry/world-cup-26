## Context

The 2026 World Cup group stage is live. This is a greenfield Next.js/TypeScript app with no existing code. The primary constraints are: (1) keep API costs near zero on the free tier, (2) never expose API keys to the browser, (3) the standings engine must be authoritative — we cannot trust any provider's standings endpoint for bracket correctness.

## Goals / Non-Goals

**Goals:**
- Live group standings with full FIFA 2026 tiebreaker logic
- Projected Round-of-32 bracket, recomputed on every refresh
- Color-coded qualification status per team
- Zero-cost server restarts (completed match data never re-fetched)
- Manual refresh + background poller active only during match windows

**Non-Goals:**
- Player stats / API-Football integration (Phase 2)
- xG, Player of the Match, or any stat requiring a paid data source
- Authentication, multi-user support, or any deployment beyond localhost
- Mobile-optimized layout (dark dashboard, desktop-first is fine for v1)

## Decisions

### 1. Single Next.js app (App Router + API route handlers) over a separate backend
All ESPN calls go through `/api/*` route handlers — keeps CORS off the table, keeps future API keys server-side, and avoids running two processes locally. No need for a separate Express server.

### 2. In-house standings engine, not ESPN's standings endpoint
ESPN's standings tables are unreliable and, critically, they can't produce the cross-group third-place ranking we need for the bracket. Computing ourselves from raw match results also guarantees the group tables and the bracket are always consistent (same data, same engine). Group membership is hardcoded from the completed draw — it will not change mid-tournament.

### 3. Two-tier cache: on-disk JSON (finished) + in-memory (live)
Completed match results are immutable. Writing them to disk once means server restarts cost zero API calls. In-memory is used only for live/in-progress data that must stay fresh. No database; no ORM; simple `fs.readFileSync` / `fs.writeFileSync` on a `data/cache/` directory.

### 4. ESPN hidden API for all frequent polling
`site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard` requires no key and has no enforced rate limit. It covers everything Phase 1 needs: live scores, fixture list, and "match just finished" detection. API-Football is reserved for Phase 2 (player stats enrichment).

### 5. Background poller: interval-based, match-window-aware
The poller runs a `setInterval` at ~60s but skips immediately if no matches are scheduled within a ±90-minute window of now. This avoids burning ESPN calls overnight. The poller lives in a Next.js API route that is initialized once on first request (lazy start via module-level singleton). On match completion the poller triggers the cache write; it does not trigger API-Football enrichment in Phase 1.

### 6. Standings tiebreaker: `tiedPendingRanking` sentinel for unresolvable ties
When two teams are equal through every measurable criterion, the engine emits a `tiedPendingRanking` flag rather than picking an order. The UI surfaces this clearly. The verified FIFA 2026 sequence is: pts → Step 1 H2H (pts → GD → GS in H2H matches) → Step 2 overall (GD → GS → fair-play conduct score) → Step 3 FIFA World Ranking. The original blueprint listed "drawing of lots" as the final tiebreaker; per FIFA 2026 regulations this was replaced by FIFA World Ranking.

### 7. Third-place allocation: hardcode the official FIFA table
The R32 slot assignments for the 8 best thirds depend on which groups they came from. There are C(12,8) = 495 possible group combinations, each mapping to a fixed slot assignment per the official FIFA table. This is implemented as a lookup table hardcoded from the official source. It is not computed dynamically. This is the fiddliest module — the allocation table must be sourced from FIFA's official 2026 documentation, not secondary sources.

### 8. TypeScript strict mode throughout
All engine logic (standings, tiebreaker, bracket) is pure TypeScript with explicit types. No `any`. Makes it easier to audit tiebreaker edge cases and ensures the `tied-pending-lots` state is typed, not a stringly-typed magic value.

## Risks / Trade-offs

- **ESPN hidden API changes without notice** → No SLA, no versioning. If the endpoint breaks mid-tournament, the app goes dark. Mitigation: keep the ESPN client isolated behind a thin adapter so the URL and response shape can be updated in one place.
- **Tiebreaker ordering not yet verified** → The exact FIFA 2026 tiebreaker sequence (especially H2H position) must be confirmed against official regulations before implementing the engine. Using the wrong order produces wrong bracket slots. Mitigation: treat this as a blocking pre-build step; mark the ordering in code with a reference to the source document.
- **Third-place allocation table complexity** → With 12 groups and 8 thirds advancing, the combinatorics are much larger than prior tournaments. Hardcoding from the wrong source produces silently wrong bracket slots. Mitigation: source only from FIFA's official 2026 regulations; add a unit test for at least one known example combination.
- **Snapshot volatility early in group stage** → Teams have unequal games played in the first week. The bracket snapshot will swing significantly. This is expected behavior by design, but the UI should label it clearly ("projected if group stage ended now") to avoid confusion.
- **On-disk cache write races** → If two poller ticks both detect the same match finishing simultaneously, they could both attempt to write the cache file. Mitigation: simple write-once guard (check if match ID already exists in cache before writing); no locking needed for a single-process localhost app.

## Open Questions

1. **FIFA 2026 tiebreaker sequence** — exact ordering must be confirmed from official regulations before the standings engine is coded. (Blueprint flags this as a hard requirement.)
2. **FIFA 2026 R32 third-place allocation table** — the full lookup table (all 495 group combinations → slot assignments) must be sourced from official FIFA 2026 documentation. (Blueprint flags this as the fiddliest module.)
3. **API-Football free tier** — does it actually serve the live 2026 season on the free plan? Deferred to Phase 2 but must be verified before that phase begins.
