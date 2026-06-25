## Context

The tournament sends 32 of 48 teams to the Round of 32: the top 2 of each of the 12 groups
(24 teams) plus the best 8 of the 12 third-placed teams. 4th place never advances. "Clinched"
must therefore account for both routes, and the best-third route is **cross-group** — a team's
fate depends on how the other 11 groups finish.

A naive global enumeration of every remaining match across all groups is infeasible early on
(up to 3^48). The design instead enumerates **within each group independently** (cheap) and
bounds the cross-group comparison.

## Goals

- Show `✓ THROUGH` only when a team is guaranteed into the Round of 32 in **every** remaining
  outcome; show `✗ OUT` only when it is eliminated in **every** outcome.
- Never produce a false `THROUGH` or false `OUT` (a missed/late clinch is acceptable).
- Reuse the existing clinch enumeration and standings/thirds engines; leave the existing
  position-based `qualStatus` colouring untouched.

## Decision: conservative bounded algorithm

`computeClinchStatuses(groupStandings, matches): Map<'<groupId>|<team>', 'through'|'out'|'none'>`.

**If the group stage is complete** (`isGroupStageComplete(matches)`): resolve exactly. Using
`rankThirds(groupStandings)`, a team is `through` when its position ≤ 2 or it is the 3rd-placed
team of a group in `advancingGroupIds`; otherwise `out`.

**Otherwise (bounded):** for each group, make one pass over `enumerateGroupOutcomes(groupId,
matches)` (every reachable final standings table, rebuilt from finals-only + synthetic outcomes
for the remaining fixtures). From that pass derive, per team:
- the set of possible final positions;
- if it can finish 3rd, the **worst-case** and **best-case** third-place comparison triple
  `(pts, gd, gf)` over the outcomes where it is 3rd;
- and, per group, the **best-possible** and **worst-possible** third-place triple across whichever
  team ends 3rd.

Then per team:
- `through` if **guaranteed top-2** in every outcome; **or** guaranteed top-3 (never 4th) **and**
  at most 7 other groups *could* field a third ranked at-or-above this team's **worst-case** triple
  (each competitor taken at its **best-possible** third — an upper bound on competitors above ⇒
  safe).
- `out` if it can **never** reach top-2 **and** at least 8 other groups are *guaranteed* to field a
  third strictly above this team's **best-case** triple (each competitor taken at its
  **worst-possible** third — a lower bound on competitors above ⇒ safe).
- otherwise `none` (also `none` when there are no final results yet).

### Why the bound is sound

Third-placed teams from different groups never share a match, so the groups' third-place outcomes
are independent. Taking each competitor independently at its extreme therefore yields a valid
bound on "how many thirds could/are-guaranteed-to outrank this team," and within the team's own
group the other three teams occupy {1,2,4} when it finishes 3rd, so there is no self-interaction.

## Three correctness rules

1. **Bounded comparator uses only `(pts, gd, gf)`** — not fair-play or FIFA rank.
   `syntheticResult` assigns zero cards to enumerated future fixtures, so any fair-play value is
   optimistic and unsafe as a clinch lever. Tie handling is conservative: for `through` counting a
   competitor counts if its best triple is *not strictly below* the team's worst (ties count
   against us); for `out` counting a competitor counts only if its worst triple is *strictly
   above* the team's best. (The **complete** case still uses the exact `rankThirds`/`compareThirds`,
   where all real data is known.)
2. **Rebuild standings from finals-only** inside the enumeration so **in-progress** matches are
   treated as undecided ("remaining"), never folded in as provisional results.
3. **Mirror `tiedPendingRanking`**, as `lockedGroupPositions` already does: "guaranteed top-2" and
   "guaranteed top-3 when exactly 3rd" require `!tiedPendingRanking` in those outcomes, so a tie the
   FIFA ranking could not separate is never treated as a clinch.

## Performance

Per group the work is 3^k where k is that group's remaining fixtures (≤ 6, and only 6 before a
group's first match). Summed across 12 groups the worst case is a few thousand single-group
standings builds — negligible, and only on the cached server pipeline. This mirrors the cost
`lockedGroupPositions` already pays on the Schedule page.

## UI

A small shared `ClinchBadge` renders `✓ THROUGH` (emerald) / `✗ OUT` (red) / nothing, styled like
the existing `LIVE` tag (`text-[10px] font-bold tracking-wide shrink-0`). It is placed next to the
team name in `GroupTable.tsx` and on each best-thirds row in `app/page.tsx`. The existing `rowBg`
position colouring is unchanged; the legend gains a one-line note distinguishing colour (current
position) from badge (clinched).

## Alternatives considered

- **Full global enumeration** — exact but infeasible early (3^(remaining)); rejected.
- **Gate global enumeration on a small remaining-match count** — still expensive at the boundary
  and would miss best-third clinches that resolve while several matches remain; rejected in favour
  of the always-available bounded method.
