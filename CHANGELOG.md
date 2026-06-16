# Changelog

All notable changes to the World Cup 2026 Tracker are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While pre-`1.0.0`, the public behavior is still stabilizing: breaking changes bump the
**minor** version, and features/fixes bump the **patch** version. `1.0.0` is reserved for
the tournament-stable public launch.

## [Unreleased]

Upcoming changes, in planned order:

- `node-24-upgrade` — move CI + local engines to Node 24 (Node 20 GitHub Actions runtime is deprecated)
- `release-automation` — adopt Changesets for automated version bumps, changelog, and GitHub Releases
- `country-flags` — SVG flags next to each country name (handles England/Scotland/Wales)
- `stats-section` — Phase 4: API-Football integration and the full player-stats section
- `bracket-challenge` — March Madness-style bracket challenge with user accounts and a leaderboard (Supabase)
- `live-ranking-bracket` — bracket/standings react to FIFA's live World Ranking projection as scores change

## [0.1.2] - 2026-06-15

### Fixed
- Removed dead `deploy` CI job (always-skipped `if: false` stub); Vercel handles deployment via its own GitHub integration

## [0.1.1] - 2026-06-15

### Fixed
- **Bracket TBD slots** — runner-ups and the 8 advancing third-place teams were rendering as "TBD" throughout the group stage because Step 3 of the FIFA 2026 tiebreaker (FIFA World Ranking) was documented but never implemented; added a committed offline snapshot of the pre-tournament FIFA/Coca-Cola Men's World Ranking for all 48 finalists and wired it as the Step-3 sort key in both the within-group and cross-group tiebreaker paths
- **Pts column clipped** — fixed `GroupTable` layout with `table-fixed` + `<colgroup>` explicit widths so a `LIVE` badge can never squeeze numeric stat columns
- **TIE badge removed** — with the ranking snapshot resolving ties, the `TIE` badge and legend are no longer needed and have been removed

## [0.1.0] - 2026-06-13

Phase 1 — the foundation, built to be useful during the live group stage.

### Added
- ESPN ingestion of live scores, fixtures, and match status (`fifa.world` slug)
- In-house standings/tiebreaker engine: per-group tables, top-2 per group, cross-group ranking of third-placed teams, and the best-8-thirds cutoff
- Color-coded group tables (auto-qualifiers / best-thirds cutoff / eliminated)
- Projected knockout bracket covering the full tree (R32 → R16 → QF → SF → Final) using the official FIFA 2026 allocation table, recomputed as an "if the group stage ended now" snapshot
- On-disk JSON cache for completed matches (write-once) plus in-memory cache for live data; manual refresh button and a background poller
- GitHub Actions CI pipeline (lint → typecheck → test → build)
- Vercel deployment via GitHub integration

[Unreleased]: https://github.com/jonahmabry/world-cup-26/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/jonahmabry/world-cup-26/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/jonahmabry/world-cup-26/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jonahmabry/world-cup-26/releases/tag/v0.1.0
