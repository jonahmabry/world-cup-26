# Changelog

All notable changes to the World Cup 2026 Tracker are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While pre-`1.0.0`, the public behavior is still stabilizing: breaking changes bump the
**minor** version, and features/fixes bump the **patch** version. `1.0.0` is reserved for
the tournament-stable public launch.

Each phase maps to a minor release and bundles one or more OpenSpec changes
(see `openspec/changes/`).

## [Unreleased]

Planned phases, in build order:

### Phase 2 — `0.2.0` (fix-first)
- `data-accuracy` — full-tournament backfill (ESPN date-range fetch + coverage watermark)
  and provisional/live standings, so finished and in-progress matches both move the tables
  and bracket. Ships with its own engine tests.
- `hardening` — regression coverage for the remaining engine modules (`thirds`, `bracket`,
  `espn/client`, `cache`) plus a GitHub Actions CI pipeline (lint → typecheck → test → build).

_Implementation order within the phase: `data-accuracy` first, then `hardening`._

### Phase 3 — `0.3.0`
- `bracket-tree` — extend the knockout bracket from R32-only to the full tree
  (R32 → R16 → QF → SF → Final) and rebuild the UI as a connected bracket diagram with
  host city and kickoff per match.

### Phase 4 — `0.4.0`
- Stats section — API-Football integration and the full player-stats section
  (goals, assists, rating, shots, saves, cards, minutes, etc.).

## [0.1.0] - 2026-06-13

Phase 1 — the foundation, built to be useful during the live group stage.

### Added
- ESPN ingestion of live scores, fixtures, and match status (`fifa.world` slug).
- In-house standings/tiebreaker engine: per-group tables, top-2 per group, cross-group
  ranking of third-placed teams, and the best-8-thirds cutoff; emits `tied-pending-lots`
  where a drawing of lots would be required.
- Color-coded group tables (auto-qualifiers / best-thirds cutoff / eliminated).
- Projected knockout bracket (Round of 32) using the official FIFA 2026 allocation table,
  recomputed as an "if the group stage ended now" snapshot.
- On-disk JSON cache for completed matches (write-once) plus in-memory cache for live data;
  manual refresh and a background poller.

[Unreleased]: https://github.com/jonahmabry/world-cup-26/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jonahmabry/world-cup-26/releases/tag/v0.1.0
