# Changelog

## 1.1.0

### Minor Changes

- [#32](https://github.com/jonahmabry/world-cup-26/pull/32) [`55f0166`](https://github.com/jonahmabry/world-cup-26/commit/55f01665f744f5e79eb7a384e578972ca0a8d7d5) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Show live and final knockout-stage scoring across the bracket and schedule. Knockout matches are now ingested from ESPN (previously dropped for lacking a group note), capturing the round, the winner, and penalty-shootout scores. The bracket resolves real results into the tree — winners advance, the two Semi-final losers feed the third-place play-off — and cards gain LIVE / FT / FT-Pens states with row-aligned scores, penalty notation, and a faded losing row. Schedule knockout rows mirror the group rows, and group-stage clinch badges hide once the group stage is complete.

### Patch Changes

- [#31](https://github.com/jonahmabry/world-cup-26/pull/31) [`24cfd4d`](https://github.com/jonahmabry/world-cup-26/commit/24cfd4d8dc5b26829a7da53f9e527c5c4617b65f) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Widen the venue-city column in the schedule rows (group and knockout) so longer city names render without crowding the layout, backfill match data in the cache, and refresh the FIFA ranking table to the latest ordering.

## 1.0.0

### Major Changes

- [#28](https://github.com/jonahmabry/world-cup-26/pull/28) [`5c96f2b`](https://github.com/jonahmabry/world-cup-26/commit/5c96f2b9de7a0fbf920c90eb8aaac0c5c4a24581) Thanks [@jonahmabry](https://github.com/jonahmabry)! - 🏆 **v1.0.0** — the public launch milestone. The tracker now ships live group standings with mathematical clinch/elimination badges, a projected knockout bracket, and a full match schedule, plus a persistent link to the source on GitHub. From this release onward the project follows standard semver (major = breaking, minor = feature, patch = fix).

### Minor Changes

- [#28](https://github.com/jonahmabry/world-cup-26/pull/28) [`5c96f2b`](https://github.com/jonahmabry/world-cup-26/commit/5c96f2b9de7a0fbf920c90eb8aaac0c5c4a24581) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Add `✓ THROUGH` / `✗ OUT` clinch badges to the group standings tables and the best-thirds table. Badges appear only once a team is **mathematically** guaranteed into the Round of 32 (clinched top-2 or a clinched best-third spot) or eliminated — distinct from, and shown alongside, the existing position-based row colouring. A new conservative bounded engine (`lib/engine/qualification.ts`) reuses the group-outcome enumeration and bounds the cross-group best-thirds race, so it never reports a false clinch and treats in-progress matches as undecided.

- [#25](https://github.com/jonahmabry/world-cup-26/pull/25) [`d1f2dc0`](https://github.com/jonahmabry/world-cup-26/commit/d1f2dc0a7f0099bad0c16aebd2ad4fe6b0baafda) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Add `/schedule` page showing all 72 group-stage fixtures and knockout projections, organized by phase (Matchday 1–3, R32–Final) with a ±1 sliding-window phase nav. Group rows show live scores or kickoff times; knockout rows show projected matchups with clinch-based R32 slot auto-fill. Adds `PhaseKey`, `Phase`, and `GroupFixture` types, a 72-fixture static group schedule, group-position clinch detection via exhaustive `computeGroupStandings` enumeration, ISO dates on all knockout schedule entries, and `matches` on the pipeline snapshot.

## 0.1.6

### Patch Changes

- [#22](https://github.com/jonahmabry/world-cup-26/pull/22) [`40953f2`](https://github.com/jonahmabry/world-cup-26/commit/40953f2c3cbbf568204391fe939c222a698c31ac) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Show each resolved team's frozen FIFA World Ranking in the projected bracket, in a fixed-width gutter between the flag and the team name so the names line up across rows. Placeholder slots (TBD / Winner-of) and unranked names render no number.

- [#24](https://github.com/jonahmabry/world-cup-26/pull/24) [`6159165`](https://github.com/jonahmabry/world-cup-26/commit/6159165edf7cdc9b3c724f1e3b61f5bbd9516fb5) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Add the third-place play-off (M103) to the projected bracket. Introduces the `ThirdPlace` round and a `loser-of` slot reference (the losers of the two Semi-finals), and renders M103 as a detached card in the lower-right of the bracket — aligned with the Final column and the M100 row — with no tree connectors.

## 0.1.5

### Patch Changes

- [#16](https://github.com/jonahmabry/world-cup-26/pull/16) [`fac3e99`](https://github.com/jonahmabry/world-cup-26/commit/fac3e99f40d57ae1171d62a831c8d634a8df8ee2) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Add SVG country flags next to every team name in the group standings tables, the projected knockout bracket, and the third-place ranking table. Flags are bundled static assets keyed by country code (so they render on Windows, unlike emoji flags), with distinct flags for the home nations (England, Scotland).

- [#21](https://github.com/jonahmabry/world-cup-26/pull/21) [`adb09cb`](https://github.com/jonahmabry/world-cup-26/commit/adb09cb6883e18f723ccbc17949461efbb8dfe60) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Fix a backfill date-boundary bug that permanently skipped late-night matches. ESPN buckets matches by US-Eastern date while the watermark advanced by UTC date, so late kickoffs (~00:00–05:00 UTC) were orphaned. The sweep now starts `BACKFILL_LOOKBACK_DAYS` before the watermark so the earlier Eastern date label is re-queried, and the 6 affected finished matches are backfilled. ([#18](https://github.com/jonahmabry/world-cup-26/issues/18))

- [#21](https://github.com/jonahmabry/world-cup-26/pull/21) [`adb09cb`](https://github.com/jonahmabry/world-cup-26/commit/adb09cb6883e18f723ccbc17949461efbb8dfe60) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Correct the third-place Round-of-32 allocation table column mapping. The 8 slot strings were written under the wrong match numbers, placing advancing third-place teams into the wrong R32 matches. The remapped table now matches the official FIFA Annex C source exactly across all 495 group combinations. ([#19](https://github.com/jonahmabry/world-cup-26/issues/19))

## 0.1.4

### Patch Changes

- [#13](https://github.com/jonahmabry/world-cup-26/pull/13) [`bd7a824`](https://github.com/jonahmabry/world-cup-26/commit/bd7a8245eaee9416cc335d2f27bee0e2fc775f24) Thanks [@jonahmabry](https://github.com/jonahmabry)! - Adopt Changesets for automated version bumps, changelog generation, git tags, and GitHub Releases. Releases are now cut via a "Version Packages" bot pull request on `master`; the private package is versioned and tagged but never published to a registry. Reconciles prior version/changelog drift.

All notable changes to the World Cup 2026 Tracker are documented here.

<!-- Future entries are auto-generated by Changesets (see .changeset/). -->
<!-- Hand-written history (v0.1.0–v0.1.3) is preserved below. -->

## [0.1.3] - 2026-06-16

### Changed

- Move CI and local engines to Node 24 LTS; add `engines.node >=24.0.0` to `package.json`, `.nvmrc` (24), and bump `@types/node` to `^24` (Node 20 GitHub Actions runtime is deprecated)

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

[0.1.0]: https://github.com/jonahmabry/world-cup-26/releases/tag/v0.1.0
