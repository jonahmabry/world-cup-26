# World Cup 2026 Tracker — Project Blueprint

A localhost web app that shows **live group-stage standings**, a **projected knockout bracket**, a **full match schedule**, and a **player-stats section** for the 2026 FIFA World Cup. TypeScript / Next.js. Standings and bracket are computed in-house from match results; player stats are enriched from a free API.

---

## Tournament facts this is built against

- **48 teams**, **12 groups of 4** (A–L), each team plays 3 matches.
- Advancement: **top 2 from each group + the 8 best third-placed teams** → **Round of 32** → R16 → QF → SF → Final.
- Group stage is **live now** (kicked off June 11, 2026); final is July 19, 2026.
- Group tiebreakers, in order: points → goal difference → goals scored → head-to-head → fair-play (card) points → **FIFA World Ranking** → drawing of lots.
  - The ordering is implemented against FIFA's official 2026 regulations; the FIFA World Ranking step is a **frozen snapshot** (see the `fix-tiebreaker-and-bracket` change in the roadmap).
  - ⚠️ "Drawing of lots" is non-computable. When two teams are dead-even through every measurable criterion, the snapshot flags them **tied-pending-lots** rather than inventing an order.

---

## Architecture

- **Single Next.js app (TypeScript)** — frontend pages + server-side API routes in one project (`package.json`, etc.).
- The **API-Football key lives server-side only**, never shipped to the browser. ESPN calls also go through the server to avoid browser CORS issues.
- **Storage:** in-memory cache for hot/live data **+ a lightweight on-disk JSON cache** for completed matches. No database. Completed-match data never changes, so it's written once and read forever → server restarts cost **zero** API budget.
  - ⚠️ The "no database" rule is **superseded** from the `bracket-challenge` change onward, when the app gains multi-user auth + Postgres.

### Data flow
```
ESPN (unlimited) ──> match results + live status
                        │
                        ▼
              in-house standings engine  ──> group tables + projected bracket
                        │
        (on game finish) ▼
API-Football (sparingly) ──> enrich that match's player stats + refresh leaderboards
                        │
                        ▼
                  JSON disk cache (finished) + memory cache (live)
```

---

## Data sources (split by job)

**ESPN hidden API** — does all the frequent work. No key, no signup, no real rate limit.
- World Cup slug: `fifa.world` (e.g. `site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`).
- Covers: live scores, fixtures, match status, "this game just finished" detection.
- ⚠️ Its scoreboard endpoint does **not** reliably return standings tables — which is fine, because we compute standings ourselves anyway.

**API-Football (API-Sports) free tier** — called sparingly. ~100 requests/day, free key.
- Covers the player-stats gaps: `top_scorers`, `top_assists`, `top_yellowcards`, `top_redcards`, plus per-player stats (`games.minutes`, `games.lineups`, `shots`, `goals.saves`, `cards.yellowred`, `rating`).
- Used **only** to enrich a match once it's final + refresh leaderboards. Completed data is cached permanently. Estimated well under 10 calls on a 6-game day vs. a 72-match group stage — comfortably inside the free plan.
- ⚠️ **Verify at build time** (when `stats-section` lands) that the free tier actually serves the *live current* 2026 season; some providers gate the current season behind paid plans.

---

## Standings / qualification engine (the heart of the app)

We **compute standings ourselves** rather than trust any provider's standings endpoint, because (a) we already need full tiebreaker logic for the bracket, (b) ESPN's standings are unreliable, and (c) it guarantees the group tables and the bracket are consistent (same engine).

