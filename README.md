# World Cup 2026 Tracker

[![CI](https://github.com/jonahmabry/world-cup-26/actions/workflows/ci.yml/badge.svg)](https://github.com/jonahmabry/world-cup-26/actions/workflows/ci.yml)
[![Vercel](https://deploy-badge.vercel.app/vercel/world-cup-26-pi)](https://world-cup-26-pi.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Live group standings, projected knockout bracket, and match scores for the FIFA World Cup 2026 — updated on every page load from the ESPN API.

**Live site:** [https://world-cup-26-pi.vercel.app](https://world-cup-26-pi.vercel.app/)

---

## Features

- **Live group standings** — all 12 groups (A–L), color-coded by qualification status (auto-qualified / best-8-thirds / eliminated), updated as scores change
- **Clinch indicators** — `✓ THROUGH` / `✗ OUT` badges mark teams that are *mathematically* guaranteed to reach the Round of 32 (top-2 or a clinched best-third spot) or eliminated, computed by enumerating every remaining outcome
- **Match schedule** — the `/schedule` page steps through the tournament one phase at a time (Matchday 1–3, Round of 32 → Final), grouped by day, with scores, kickoff times, and venues
- **Projected knockout bracket** — full tree from Round of 32 through the Final, recomputed as an "if the group stage ended now" snapshot; resolves ties using the frozen FIFA World Ranking
- **LIVE indicators** — rows with in-progress matches are flagged in real time
- **Manual refresh** — hit the Refresh button in the nav to pull the latest scores immediately

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, force-dynamic SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data source | ESPN API (`site.api.espn.com/apis/site/v2/sports/soccer/fifa.world`) |
| Testing | Vitest |
| Deployment | Vercel |
| CI | GitHub Actions (lint → typecheck → test → build) |

---

## Local development

**Prerequisites:** Node.js 24+, npm

```bash
git clone https://github.com/jonahmabry/world-cup-26.git
cd world-cup-26
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app fetches live data from ESPN on every request — no environment variables required.

### Available commands

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run start      # serve the production build locally
npm run test       # run Vitest unit tests
npm run typecheck  # TypeScript type-check (no emit)
npm run lint       # ESLint
```

### Running tests

```bash
npm run test
```

Tests live beside their source files (e.g. `lib/engine/standings.test.ts`). The test suite covers the standings engine, tiebreaker logic, third-place ranking, bracket computation, cache layers, and the ESPN client.

---

## Architecture

```
app/                  # Next.js App Router pages and components
  page.tsx            # Group standings page (/)
  bracket/page.tsx    # Knockout bracket page (/bracket)
  schedule/page.tsx   # Match schedule page (/schedule)
  components/         # GroupTable, Bracket, Nav, RefreshButton, ClinchBadge, schedule rows

lib/
  pipeline.ts         # Orchestrates fetch → cache → standings → bracket
  poller.ts           # Background interval poller (keeps cache warm)
  espn/client.ts      # ESPN API fetch + response parsing
  cache/              # Disk cache (completed matches) + memory cache (live)
  engine/
    groups.ts         # Hardcoded group membership (2026 draw)
    standings.ts      # Per-group standings + FIFA 2026 tiebreaker (Steps 1–3)
    thirds.ts         # Cross-group third-place ranking
    clinch.ts         # Group-outcome enumeration + locked group positions
    qualification.ts  # Mathematical clinch status (THROUGH / OUT) per team
    fifaRanking.ts    # Frozen FIFA World Ranking snapshot (Step-3 tiebreaker)
    bracket.ts        # Knockout bracket computation
    groupSchedule.ts  # Static 72-match group-stage fixture table
    phases.ts         # Tournament phase windows + day grouping
    knockoutSchedule.ts  # Official R32–Final match schedule
    allocationTable.ts   # FIFA 2026 third-place allocation table (495 combos)
```

### How data flows

1. On each page request, `pipeline.ts` runs
2. Completed matches are served from the on-disk JSON cache (`data/cache/matches.json`) — written once, never re-fetched
3. Scheduled and in-progress matches are fetched live from ESPN
4. The standings engine applies the FIFA 2026 tiebreaker sequence (H2H → overall GD/GF/fair-play → FIFA ranking)
5. The bracket engine projects the knockout tree from the current standings snapshot
6. A background poller (`setInterval`) keeps the in-memory cache warm between page loads

### Tiebreaker logic

Within-group ties are resolved in this order (per the 2026 FIFA Competition Regulations):

1. **Step 1** — head-to-head record among tied teams (pts → GD → GF)
2. **Step 2** — overall group record (GD → GF → fair-play score)
3. **Step 3** — frozen FIFA/Coca-Cola Men's World Ranking snapshot (`lib/engine/fifaRanking.ts`)

`tiedPendingRanking` is only set when two tied teams share a ranking position or a team is absent from the snapshot — a rare fallback, not the normal path.

---

## Deployment

The app is deployed to Vercel via the GitHub integration. Every push to `master` triggers a production deployment automatically.

### Deploying your own instance

1. Fork the repo and import it into [Vercel](https://vercel.com/new)
2. No environment variables are required — the ESPN API is public
3. Vercel's build command is `npm run build`; output is the standard Next.js `.next` directory

> **Note:** The app uses `export const dynamic = 'force-dynamic'` on all pages, so every request is SSR and Vercel's edge cache is bypassed intentionally. The ESPN fetch and standings computation run on every page load.

---

## Project conventions

- **Branch policy:** always create a feature branch before editing; never commit directly to `master`
- **Changes are spec-driven:** see `openspec/` for proposals, designs, task lists, and delta specs for every shipped change
- **Changelog and releases:** managed by [Changesets](https://github.com/changesets/changesets). When making a user-facing change, run `npx changeset` to record a release note. From `1.0.0` onward the project follows standard semver — `major` for breaking changes, `minor` for new features, `patch` for fixes. The CI release workflow opens a "Version Packages" PR that tags and creates a GitHub Release on merge.
- **Tests:** co-located with source (`*.test.ts`); run in CI on every push and PR
