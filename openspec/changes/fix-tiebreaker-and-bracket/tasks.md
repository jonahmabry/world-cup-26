## 1. FIFA World Ranking snapshot

- [ ] 1.1 Add `lib/engine/fifaRanking.ts` with `FIFA_RANKING: Record<string, number>` covering all 48
  finalists (keys matching the team names in `lib/engine/groups.ts`), sourced from the frozen
  pre-tournament FIFA/Coca-Cola Men's ranking
- [ ] 1.2 Export `fifaRank(team: string): number` returning the ranking position, with a high sentinel
  (e.g. `999`) for names absent from the snapshot
- [ ] 1.3 Add a small dev script note for regenerating the snapshot from `inside.fifa.com` (run only if
  FIFA republishes — not expected before the knockout stage)

## 2. Step 3 — within-group tiebreak

- [ ] 2.1 In `lib/engine/standings.ts` `applyOverall`, after the Step-2 sort, order any still-tied
  sub-group by `fifaRank` ascending (lower position ranks higher)
- [ ] 2.2 Add to `pending` (→ `tiedPendingRanking: true`) **only** when two tied teams share a ranking
  position or a team is missing from the snapshot
- [ ] 2.3 Update the file-header comment to reflect that Step 3 is now implemented

## 3. Step 3 — cross-group third-place ranking

- [ ] 3.1 In `lib/engine/thirds.ts` `compareThirds`, add a final clause ordering by
  `fifaRank(a) - fifaRank(b)`
- [ ] 3.2 Mark `tiedPendingRanking` only when ranks are equal or a team is missing from the snapshot

## 4. Bracket population

- [ ] 4.1 Confirm `lib/engine/bracket.ts` `winner/runnerUp/thirdFrom` now return real teams once ties
  resolve; keep the `tbd-pending-ranking` branch as the rare fallback only
- [ ] 4.2 Verify R32 populates fully from day 0 (including not-yet-started groups ordered by FIFA rank)

## 5. Group table layout

- [ ] 5.1 In `app/components/GroupTable.tsx`, apply `table-fixed` with explicit column widths; Team cell
  `truncate`, `LIVE`/`TIE` badges `shrink-0`, numeric cells `whitespace-nowrap`
- [ ] 5.2 Confirm the **Pts** column is never clipped/squeezed when a `LIVE` badge is present (Group F /
  Netherlands case)

## 6. Tests

- [ ] 6.1 Add `lib/engine/fifaRanking.test.ts` for the lookup + fallback
- [ ] 6.2 Add a `standings.test.ts` case: a Step-2 dead-heat now resolves by FIFA rank (no
  `tiedPendingRanking`)
- [ ] 6.3 Add a `thirds.test.ts` case: a cross-group third-place tie resolves by FIFA rank
- [ ] 6.4 Add a `bracket.test.ts` case: a previously-tied runner-up / third now renders as a real team
- [ ] 6.5 Update existing fixtures that assert `tiedPendingRanking === true` to expect the rank-resolved
  order
- [ ] 6.6 `npm run test` green, `npm run typecheck` clean
