## Why

The 2026 FIFA World Cup group stage is live (started June 11, 2026) and there is no good local tool for tracking live standings, tiebreaker state, and the projected knockout bracket in real time. Phase 1 builds the core data pipeline and UI needed to follow the group stage as it unfolds.

## What Changes

- Scaffold a new Next.js/TypeScript project with server-side API routes
- Implement an ESPN hidden-API client that fetches live scores, fixtures, and match status (no key required)
- Build an in-house standings engine that computes group tables with full FIFA 2026 tiebreaker logic, including a `tied-pending-lots` flag for unresolvable ties
- Add a two-tier cache: on-disk JSON for completed matches (written once, read forever) and in-memory for live/in-progress data
- Render color-coded group tables (green = top-2 qualifier, amber = inside 8-best-thirds cutoff, red = eliminated)
- Compute and render a projected Round-of-32 bracket using the real FIFA 2026 third-place allocation table
- Add a manual refresh button and a background poller (active only during/near match windows, ~60s cadence)

## Capabilities

### New Capabilities

- `espn-ingestion`: ESPN hidden-API client — fetches scoreboard, live match status, and "game just finished" detection for `fifa.world`
- `standings-engine`: Computes per-group standings tables and cross-group third-place ranking with full FIFA 2026 tiebreaker ordering (points → GD → GS → H2H → fair-play → tied-pending-lots); group membership hardcoded from the draw
- `match-cache`: Two-tier caching layer — on-disk JSON for finalized matches, in-memory store for live data; server restarts are zero-cost for completed-match data
- `group-tables-ui`: Color-coded group standings page — green (top-2), amber (8-best-thirds), red (eliminated); shows live tiebreaker state
- `knockout-bracket`: Deterministic snapshot bracket — slots top-2 finishers and the 8 best thirds into the R32 using the official FIFA 2026 allocation table; recomputed on every refresh; labeled as a snapshot (volatile early in group stage)
- `refresh-controls`: Manual refresh button (re-runs the full pipeline) and a background poller that detects match completion and triggers enrichment only during active match windows

### Modified Capabilities

## Impact

- New project: no existing code is modified
- Runtime dependencies: Next.js, TypeScript; no database
- External calls: ESPN `site.api.espn.com` (no key); API-Football deferred to Phase 2
- Server-side only: all outbound HTTP calls go through Next.js API routes — no browser CORS exposure, no keys shipped to the client
- Open verification items to resolve before building: (1) exact FIFA 2026 tiebreaker ordering from official regulations, (2) official FIFA 2026 R32 third-place allocation table and its mechanism
