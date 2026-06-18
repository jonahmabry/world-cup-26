## 1. Render the FIFA World Ranking in the bracket

- [x] 1.1 In `app/components/Bracket.tsx`, import `fifaRank` and `UNRANKED` from
  `@/lib/engine/fifaRanking`
- [x] 1.2 In `TeamSlot`, restructure the resolved branch (`team.kind === 'team'`): keep the
  flag, make the name span `flex-1` + `truncate`, and add a fixed-width, right-aligned rank
  gutter rendering `#{fifaRank(team.name)}` (muted/mono small text, e.g.
  `text-slate-400 text-[10px] font-mono tabular-nums w-7 text-right`, `title="FIFA World Ranking"`)
- [x] 1.3 Guard graceful degradation: when `fifaRank(team.name) === UNRANKED`, render no rank
  span
- [x] 1.4 Leave the placeholder branches (`tbd-pending-ranking`, `winner-of`, `unknown`) and
  `MatchCard`'s venue/date column unchanged

## 2. Verification

- [x] 2.1 `npm run lint` green
- [x] 2.2 `npm run typecheck`, `npm run test`, `npm run build` all green
- [x] 2.3 `npm run dev`: every resolved R32 team shows `#<rank>` right-aligned in a fixed
  gutter; rankings line up vertically across rows; long names (e.g. "Bosnia and Herzegovina")
  truncate without pushing or clipping the rank; TBD / "Winner of M…" slots show no rank
- [x] 2.4 `npx changeset` to record a `patch` release note
- [ ] 2.5 Commit, push `feat/bracket-fifa-ranking`, open PR; confirm CI green
