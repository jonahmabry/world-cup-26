---
"world-cup-26": minor
---

Add `/schedule` page showing all 72 group-stage fixtures and knockout projections, organized by phase (Matchday 1–3, R32–Final) with a ±1 sliding-window phase nav. Group rows show live scores or kickoff times; knockout rows show projected matchups with clinch-based R32 slot auto-fill. Adds `PhaseKey`, `Phase`, and `GroupFixture` types, a 72-fixture static group schedule, group-position clinch detection via exhaustive `computeGroupStandings` enumeration, ISO dates on all knockout schedule entries, and `matches` on the pipeline snapshot.
