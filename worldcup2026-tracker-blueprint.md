# World Cup 2026 Tracker — Project Blueprint

A localhost web app that shows **live group-stage standings**, a **projected knockout bracket**, and a **player-stats section** for the 2026 FIFA World Cup. TypeScript / Next.js. Standings and bracket are computed in-house from match results; player stats are enriched from a free API.

---

## Tournament facts this is built against

- **48 teams**, **12 groups of 4** (A–L), each team plays 3 matches.
- Advancement: **top 2 from each group + the 8 best third-placed teams** → **Round of 32** → R16 → QF → SF → Final.
- Group stage is **live now** (kicked off June 11, 2026); final is July 19, 2026.
- Group tiebreakers, in order: points → goal difference → goals scored → head-to-head → fair-play (card) points → **drawing of lots**.
  - ⚠️ The exact ordering (especially where head-to-head sits) varies across secondary sources. **Verify against FIFA's official 2026 regulations at build time** — do not trust a blog.
  - ⚠️ "Drawing of lots" is non-computable. When two teams are dead-even through every measurable criterion, the snapshot flags them **tied-pending-lots** rather than inventing an order.

---

## Architecture

- **Single Next.js app (TypeScript)** — frontend pages + server-side API routes in one project (`package.json`, etc.).
- The **API-Football key lives server-side only**, never shipped to the browser. ESPN calls also go through the server to avoid browser CORS issues.
- **Storage:** in-memory cache for hot/live data **+ a lightweight on-disk JSON cache** for completed matches. No database. Completed-match data never changes, so it's written once and read forever → server restarts cost **zero** API budget.

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
- ⚠️ **Verify at build time** that the free tier actually serves the *live current* 2026 season; some providers gate the current season behind paid plans.

---

## Standings / qualification engine (the heart of the app)

We **compute standings ourselves** rather than trust any provider's standings endpoint, because (a) we already need full tiebreaker logic for the bracket, (b) ESPN's standings are unreliable, and (c) it guarantees the group tables and the bracket are consistent (same engine).

- **Group membership is hardcoded** from the completed draw (it won't change); we only fetch results.
- Engine computes: per-group tables → top-2 per group → cross-group ranking of all 12 third-placed teams → best 8 thirds.
- Emits `tied-pending-lots` where lots would be required.

---

## Projected knockout bracket

- **Deterministic snapshot**: "if the group stage ended this instant, here's the bracket," recomputed on every refresh.
- Uses the **real FIFA Round-of-32 allocation table** to slot the 8 best thirds into correct matchups.
  - ⚠️ This is the **fiddliest module**. With 8 of 12 groups' thirds advancing, the combinatorics are far larger than past tournaments. **Source FIFA's official 2026 allocation table and verify the exact mechanism before building this** — don't wing it.
- ⚠️ **Snapshot volatility heads-up:** early in the group stage, teams have unequal games played. The snapshot uses current standings as-is (by design), so the bracket will swing a lot in the first week. That's expected behavior, not a bug.

---

## Stats section (Phase 2)

**Included:** goals, assists, rating, shots, saves, yellow cards, red cards, second-yellow (yellow-red), games played, games started, minutes played.
- `rating` is API-Football's computed number; it can be null until shortly after a match finalizes.

**Dropped for v1:**
- **xG** — not in ESPN tables or API-Football's free player stats; reliable xG needs a paid/fragile source. Revisit only if you later pay for data.
- **Player of the match** — no clean API field. Could later be derived as "highest match rating," but cut for v1.

---

## Refresh model

- **Manual button** — re-runs the pipeline: reads cache, hits ESPN for anything live, enriches any newly-finished matches.
- **Background poller** — quietly auto-detects when a game finishes and enriches it once, so stats are ready without babysitting.
  - *Proposed default:* poll ESPN ~every 60s **only during/near scheduled match windows**, idle otherwise. (Veto-able.)

---

## UI

- Three sections only for v1: **Group Standings**, **Projected Bracket**, **Stats**.
- Group tables **color-coded live**: 🟩 green = top-2 auto-qualifiers, 🟧 amber = currently inside the 8-best-thirds cutoff, 🟥 red = eliminated.
- *Proposed default look:* clean dark dashboard. (Veto-able.)

---

## Build sequencing

**Phase 1 (build first — useful during the live group stage):**
scaffold → ESPN ingestion → standings/tiebreaker engine → color-coded group tables → projected bracket (incl. the FIFA seeding table).

**Phase 2 (add after):**
API-Football integration → full stats section.

---

## Open verification items (resolve at build time — not assumptions)

1. API-Football free tier actually serves the **live 2026 season** (not paywalled).
2. **Exact FIFA 2026 group tiebreaker ordering** from official regulations.
3. **Official FIFA 2026 Round-of-32 third-place allocation table** and its precise mechanism.
