## 1. Knockout schedule data

- [x] 1.1 Create `lib/engine/knockoutSchedule.ts` with an entry per match M73–M104 (excluding M103):
  `{ round, feedsFrom: [matchIdA, matchIdB] | null, venueCity, date, kickoffTime }`
- [x] 1.2 Populate R32 (M73–M88) with `feedsFrom: null` and the official host city, date, and time
- [x] 1.3 Populate R16 (M89–96), QF (M97–100), SF (M101–102), Final (M104) with the correct `feedsFrom`
  pairs and venue/date/time — sourced and verified from the official FIFA 2026 schedule
- [x] 1.4 Add a self-consistency check (every non-R32 match references two valid earlier matches; the tree
  resolves to a single M104 root)

## 2. Types

- [x] 2.1 Add `{ kind: 'winner-of'; matchId: string }` to `BracketTeam` in `lib/types.ts`
- [x] 2.2 Add `round`, `venueCity`, `date`, and `kickoffTime` to `BracketMatchup` (or a parallel
  schedule-keyed lookup the engine attaches)

## 3. Bracket engine

- [x] 3.1 Keep existing R32 slotting (teams + allocation table) in `lib/engine/bracket.ts`
- [x] 3.2 Emit R16/QF/SF/Final matchups built from `knockoutSchedule.feedsFrom` as `winner-of` slots
- [x] 3.3 Enrich every emitted matchup with `round`, `venueCity`, `date`, `kickoffTime` from the schedule

## 4. Tree UI

- [x] 4.1 Rebuild `app/components/Bracket.tsx` as round columns (R32 | R16 | QF | SF | Final)
- [x] 4.2 Position each later-round card relative to the two it feeds from, with simple connectors
- [x] 4.3 Render each card: matchId, both slots (team / `Wxx` / TBD — reuse tied-pending-ranking handling),
  host city, and date over time (`JUN 30` / `3:30PM`)
- [x] 4.4 Keep the existing snapshot label and stale-data indicator

## 5. Verification

- [x] 5.1 Run `npm run lint`, `npx tsc --noEmit`, and `npm run test`; all green
- [x] 5.2 (If the `hardening` tests have landed) add/extend a bracket test asserting the tree structure
  (feeds resolve to one Final; winner-of slots present in R16+)
- [x] 5.3 `npm run dev` → load `/bracket`; confirm a connected tree R32 → Final, R32 filled with teams,
  later rounds showing `Wxx`, and every card showing city + `MON DD` + kickoff time
