---
"world-cup-26": minor
---

Add `✓ THROUGH` / `✗ OUT` clinch badges to the group standings tables and the best-thirds table. Badges appear only once a team is **mathematically** guaranteed into the Round of 32 (clinched top-2 or a clinched best-third spot) or eliminated — distinct from, and shown alongside, the existing position-based row colouring. A new conservative bounded engine (`lib/engine/qualification.ts`) reuses the group-outcome enumeration and bounds the cross-group best-thirds race, so it never reports a false clinch and treats in-progress matches as undecided.
