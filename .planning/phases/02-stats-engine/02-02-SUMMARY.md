---
phase: 02-stats-engine
plan: 02
subsystem: ui
tags: [react, useMemo, useEffect, data-flow, filtering, stats]

requires:
  - phase: 02-01
    provides: Centralized transform functions with header-based column mapping in sheets.ts
provides:
  - Correct single-fetch data flow for stats page
  - Client-side filtering via useMemo (year, team, qualifier, search)
  - Dynamic qualifier threshold computation
  - Team filter dropdown in StatsFilter component
affects: [02-03, 05-01]

tech-stack:
  added: []
  patterns:
    - "allData + useMemo pattern: store full API response, derive display data via useMemo"
    - "Dynamic qualifier: floor(multiplier * avgGP) computed from per-year player data"

key-files:
  created: []
  modified:
    - src/app/stats/players/page.tsx
    - src/components/StatsFilter.tsx

key-decisions:
  - "Year list derived from unfiltered allData (fixes circular dependency bug)"
  - "Single useEffect for fetching, triggered by [tab, scope] only"
  - "Team list scoped to selected year — shows teams that played that season"
  - "Qualifier threshold: floor(3.1 * avgGP) PA for hitting, floor(1 * avgGP) IP for pitching"

patterns-established:
  - "allData pattern: full unfiltered API response in state, all filtering via useMemo"
  - "Filter reset cascade: scope change resets year+team, tab change resets team"

duration: 5min
completed: 2026-03-04
---

# Phase 2 Plan 2: Fix Stats Page Data Flow Summary

**Single-fetch data architecture with allData state, useMemo-derived filtering (year/team/qualifier/search), dynamic qualifier thresholds, and team filter dropdown**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-04
- **Completed:** 2026-03-04
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced two competing useEffects with a single fetch effect triggered by [tab, scope]
- Fixed year dropdown circular dependency — year list now derived from full unfiltered allData
- Implemented dynamic qualifier thresholds: floor(3.1 * avgGP) PA for hitting, floor(1 * avgGP) IP for pitching
- Added team filter dropdown to StatsFilter with year-scoped team list
- All client-side filtering (year, team, qualifier, search) via useMemo displayData
- Scope changes properly reset year and team filters
- Added empty state message when filters produce no results
- Preserved totals view Min PA/IP input behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite stats page data flow with correct state management** - `3ae1c06` (fix)
2. **Task 2: Add team filter dropdown to StatsFilter component** - `6c0c52c` (feat)

## Files Created/Modified
- `src/app/stats/players/page.tsx` - Rewrote data flow: allData state, single fetch, useMemo filtering, dynamic qualifier
- `src/components/StatsFilter.tsx` - Added teams/selectedTeam/onTeamChange props with team dropdown

## Decisions Made
- Year list derived from unfiltered allData via useMemo — fixes the circular dependency where years collapsed to a single option after filtering
- Single useEffect for data fetching triggered by [tab, scope] only — eliminates double-fetch on tab change
- Team list scoped to selected year — only shows teams that actually played in that season
- Dynamic qualifier threshold computed client-side from player data per year — no extra API call needed
- Team filter props made optional in StatsFilter interface for backward compatibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Data flow is correct and all filtering works via useMemo
- Ready for 02-03-PLAN.md (smart sort direction per column, fix default sorts)
- initialSort still uses "ops" for hitting (should be "wrcPlus") — addressed in Plan 02-03

---
*Phase: 02-stats-engine*
*Completed: 2026-03-04*
