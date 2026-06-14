## 1. Project Scaffold

- [x] 1.1 Initialize Next.js TypeScript project (`npx create-next-app`) with strict mode tsconfig
- [x] 1.2 Create directory structure: `lib/` (engine + cache + clients), `data/cache/` (on-disk JSON), `app/` (pages + API routes)
- [x] 1.3 Set up dark dashboard base layout and global styles

## 2. ESPN Ingestion

- [x] 2.1 Implement ESPN API adapter in `lib/espn/client.ts` — single place for the scoreboard URL and response parsing
- [x] 2.2 Implement match status classification: map ESPN status codes to `scheduled | in-progress | final`
- [x] 2.3 Implement "match just finished" detection — compare previous state snapshot to current; surface newly-final match IDs
- [x] 2.4 Add typed error for ESPN unavailability; callers receive a stale-data signal rather than an unhandled exception
- [x] 2.5 Create `/api/scoreboard` Next.js route handler that calls the ESPN adapter server-side and returns normalized data to the browser

## 3. Match Cache

- [x] 3.1 Implement on-disk cache in `lib/cache/disk.ts` — reads/writes `data/cache/matches.json` keyed by match ID
- [x] 3.2 Implement write-once guard: skip write if match ID already present in the on-disk cache
- [x] 3.3 Implement in-memory store in `lib/cache/memory.ts` for live/in-progress matches (module-level singleton)
- [x] 3.4 Implement `getMergedResults()` in `lib/cache/index.ts` — merges disk (completed) + memory (live) into a unified match result list
- [x] 3.5 Verify no standings or bracket module imports from the ESPN client directly; all reads go through `getMergedResults()`

## 4. Standings Engine

- [x] 4.1 Hardcode 2026 group membership in `lib/engine/groups.ts` — all 48 teams assigned to groups A–L
- [x] 4.2 Implement per-group standings row computation (MP, W, D, L, GF, GA, GD, Pts) in `lib/engine/standings.ts`
- [x] 4.3 **Verify FIFA 2026 official tiebreaker sequence from official regulations** — documented in code; implemented verified ordering: H2H pts → H2H GD → H2H GS → overall GD → overall GS → fair-play → FIFA World Ranking (not lots — per official 2026 regulations)
- [x] 4.4 Implement head-to-head sub-computation: extract H2H match(es) between tied teams and apply points → GD → GS
- [x] 4.5 Implement fair-play points: yellow = −1, red = −3, second-yellow/yellow-red = −3
- [x] 4.6 Implement `tiedPendingRanking: boolean` flag on standing rows — set when all measurable criteria are exhausted (field renamed from tiedPendingLots to reflect actual FIFA 2026 rule)
- [x] 4.7 Implement cross-group third-place ranking in `lib/engine/thirds.ts` — rank all 12 third-placed teams using the same tiebreaker sequence
- [x] 4.8 Implement best-8-thirds selection: top 8 from cross-group ranking advance, bottom 4 are eliminated

## 5. Knockout Bracket

- [x] 5.1 **Source the official FIFA 2026 R32 third-place allocation table** — all 495 entries populated in `lib/engine/allocationTable.ts` from Wikipedia mirror of Annex C (https://en.wikipedia.org/wiki/Template:2026_FIFA_World_Cup_third-place_table). Keys self-validated: each entry's 8 slot values form a permutation of the 8 included groups. TypeScript compiles clean.
- [x] 5.2 Implement `computeBracket()` in `lib/engine/bracket.ts` — reads top-2 per group + 8 best thirds, looks up allocation table, produces full R32 matchup tree
- [x] 5.3 Implement lookup guard: returns null for missing combinations; bracket UI surfaces "Annex C pending" label
- [x] 5.4 Propagate `tiedPendingRanking` into bracket slot type: slots occupied by a pending-ranking team are typed as `tbd-pending-ranking`
- [x] 5.5 Write a unit test for at least one known allocation table combination to confirm slot assignments are correct

## 6. Refresh Controls

- [x] 6.1 Implement pipeline runner in `lib/pipeline.ts`: read cache → fetch ESPN → write newly-completed matches to disk → recompute standings + bracket → return updated snapshot
- [x] 6.2 Implement background poller singleton in `lib/poller.ts` — `globalThis.__pollerStarted` flag ensures only one instance starts regardless of how many times the initializer is called
- [x] 6.3 Implement match-window awareness in the poller: skip ESPN call if no match is scheduled within ±90 minutes of current time; otherwise poll every ~60 seconds
- [x] 6.4 Create `/api/refresh` route handler that runs the pipeline and returns the updated snapshot to the caller
- [x] 6.5 `initPoller()` called from `/api/scoreboard`, `/api/refresh`, and `app/page.tsx` — lazy-starts singleton on first server-side request

## 7. Group Tables UI

- [x] 7.1 Build `GroupTable` component — renders one group's standings with columns: Pos, Team, MP, W, D, L, GF, GA, GD, Pts
- [x] 7.2 Apply qualification color coding per row: green (rank 1–2), amber (rank 3 + inside best-8-thirds), red (rank 4 or rank 3 outside best-8)
- [x] 7.3 Render `tiedPendingRanking` indicator alongside affected rows (small "TIE" badge in yellow)
- [x] 7.4 Build groups page (`app/page.tsx`) showing all 12 group tables in a 3-column grid
- [x] 7.5 Add page-level note: "Standings are live and updated on refresh — color coding reflects current snapshot"

## 8. Bracket UI

- [x] 8.1 Build `Bracket` component — renders all 16 R32 matchups as cards with team names and slot labels
- [x] 8.2 Display snapshot label: "Projected bracket — if the group stage ended now"
- [x] 8.3 Render `tbd-pending-ranking` slots as "TBD — FIFA Ranking" rather than a team name

## 9. App Shell & Wiring

- [x] 9.1 Build app shell with navigation tabs: Standings | Bracket (Stats tab placeholder for Phase 2)
- [x] 9.2 Add manual refresh button to the shell header with loading spinner and disabled state during in-flight requests
- [x] 9.3 Wire refresh button to `POST /api/refresh`; on response, `router.refresh()` updates the page without full reload
- [x] 9.4 `initPoller()` called from page server components and API routes — starts on first request
