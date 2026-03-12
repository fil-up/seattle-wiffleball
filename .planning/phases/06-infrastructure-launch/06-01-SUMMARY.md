---
phase: 06-infrastructure-launch
plan: 01
subsystem: infra
tags: [nextjs, cleanup, refactor, debug-routes]

# Dependency graph
requires:
  - phase: 05-design-polish
    provides: completed UI polish with all production components in place
provides:
  - Deleted debug routes at /debug/player-data and /debug/team-mapping
  - Deleted debug-only components StandingsDebug and TeamMapping
  - StandingsTable component (renamed from SheetrockStandings) at src/components/StandingsTable.tsx
affects: [06-02, 06-03, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created:
    - src/components/StandingsTable.tsx
  modified:
    - src/app/stats/teams/page.tsx
  deleted:
    - src/app/debug/player-data/page.tsx
    - src/app/debug/team-mapping/page.tsx
    - src/components/StandingsDebug.tsx
    - src/components/TeamMapping.tsx
    - src/components/SheetrockStandings.tsx

key-decisions:
  - "Renamed SheetrockStandings to StandingsTable — legacy name referenced internal dev tool no longer in project"
  - "PlayerBattingData and PlayerPitchingData were intentionally preserved despite debug-sounding names — both are production components used in stats/teams/[team]"

patterns-established: []

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 6 Plan 01: Codebase Cleanup Summary

**Deleted 4 debug artifacts and renamed SheetrockStandings to StandingsTable, leaving a production-clean codebase with passing build**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T16:40:58Z
- **Completed:** 2026-03-12T16:43:48Z
- **Tasks:** 2
- **Files modified:** 6 (4 deleted, 1 created/renamed, 1 import updated)

## Accomplishments
- Removed debug route directory src/app/debug/ (2 pages) that exposed dev tooling at public URLs
- Deleted StandingsDebug.tsx and TeamMapping.tsx — components only used by the deleted debug pages
- Renamed SheetrockStandings.tsx to StandingsTable.tsx with component identifier updated to match
- Updated src/app/stats/teams/page.tsx import and JSX usage to StandingsTable
- Production build passes: 27/27 pages generated, zero TypeScript or ESLint errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete debug routes and debug-only components** - `7a4bf96` (chore)
2. **Task 2: Rename SheetrockStandings to StandingsTable and verify build** - `5dd6456` (refactor)

## Files Created/Modified
- `src/components/StandingsTable.tsx` - Renamed from SheetrockStandings; identical logic, updated component name
- `src/app/stats/teams/page.tsx` - Import and JSX updated from SheetrockStandings to StandingsTable
- `src/app/debug/player-data/page.tsx` - Deleted
- `src/app/debug/team-mapping/page.tsx` - Deleted
- `src/components/StandingsDebug.tsx` - Deleted
- `src/components/TeamMapping.tsx` - Deleted

## Decisions Made
- Renamed SheetrockStandings to StandingsTable — the old name referenced an internal scaffolding tool (Sheetrock) that is no longer part of the project; StandingsTable is a clear, intent-revealing name
- PlayerBattingData.tsx and PlayerPitchingData.tsx were preserved — despite names that sound debug-adjacent, they are production components consumed by src/app/stats/teams/[team]/page.tsx

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — the build output includes runtime-level "Error fetching" logs during static generation (API routes using `request.url` that bail out with DYNAMIC_SERVER_USAGE). These are pre-existing behavior from dynamic API routes, not errors introduced by this plan. All 27 pages generated successfully.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Codebase is clean of debug artifacts; ready for 06-02 (dependency audit) and 06-03 (deployment)
- No blockers

---
*Phase: 06-infrastructure-launch*
*Completed: 2026-03-12*
