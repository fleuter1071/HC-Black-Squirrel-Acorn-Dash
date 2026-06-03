# Project Memory

Session notes will be appended here as the game evolves.

## 2026-06-02  - Hazard polish, gameplay simplification, mobile fixes, and production push

- Date/time
  - 2026-06-02, America/New_York.
- Feature name, work name, description, and value provided
  - Polished hazard visuals so students, bikes, and the golf cart are easier to recognize while moving.
  - Simplified gameplay flow by removing timed notebook mini quests and keeping the notebook focused on campus guidance and discovery notes.
  - Fixed mobile duck pond rendering by preserving the mobile camera transform during atmosphere drawing.
  - Zoomed mobile gameplay out by about 20% so more of campus is visible.
  - Committed and pushed production branch update: `c2b09fc` (`Polish hazards and simplify gameplay flow`).
- Files changed
  - `script.js`
  - `PROJECT_MEMORY.md`
- Technical Architecture changes or key technical decisions made
  - Split hazard drawing into focused helper functions: `drawStudentHazard`, `drawBikeHazard`, and `drawCartHazard`.
  - Removed active mission state, mission templates, mission timers, mission bonuses, mission completion flow, and mission sound entry.
  - Kept existing notebook DOM ids (`missionTitle`, `missionText`) to avoid unnecessary HTML/CSS churn, but repurposed behavior toward campus guidance only.
  - Added `FIRST_GOLDEN_ACORN_AT` and `FIRST_POWERUP_AT` tuning constants near the top of `script.js`.
  - Replaced `ctx.setTransform(1,0,0,1,0,0)` in `drawAtmosphere` with per-leaf `ctx.save()` / `ctx.restore()` so world-space drawing remains correct on mobile.
- Assumptions
  - Production is connected to `origin/main`.
  - The intended product direction is a simpler, casual reunion game: follow the acorn trail, dodge hazards, find secrets, and grab simple bonuses.
  - The notebook should act as a campus guide rather than a timed quest system.
- Known limitations
  - Visual browser QA was limited because the in-app browser helper hit a Windows sandbox startup issue during this session.
  - Mobile changes were syntax-verified but should still be manually checked on a real phone for framing, duck visibility, and touch comfort.
  - Existing DOM ids still use mission-oriented names even though the feature now behaves as a notebook/campus guide.
- Key learnings that you can bring with you to future sessions
  - Canvas transform resets can break mobile camera rendering; preserve transforms with `save` / `restore` inside drawing helpers.
  - For this game, clarity beats feature density. Removing timed notebook quests reduced attention competition without removing the core fun.
  - Gameplay-significant visuals should be upgraded first: hazards, pickups, player, then landmarks.
  - Keep tuning constants near the top of `script.js` per repo guidance.
- Remaining TODOs
  - Manually QA mobile gameplay on a real device or browser emulator.
  - Continue visual upgrades with powerups next: pancake, leaf, and Honor Code scroll.
  - Consider renaming notebook DOM ids in a future cleanup if broader HTML/CSS edits are already happening.
- Next steps
  - Run a mobile QA pass focused on viewport framing, duck pond visibility, hazard readability, and simplified notebook clarity.
  - Implement the powerup visual upgrade pass as a visual-only change in `drawPowerup`.
