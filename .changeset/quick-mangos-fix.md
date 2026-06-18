---
"world-cup-26": patch
---

Fix a backfill date-boundary bug that permanently skipped late-night matches. ESPN buckets matches by US-Eastern date while the watermark advanced by UTC date, so late kickoffs (~00:00–05:00 UTC) were orphaned. The sweep now starts `BACKFILL_LOOKBACK_DAYS` before the watermark so the earlier Eastern date label is re-queried, and the 6 affected finished matches are backfilled. (#18)
