---
phase: 01-data-foundation
plan: 03
subsystem: ui
tags: [api-routes, fetch, stale-data-banner, client-migration, nextjs]

requires:
  - phase: 01-02
    provides: 7 API routes returning { data, stale } envelope from Google Sheets
provides:
  - All client components fetching from internal API routes instead of Google Sheets directly
  - Stale data banners on all data-displaying pages and components
  - Zero client-side Google Sheets fetches in entire codebase
  - teams/[id] page adapted to Sheets-based data shape
affects: [02-01, 02-02, 02-03, 03-01, 03-02, 03-03, 05-01, 06-03]

tech-stack:
  added: []
  patterns: [{ data, stale } envelope consumption, stale data banner component pattern, API-first data flow]

key-files:
  modified:
    - src/app/stats/players/page.tsx
    - src/app/stats/teams/[team]/page.tsx
    - src/components/PlayerBattingData.tsx
    - src/components/PlayerPitchingData.tsx
    - src/components/SheetrockStandings.tsx
    - src/components/TeamMapping.tsx
    - src/components/StandingsDebug.tsx
    - src/app/teams/page.tsx
    - src/app/teams/[id]/page.tsx
    - src/app/stats/teams/page.tsx
    - src/app/leaderboards/page.tsx

key-decisions:
  - "Removed roster table from teams/[id] page — Sheets-based route doesn't provide player-team relationships (will be rebuilt in Phase 2)"
  - "Qualifier filter for batting uses wrcPlus > 0 instead of string-based 'Non-qualifier' check"
  - "Stale banner text varies slightly: 'trouble reaching' on main stats page, 'while we reconnect' on components"

patterns-established:
  - "All data-displaying components fetch from /api/* routes, never from Google Sheets directly"
  - "Every component that fetches data tracks stale state and renders a yellow banner when stale"
  - "API responses are always destructured as { data, stale } before use"

duration: 10min
completed: 2026-03-03
---

# Phase 1 Plan 3: Migrate Client Components to API Routes Summary

**All 11 data-fetching files migrated from direct Google Sheets gviz fetches to internal /api/* routes with { data, stale } envelope parsing and stale data banners**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-03T20:51:00Z
- **Completed:** 2026-03-03T21:01:00Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Migrated 2 stats pages (players, teams/[team]) from 6 direct Google Sheets fetches to API route calls
- Migrated 5 standalone components (PlayerBattingData, PlayerPitchingData, SheetrockStandings, TeamMapping, StandingsDebug) to use API routes
- Updated 4 remaining pages (teams, teams/[id], stats/teams, leaderboards) to parse { data, stale } envelope
- Added stale data banners to all 11 data-displaying files
- Eliminated all client-side Google Sheets URLs — the only `docs.google.com` reference is in the server-side `sheets.ts` utility
- Fixed STAT-02 bug: hitting totals now correctly fetch from IH tab (not IP) via the API route
- Adapted teams/[id] page to Sheets-based data shape (team info + standings), removed Prisma-dependent roster section

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate stats pages to use API routes** - `78b8e6d` (feat)
2. **Task 2: Migrate standalone data components to use API routes** - `788f9f1` (feat)
3. **Task 3: Update remaining pages to parse { data, stale } API responses** - `fc2fca6` (feat)

## Files Created/Modified
- `src/app/stats/players/page.tsx` - Replaced 4 gviz fetches with /api/players calls
- `src/app/stats/teams/[team]/page.tsx` - Replaced 2 gviz fetches with /api/teams + /api/standings
- `src/components/PlayerBattingData.tsx` - Fetches from /api/players?type=hitting&scope=yearly
- `src/components/PlayerPitchingData.tsx` - Fetches from /api/players?type=pitching&scope=yearly
- `src/components/SheetrockStandings.tsx` - Fetches from /api/standings (yearly + alltime)
- `src/components/TeamMapping.tsx` - Fetches from /api/teams
- `src/components/StandingsDebug.tsx` - Fetches from /api/standings with scope param
- `src/app/teams/page.tsx` - Unwraps { data, stale } from /api/teams
- `src/app/teams/[id]/page.tsx` - Adapted to Sheets-based shape (team + standings)
- `src/app/stats/teams/page.tsx` - Unwraps { data, stale } from /api/teams
- `src/app/leaderboards/page.tsx` - Unwraps { data, stale } from /api/stats and /api/leaderboards

## Decisions Made
- Removed the roster table from `teams/[id]/page.tsx` — the Sheets-based API route doesn't provide player-team relationships with nested stats. This will be rebuilt in Phase 2 when player-team relationships are properly modeled.
- Changed qualifier filtering from string-based `'Non-qualifier'` check to numeric `wrcPlus > 0` (for hitting) and `era > 0` (for pitching) since the API returns numbers, not display strings.
- Kept stale banner as inline JSX in each component rather than extracting to shared component — extraction can happen during Phase 5 polish.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 is complete: all data flows through Google Sheets -> sheets.ts -> API routes -> client components
- Zero direct Google Sheets fetches from any client code
- Zero hardcoded spreadsheet IDs in source code
- Zero uses of fragile substring(47) parsing
- Build passes cleanly
- Ready for Phase 2: Stats Engine (fix stat bugs, header-based column mapping, filter rebuilds)

---
*Phase: 01-data-foundation*
*Completed: 2026-03-03*
