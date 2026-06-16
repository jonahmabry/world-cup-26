# World Cup 2026 Tracker

[![CI](https://github.com/jonahmabry/world-cup-26/actions/workflows/ci.yml/badge.svg)](https://github.com/jonahmabry/world-cup-26/actions/workflows/ci.yml)
[![Vercel](https://deploy-badge.vercel.app/vercel/world-cup-26-pi)](https://world-cup-26-pi.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Live group standings, projected knockout bracket, and match scores for the FIFA World Cup 2026 — updated on every page load from the ESPN API.

**Live site:** [https://world-cup-26-pi.vercel.app](https://world-cup-26-pi.vercel.app/)

---

## Features

- **Live group standings** — all 12 groups (A–L), color-coded by qualification status (auto-qualified / best-8-thirds / eliminated), updated as scores change
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

**Prerequisites:** Node.js 20+, npm

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
  components/         # GroupTable, Bracket, Nav, RefreshButton

lib/
  pipeline.ts         # Orchestrates fetch → cache → standings → bracket
  poller.ts           # Background interval poller (keeps cache warm)
  espn/client.ts      # ESPN API fetch + response parsing
  cache/              # Disk cache (completed matches) + memory cache (live)
  engine/
    groups.ts         # Hardcoded group membership (2026 draw)
    standings.ts      # Per-group standings + FIFA 2026 tiebreaker (Steps 1–3)
    thirds.ts         # Cross-group third-place ranking
    fifaRanking.ts    # Frozen FIFA World Ranking snapshot (Step-3 tiebreaker)
    bracket.ts        # Knockout bracket computation
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
- **Changelog:** `CHANGELOG.md` follows Keep a Changelog; versioning follows SemVer (pre-1.0: breaking = minor bump, features/fixes = patch)
- **Tests:** co-located with source (`*.test.ts`); run in CI on every push and PR
