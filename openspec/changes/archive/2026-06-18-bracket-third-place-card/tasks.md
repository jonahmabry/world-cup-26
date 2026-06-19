## 1. Types

- [x] 1.1 Add `'ThirdPlace'` to the `KnockoutRound` union in `lib/types.ts`
- [x] 1.2 Add `{ kind: 'loser-of'; matchId: string }` to the `BracketTeam` union in `lib/types.ts`

## 2. Knockout schedule data

- [x] 2.1 Add an `M103` entry to `KNOCKOUT_SCHEDULE` in `lib/engine/knockoutSchedule.ts`:
  `{ round: 'ThirdPlace', slot: 1, feedsFrom: ['M101', 'M102'], venueCity, date, kickoffTime }`
- [x] 2.2 Set M103's `venueCity` / `date` / `kickoffTime` from the official FIFA 2026 schedule
  (intended: Miami, ~JUL 18 — confirm exact city and CDT kickoff before committing)
- [x] 2.3 Extend `validateSchedule()` to assert M103 exists and is a leaf (no match lists M103 in
  `feedsFrom`), mirroring the existing M104 single-root check; confirm the existing `feedsFrom`
  reference check covers M103 → M101/M102

## 3. Bracket engine

- [x] 3.1 In `lib/engine/bracket.ts`, narrow the later-rounds builder so it skips the third-place round
  (`entry.feedsFrom !== null && entry.round !== 'ThirdPlace'`), keeping every other slot as `winner-of`
- [x] 3.2 Append M103 as a separate matchup with both slots built as `loser-of` (`home: loser-of M101`,
  `away: loser-of M102`, labels `Loser of M101` / `Loser of M102`), enriched with M103's schedule
  metadata
- [x] 3.3 Confirm `computeBracket` now returns 32 matchups and that `loser-of` appears only on M103

## 4. UI

- [x] 4.1 Add a `loser-of` branch to `TeamSlot` in `app/components/Bracket.tsx` rendering
  `L{matchId.slice(1)}` (e.g. `L101`), styled like the existing `winner-of` branch
- [x] 4.2 Give the bracket-columns container `position: relative` and render a single absolutely
  positioned `MatchCard` for the `ThirdPlace` matchup in the lower-right (x-aligned with the Final
  column, y-aligned with M100), inside the `overflow-x-auto` viewport, with a small "Third-place match"
  caption below it and no connector arms
- [x] 4.3 Select M103 out of `matchups` by `round === 'ThirdPlace'` (outside `ROUND_DEFS.map`); confirm
  `ThirdPlace` is not added to `ROUND_DEFS` so it never renders as a tree column

## 5. Verification

- [x] 5.1 Update `lib/engine/bracket.test.ts`: assert 32 matchups (was 31) and that M103 is on the
  `ThirdPlace` round with `loser-of` M101 / M102 slots; add/extend a `knockoutSchedule` test for the
  M103 leaf assertion
- [x] 5.2 Run `npm run lint`, `npx tsc --noEmit`, and `npm run test`; all green
- [x] 5.3 `npm run dev` → load the bracket; confirm a detached third-place card at the bottom-right
  showing `L101` / `L102` and M103's city + `MON DD` + kickoff time, with no connectors and the R32 →
  Final tree unchanged
