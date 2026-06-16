## Root-cause trace

- `lib/engine/standings.ts` resolves group ties through Step 1 (`applyH2H`) and Step 2 (`applyOverall`);
  any sub-group still level after Step 2 is added to a `pending` set and surfaces as
  `tiedPendingRanking: true`. Step 3 (FIFA World Ranking) is documented in the file header but **not
  implemented** — the order among still-tied teams is simply left undefined.
- `lib/engine/thirds.ts` `compareThirds` mirrors this: it compares pts → GD → GS → fair-play and returns
  `0` for still-tied teams, marking them `tiedPendingRanking`.
- `lib/engine/bracket.ts` `winner()`, `runnerUp()`, `thirdFrom()` each convert any `tiedPendingRanking`
  row to `{ kind: 'tbd-pending-ranking' }`, which `app/components/Bracket.tsx` `TeamSlot` renders as
  yellow "TBD". So every flagged team — runner-up (bug 1) or third (bug 2) — disappears.
- Early in the group stage many teams are level through Step 2, so the flag (and the "TBD") fire
  constantly, exactly when people are watching.

## Decision: frozen snapshot, not live scrape

The FIFA/Coca-Cola Men's World Ranking is a **published** list released on fixed dates, not a live feed.
During a World Cup the next publication lands *after* the tournament (e.g. the 2022 ranking published
four days after the final). The official tiebreaker uses the published edition, which is therefore
**frozen for the whole event**. A committed snapshot gives output identical to scraping during the cup,
without a fragile JS-page dependency in the standings hot path. (A separate, later feature —
`live-ranking-bracket` — will react to FIFA's *live projection*; that is explicitly out of scope here.)

## Approach

- **`lib/engine/fifaRanking.ts`** — `FIFA_RANKING: Record<string, number>` for all 48 finalists +
  `fifaRank(team): number` returning the position, with a high sentinel for unknown names. Team-name
  keys match the names used elsewhere in the engine (the `GROUPS` map).
- **Step 3, within-group** — in `applyOverall`, after the Step-2 comparisons, order any still-tied
  sub-group by `fifaRank` ascending. Add to `pending` (→ `tiedPendingRanking`) **only** when two teams
  share a ranking position or one is absent from the snapshot.
- **Step 3, cross-group** — in `compareThirds`, add a final clause
  `fifaRank(a) - fifaRank(b)`; mark `tiedPendingRanking` only on equal rank / missing team.
- **Bracket** — no logic change required; resolved ties flow through as real teams. Keep the existing
  `tbd-pending-ranking` branch as the rare fallback. Note: a not-yet-started group now orders by FIFA
  rank, so R32 populates from day 0 — the intended provisional-snapshot behavior.
- **Table layout** — `app/components/GroupTable.tsx`: apply `table-fixed` with explicit column widths;
  Team cell `truncate`, badges `shrink-0`, numeric cells `whitespace-nowrap`. Pts can no longer be
  squeezed regardless of badge state.

## Test impact

Existing `standings.test.ts` / `thirds.test.ts` fixtures that assert `tiedPendingRanking === true` on a
measurable dead-heat must be updated to expect the rank-resolved order. New tests cover the ranking
lookup/fallback and that bracket slots render real teams instead of "TBD".
