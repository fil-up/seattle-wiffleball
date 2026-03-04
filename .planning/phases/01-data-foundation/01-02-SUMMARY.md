---
phase: 01-data-foundation
plan: 02
subsystem: api
tags: [google-sheets, gviz, caching, api-routes, nextjs, stale-while-revalidate]

requires:
  - phase: 01-01
    provides: Clean codebase with SPREADSHEET_ID env var and stubbed API routes
provides:
  - Shared gviz fetch/parse/cache utility (sheets.ts)
  - 7 fully functional API routes serving Google Sheets data
  - { data, stale } JSON envelope contract for all routes
  - 30-second in-memory cache with stale-while-revalidate
affects: [01-03, 02-01, 02-02, 02-03, 03-01, 03-02, 03-03]

tech-stack:
  added: []
  patterns: [shared data utility, gviz JSONP regex parsing, stale-while-revalidate cache, { data stale } API envelope]

key-files:
  created: [src/lib/sheets.ts, src/app/api/standings/route.ts]
  modified: [src/app/api/teams/route.ts, src/app/api/players/route.ts, src/app/api/players/[id]/route.ts, src/app/api/teams/[id]/route.ts, src/app/api/stats/route.ts, src/app/api/leaderboards/route.ts]

key-decisions:
  - "Regex-based gviz JSONP parsing instead of fragile substring(47) magic number"
  - "Cache key format is sheet!range to distinguish split ranges within the same tab"
  - "All API routes return { data, stale } envelope for uniform client consumption"
  - "force-dynamic on teams route to prevent stale static generation"

patterns-established:
  - "All Google Sheets data access goes through fetchSheet() from @/lib/sheets"
  - "Transform functions receive (rows, cols) and return typed data shapes"
  - "Cell extraction helpers (cellValue, cellString, cellNumber, cellFloat) for safe gviz cell access"
  - "API routes catch errors and return 500 with { error } shape"

duration: 10min
completed: 2026-03-03
---

# Phase 1 Plan 2: Build Sheets Utility & Rewrite API Routes Summary

**Centralized Google Sheets data pipeline via shared gviz utility with regex parsing, 30s TTL cache, stale-while-revalidate, and 7 API routes returning { data, stale } envelope**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-03T20:45:00Z
- **Completed:** 2026-03-03T20:55:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Built `src/lib/sheets.ts` — single module for all Google Sheets data access with gviz URL construction, JSONP regex parsing, in-memory cache (30s TTL), and stale-while-revalidate on fetch failure
- Exported `fetchSheet<T>()` generic with transform function pattern and `{ data, stale }` return shape
- Exported cell helpers (`cellValue`, `cellString`, `cellNumber`, `cellFloat`) for safe gviz cell extraction
- Refactored `/api/teams` to use `fetchSheet`, removing hardcoded spreadsheet ID and `substring(47)` parsing
- Rewrote 5 stubbed routes (players, players/[id], teams/[id], stats, leaderboards) with full Google Sheets implementations
- Created new `/api/standings` route with yearly and all-time scopes
- All 7 routes import from `@/lib/sheets` — zero direct Google Sheets URLs in any route file

## Task Commits

Each task was committed atomically:

1. **Task 1: Build shared Google Sheets utility** - `4b74761` (feat)
2. **Task 2: Rewrite all API routes to use shared sheets utility** - `2ac418c` (feat)

## Files Created/Modified
- `src/lib/sheets.ts` - Shared gviz fetch, parse, cache utility with cell helpers (131 lines)
- `src/app/api/teams/route.ts` - Refactored to use fetchSheet with force-dynamic
- `src/app/api/players/route.ts` - Full rewrite with hitting/pitching yearly/totals support
- `src/app/api/players/[id]/route.ts` - Player detail with parallel hitting + pitching fetch
- `src/app/api/teams/[id]/route.ts` - Team detail with parallel team info + standings fetch
- `src/app/api/standings/route.ts` - New route with yearly and all-time standings
- `src/app/api/stats/route.ts` - Stats with server-side sort, filter, qualify, and limit
- `src/app/api/leaderboards/route.ts` - Leaderboards with all-time aggregates and minSeasons

## Decisions Made
- Used regex-based JSONP parsing (`google.visualization.Query.setResponse(...)`) instead of `substring(47)` — more robust against changes in gviz response format
- Cache key uses `${sheet}!${range}` format to correctly distinguish split ranges within the same tab (e.g., IH aggregates vs IH yearly)
- Standardized on `{ data, stale }` envelope for all API routes — establishes the contract for Phase 1 Plan 3 client migration and Phase 2+ downstream consumption
- Added `force-dynamic` to teams route to prevent Next.js from pre-rendering it as static during build

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed teams route being statically generated**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** `/api/teams` route was marked as ○ (Static) by Next.js because it doesn't use `request.url`, causing it to be pre-rendered at build time with potentially stale data
- **Fix:** Added `export const dynamic = 'force-dynamic'` to ensure the route fetches fresh data on every request
- **Files modified:** src/app/api/teams/route.ts
- **Verification:** Build succeeds, route serves dynamic data
- **Committed in:** 2ac418c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor fix to ensure correct runtime behavior. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 7 API routes are functional and serve real data from Google Sheets
- `{ data, stale }` envelope is established for Plan 01-03 client migration
- `sheets.ts` utility ready for Phase 2 header-based column mapping enhancement
- Build passes cleanly with all routes correctly marked as dynamic

---
*Phase: 01-data-foundation*
*Completed: 2026-03-03*
