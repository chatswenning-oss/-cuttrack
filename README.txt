CutTrack v46 — Stability Rebuild Phase 1

Built from the last known interactive baseline (v42), not from broken v45.

This build intentionally makes only low-risk core fixes:
- Preserves all v42 controls and editing handlers.
- Preserves Goals and reminder presets.
- Preserves Today design and background.
- Fixes Progress target-value reading.
- Uses one delegated click handler for the 42-day calendar grid.
- Removes delayed v40 Progress rendering.
- Tapping the Today/date header opens the in-app Progress calendar.
- Keeps existing cuttrack_v9/localStorage data compatible.

Do not deploy old all.js/background-v15.jpg/background.jpg files with this build.
