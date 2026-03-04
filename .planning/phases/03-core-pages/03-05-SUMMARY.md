---
phase: 03-core-pages
plan: 05
subsystem: ui
tags: [nextjs, player-stats, leaderboards, career-stats, gap-closure]

requires:
  - phase: 01-data-foundation
    provides: API route /api/players/[id] with career hitting/pitching data
  - phase: 03-core-pages
    provides: LeaderboardPodium with player links, leaderboards page, team detail page
provides:
  - Player detail page at /stats/players/[id] with career hitting and pitching stats
  - Leaderboards defaults to most recent season instead of all-time
affects: [04-roster-links, 05-visual-polish]

tech-stack:
  added: []
  patterns:
    - "Player detail fetches from /api/players/[id] with useParams + useEffect"
    - "Plain HTML tables for simple career stat views (no StatsTable/TanStack)"

key-files:
  created:
    - src/app/stats/players/[id]/page.tsx
  modified:
    - src/app/leaderboards/page.tsx

key-decisions:
  - "Plain HTML tables instead of StatsTable component — simpler for static career display"
  - "Year default via empty string init + setYear in years-fetch useEffect — avoids stale closure issues"
  - "Guard leaderboard data fetch with if (!year) return to prevent fetch with empty year"

patterns-established:
  - "Player detail page pattern: useParams → fetch /api/players/[id] → conditional tables"

duration: 3min
completed: 2026-03-04
---

# Phase 3 Plan 5: Gap Closure Summary

**Player detail page with career hitting/pitching tables and leaderboards year default fix closing 3 verification gaps**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T15:23:26Z
- **Completed:** 2026-03-04T15:26:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Player detail page renders career hitting stats (18 columns) and pitching stats (16 columns) sorted by year descending
- All player links from LeaderboardPodium and team detail pages now resolve (no more 404s)
- Leaderboards defaults to most recent season on initial load; All-Time remains available
- 404 handling for invalid player IDs with user-friendly message

## Task Commits

Each task was committed atomically:

1. **Task 1: Create player detail page** - `6c7f2a5` (feat)
2. **Task 2: Fix leaderboards year default to current season** - `c81589f` (fix)

## Files Created/Modified
- `src/app/stats/players/[id]/page.tsx` - Player detail page with career hitting and pitching stats tables
- `src/app/leaderboards/page.tsx` - Fixed year default from 'all' to most recent season

## Decisions Made
- Used plain `<table>` elements instead of StatsTable component — career stats are a simple read-only display with no sorting/filtering needed
- Initialized year as empty string and set via useEffect after years fetch to avoid initial all-time fetch
- Added early return guard `if (!year) return` in leaderboard data useEffect to prevent fetching with empty year value

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added guard against empty year fetch**
- **Found during:** Task 2
- **Issue:** Initializing year as '' would trigger the leaderboard data useEffect with an empty year param, causing a wasteful/broken initial fetch
- **Fix:** Added `if (!year) return` at the top of the data-fetching useEffect
- **Files modified:** src/app/leaderboards/page.tsx
- **Verification:** Build passes, no double-fetch on load
- **Committed in:** c81589f (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for correct behavior. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 verification gaps from Phase 3 are now closed
- Player detail page resolves both player link gaps (leaderboards and team detail)
- Leaderboards year default gap resolved
- Ready for Phase 4

---
*Phase: 03-core-pages*
*Completed: 2026-03-04*
