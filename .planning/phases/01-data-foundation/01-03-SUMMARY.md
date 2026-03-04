---
phase: 01-data-foundation
plan: 03
subsystem: ui
tags: [api-routes, client-migration, stale-data-banner, google-sheets-removal, data-envelope]

requires:
  - phase: 01-02
    provides: 7 API routes returning { data, stale } envelope, shared sheets.ts utility
provides:
  - All client components fetch from internal API routes (zero direct Google Sheets calls)
  - Stale data banners on every data-displaying page and component
  - teams/[id] page adapted to Sheets-based data shape (team info + standings)
  - Complete data pipeline: Google Sheets → sheets.ts (cache) → API routes → client components
affects: [02-01, 02-02, 02-03, 03-01, 03-02, 03-03, 05-01]

tech-stack:
  added: []
  patterns: [{ data stale } envelope consumption, stale data banner UX pattern, API-first data fetching]

key-files:
  created: []
  modified: [src/app/stats/players/page.tsx, src/app/stats/teams/[team]/page.tsx, src/components/PlayerBattingData.tsx, src/components/PlayerPitchingData.tsx, src/components/SheetrockStandings.tsx, src/components/TeamMapping.tsx, src/components/StandingsDebug.tsx, src/app/teams/page.tsx, src/app/teams/[id]/page.tsx, src/app/stats/teams/page.tsx, src/app/leaderboards/page.tsx]

key-decisions:
  - "All client data fetching goes through internal /api/* routes — zero browser-to-Google-Sheets requests"
  - "Stale data banner uses subtle yellow styling to indicate outdated data without blocking the UI"
  - "teams/[id] page roster section removed (Prisma shape gone) — deferred to Phase 2 for proper modeling"
  - "STAT-02 bug (wrong sheet for hitting totals) resolved automatically by routing through correct API endpoint"

patterns-established:
  - "Client components parse { data, stale } envelope from all API responses"
  - "Yellow stale-data banner placed above content, below headers/nav, in every data component"
  - "Error boundaries with retry buttons on data-fetching components"

duration: 10min
completed: 2026-03-03
---

# Phase 1 Plan 3: Migrate Client Components to API Routes Summary

**All 11 data-fetching pages/components migrated from direct Google Sheets gviz calls to internal API routes with { data, stale } envelope parsing and stale data banners**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-03T20:55:00Z
- **Completed:** 2026-03-03T21:05:00Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Migrated 2 stats pages (players, teams/[team]) from direct Google Sheets gviz URLs to `/api/players` and `/api/standings` routes
- Migrated 5 standalone components (PlayerBattingData, PlayerPitchingData, SheetrockStandings, TeamMapping, StandingsDebug) to use API routes with `{ data, stale }` parsing
- Updated 4 remaining pages (teams, teams/[id], stats/teams, leaderboards) to correctly parse `{ data, stale }` envelope
- Adapted teams/[id] page from Prisma shape to Sheets-based shape (team info + standings, roster deferred)
- Fixed STAT-02 bug (hitting totals fetching from wrong sheet) by routing through correct API endpoint
- Zero `docs.google.com` URLs remain in any client-side code
- Zero `substring(47)` parsing calls remain in any source file
- Zero hardcoded spreadsheet IDs in source code

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate stats pages to use API routes** - `78b8e6d` (feat)
2. **Task 2: Migrate standalone data components to use API routes** - `788f9f1` (feat)
3. **Task 3: Update remaining pages to parse { data, stale } API responses** - `fc2fca6` (feat)

## Files Created/Modified
- `src/app/stats/players/page.tsx` - Player stats page fetching from /api/players with scope/type params
- `src/app/stats/teams/[team]/page.tsx` - Team detail page fetching from /api/teams and /api/standings
- `src/components/PlayerBattingData.tsx` - Batting data component fetching from /api/players?type=hitting
- `src/components/PlayerPitchingData.tsx` - Pitching data component fetching from /api/players?type=pitching
- `src/components/SheetrockStandings.tsx` - Standings component fetching from /api/standings (yearly + alltime)
- `src/components/TeamMapping.tsx` - Team mapping component fetching from /api/teams
- `src/components/StandingsDebug.tsx` - Debug component fetching from /api/standings with scope selector
- `src/app/teams/page.tsx` - Teams index parsing { data, stale } from /api/teams
- `src/app/teams/[id]/page.tsx` - Team detail adapted to Sheets-based shape (team + standings)
- `src/app/stats/teams/page.tsx` - Stats teams page parsing { data, stale } from /api/teams
- `src/app/leaderboards/page.tsx` - Leaderboards parsing { data, stale } from /api/leaderboards and /api/stats

## Decisions Made
- Removed all direct Google Sheets gviz URLs from client-side code — all data flows through API routes
- Used consistent yellow stale-data banner pattern across all components and pages
- Removed teams/[id] roster section (was Prisma-dependent) — roster functionality deferred to Phase 2 where player-team relationships will be properly modeled
- STAT-02 bug fix came for free: migrating to `/api/players?type=hitting&scope=totals` automatically routes to the correct IH sheet

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 Data Foundation is fully complete — all 3 plans executed
- Every data-displaying page/component fetches through API routes
- The complete data pipeline is live: Google Sheets → sheets.ts (cache) → API routes → client components
- Ready for Phase 2 (Stats Engine) to build on this foundation with header-based column mapping and filter fixes
- STAT-02 is already resolved — Phase 2 can verify and focus on remaining stat accuracy bugs

---
*Phase: 01-data-foundation*
*Completed: 2026-03-03*