- **Group membership is hardcoded** from the completed draw (it won't change); we only fetch results.
- Engine computes: per-group tables → top-2 per group → cross-group ranking of all 12 third-placed teams → best 8 thirds.
- Emits `tied-pending-lots` where lots would be required.

---

## Projected knockout bracket

- **Deterministic snapshot**: "if the group stage ended this instant, here's the bracket," recomputed on every refresh.
- Uses the **real FIFA Round-of-32 allocation table** (`lib/engine/allocationTable.ts`) to slot the 8 best thirds into correct matchups.
- ⚠️ **Snapshot volatility heads-up:** early in the group stage, teams have unequal games played. The snapshot uses current standings as-is (by design), so the bracket will swing a lot in the first week. That's expected behavior, not a bug.
- The third-place playoff (M103) is modeled as a detached **third-place card** in the bracket's lower-right (shipped in `bracket-third-place-card`). It's fed by the semi-final **losers** via a `loser-of` slot reference on a dedicated `ThirdPlace` round — the counterpart to the `winner-of` / `feedsFrom` model the rest of the tree uses.

---

## Stats section

**Included:** goals, assists, rating, shots, saves, yellow cards, red cards, second-yellow (yellow-red), games played, games started, minutes played.
- `rating` is API-Football's computed number; it can be null until shortly after a match finalizes.

**Dropped for v1:**
- **xG** — not in ESPN tables or API-Football's free player stats; reliable xG needs a paid/fragile source. Revisit only if you later pay for data.
- **Player of the match** — no clean API field. Could later be derived as "highest match rating," but cut for v1.

---

## Refresh model

- **Manual button** — re-runs the pipeline: reads cache, hits ESPN for anything live, enriches any newly-finished matches.
- **Background poller** — quietly auto-detects when a game finishes and enriches it once, so stats are ready without babysitting. Polls ESPN ~every 60s **only during/near scheduled match windows**, idle otherwise.

---

## UI

- **Sections:** Group Standings, Projected Bracket, and Schedule today; Stats arrives with the `stats-section` change.
- Group tables **color-coded live**: 🟩 green = top-2 auto-qualifiers, 🟧 amber = currently inside the 8-best-thirds cutoff, 🟥 red = eliminated.
- Look: clean dark dashboard.

---

## Roadmap

The app is evolving from a single-user localhost tracker into a **multi-user bracket-challenge app**. History and forward plan, as OpenSpec changes:

### Shipped
- **Phase 1** — scaffold → ESPN ingestion → standings/tiebreaker engine → color-coded group tables → projected bracket (incl. the FIFA seeding table).
- **Phase 2** — `data-accuracy` (full-tournament backfill + provisional/live standings, with its own engine tests) → `hardening` (regression coverage for the engine modules + GitHub Actions CI).
- **Phase 3** — `bracket-tree` (full knockout tree R32 → Final with a connected bracket diagram).
- `fix-tiebreaker-and-bracket` — FIFA World Ranking as the **Step-3 tiebreaker (frozen snapshot)** so tied runners-up and the 8 best third-placed teams stop rendering as "TBD" and the projected bracket repopulates; hardened the group-table layout so a `LIVE`/`TIE` badge can't clip the **Pts** column.
- `node-24-upgrade` — moved CI and local engines to Node 24 LTS; added `engines.node >=24.0.0`, `.nvmrc`, and bumped `@types/node` to `^24` (Node 20 GitHub Actions runtime is deprecated).
- `release-automation` — adopted Changesets for automated version bumps, changelog generation, git tags, and GitHub Releases; reconciled `package.json`/`CHANGELOG.md` drift (forward-only to `0.1.3`).
- `country-flags` — SVG national flags next to every team name in the group tables, projected bracket (resolved R32 slots), and third-place ranking. Flags are bundled assets keyed by country code (ISO alpha-2, with `gb-eng`/`gb-sct`/`gb-wls` for the home nations — emoji flags don't render on Windows); group-table columns were retuned so names no longer clip beside the flag and `LIVE` badge.
- `bracket-fifa-ranking` — render each **resolved** team's **frozen FIFA World Ranking** in the bracket, in a fixed-width gutter between the flag and the team name so the names line up across rows. Placeholder slots (TBD / winner-of) and unranked names render no number. Reuses the existing `fifaRank(team)` snapshot lookup (`lib/engine/fifaRanking.ts`); only `app/components/Bracket.tsx` rendering changed. (A truly live, projection-driven ranking remains the separate `live-ranking-bracket` change below.)
- `bracket-third-place-card` — a detached **third-place card** in the bracket's lower-right (aligned with the Final column and the M100 row), rendering M103. **Introduced the third-place data model** reused by `match-schedule`: **M103** (third-place playoff, Miami, JUL 18, 4:00PM CDT) added to `KNOCKOUT_SCHEDULE`, a **`ThirdPlace`** variant on `KnockoutRound`, and a **`loser-of`** slot relationship (M103 = losers of M101/M102). Rendering lives in `app/components/Bracket.tsx`.

### Planned (in run order)
1. **`match-schedule`** — a new `/schedule` section (added to `app/components/Nav.tsx`) reusing existing data: group fixtures from ESPN ingestion (`MatchResult.kickoff`) and knockout dates/venues from `lib/engine/knockoutSchedule.ts` (including the M103 + `ThirdPlace` round added above). No new API source. Shape:
   - Shows **one phase at a time** — a single matchday or knockout round — never the whole tournament at once.
   - Phase sequence: **Matchday 1, Matchday 2, Matchday 3, Round of 32, Round of 16, Quarter-finals, Semi-finals, Third-place, Final.**
   - **Defaults to the current phase** on load.
   - Phase is addressed by a **`?date=` query param** keyed to the phase's start date (e.g. Matchday 1 → `/schedule?date=2026-06-11`); navigating updates the URL.
   - The displayed phase is split into **sections by calendar day**; each day lists its games (final score inline, or kickoff time if upcoming).
   - A row of **phase buttons** shows a **sliding window of the viewed phase ± 1** (previous, current, next), recomputed around whatever phase is displayed so the user can step all the way forward to the Final. Clamped at the ends (Matchday 1 shows only [MD1, MD2]).
2. **`stats-section`** — Phase 4: API-Football integration and the full player-stats section.
3. **`bracket-challenge`** — March-Madness-style knockout bracket challenge: **Supabase** auth + Postgres, per-user picks locked at the first Round-of-32 kickoff, round-weighted scoring (more points for deeper rounds), and a global leaderboard. **Retires the "no database" rule.**
4. **`live-ranking-bracket`** — bracket and standings react to FIFA's **live** World-Ranking projection as scores change (the live counterpart to the frozen snapshot introduced in `fix-tiebreaker-and-bracket`).

### Open items to verify at build time
- API-Football free tier actually serves the **live 2026 season** (not paywalled) — resolve when `stats-section` lands.

_Resolved during build: the exact FIFA 2026 group tiebreaker ordering (implemented via the FIFA World Ranking Step-3 tiebreaker) and the official Round-of-32 third-place allocation table (`lib/engine/allocationTable.ts`)._
