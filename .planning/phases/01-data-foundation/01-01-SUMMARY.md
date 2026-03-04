---
phase: 01-data-foundation
plan: 01
subsystem: infra
tags: [prisma, sqlite, env-vars, cleanup, google-sheets]

requires:
  - phase: none
    provides: first plan in project
provides:
  - Clean codebase with zero Prisma/SQLite artifacts
  - Centralized SPREADSHEET_ID environment variable
  - Stubbed API routes ready for Google Sheets rewrite
affects: [01-02, 01-03, 06-01]

tech-stack:
  added: []
  removed: [@prisma/client, prisma, googleapis, axios, sheetrock, graceful-fs, ts-node]
  patterns: [server-only env vars, 503 migration stubs]

key-files:
  created: [.env.local, .env.example]
  modified: [package.json, src/app/api/players/route.ts, src/app/api/players/[id]/route.ts, src/app/api/teams/[id]/route.ts, src/app/api/stats/route.ts, src/app/api/leaderboards/route.ts]
  deleted: [prisma/schema.prisma, prisma/dev.db, src/lib/prisma.ts, scripts/import-data.ts, src/app/api/admin/import/route.ts]

key-decisions:
  - "Use SPREADSHEET_ID (not NEXT_PUBLIC_) to keep sheet ID server-side only"
  - "Stub routes with 503 instead of deleting them to preserve route structure for Plan 01-02"

patterns-established:
  - "Environment variables for external service config go in .env.local with .env.example template"
  - "Migration stubs return 503 with descriptive error message"

duration: 20min
completed: 2026-03-03
---

# Phase 1 Plan 1: Remove Prisma/SQLite & Centralize Config Summary

**Removed all Prisma/SQLite artifacts (schema, DB, client, import script, 7 packages), stubbed 5 API routes with 503 migration responses, and centralized spreadsheet ID in SPREADSHEET_ID env var**

## Performance

- **Duration:** 20 min
- **Started:** 2026-03-03T20:15:06Z
- **Completed:** 2026-03-03T20:34:42Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Eliminated entire Prisma/SQLite data path (schema, dev.db, client singleton, import script, admin endpoint)
- Uninstalled 7 unused packages: @prisma/client, prisma, googleapis, axios, sheetrock, graceful-fs, ts-node
- Created .env.local with SPREADSHEET_ID and .env.example template for developers
- Stubbed 5 API routes (players, players/[id], teams/[id], stats, leaderboards) with 503 responses
- Cleaned package.json of 3 Prisma-related scripts (prisma:generate, prisma:push, import)
- Project builds cleanly with zero Prisma remnants

## Task Commits

Each task was committed atomically:

1. **Task 1: Create environment files for spreadsheet configuration** - `91aba4d` (chore)
2. **Task 2: Remove all Prisma/SQLite artifacts and unused dependencies** - `9826a8d` (feat)

## Files Created/Modified
- `.env.local` - SPREADSHEET_ID environment variable (gitignored)
- `.env.example` - Template documenting required env vars
- `package.json` - Removed 7 dependencies and 3 Prisma scripts
- `package-lock.json` - Updated after dependency removal
- `src/app/api/players/route.ts` - Stubbed with 503
- `src/app/api/players/[id]/route.ts` - Stubbed with 503
- `src/app/api/teams/[id]/route.ts` - Stubbed with 503
- `src/app/api/stats/route.ts` - Stubbed with 503
- `src/app/api/leaderboards/route.ts` - Stubbed with 503

### Files Deleted
- `prisma/schema.prisma` - Prisma schema (6 models)
- `prisma/dev.db` - SQLite database file (1.2MB)
- `src/lib/prisma.ts` - Prisma client singleton
- `scripts/import-data.ts` - Google Sheets → Prisma import script
- `src/app/api/admin/import/route.ts` - Admin import trigger endpoint

## Decisions Made
- Used `SPREADSHEET_ID` (not `NEXT_PUBLIC_SPREADSHEET_ID`) because all data fetching goes through server-side API routes — the sheet ID never needs browser exposure
- Stubbed dependent routes with 503 rather than deleting them, preserving the route structure for Plan 01-02 to rewrite with Google Sheets implementations

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unclosed div in leaderboards page**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** `src/app/leaderboards/page.tsx` had two opening `<div>` tags but only one closing `</div>`, causing SWC compilation failure
- **Fix:** Added missing `</div>` to close the outer wrapper div
- **Files modified:** src/app/leaderboards/page.tsx
- **Verification:** Build passes
- **Committed in:** 9826a8d (Task 2 commit)

**2. [Rule 1 - Bug] Fixed implicit any types across 4 component files**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** Multiple `.filter(row => ...)` and `.map(item => ...)` callbacks had implicit `any` parameter types, failing strict TypeScript compilation
- **Fix:** Added explicit `(row: any)` / `(item: any)` type annotations and `as string[]` assertions for Set spreads
- **Files modified:** src/app/stats/players/page.tsx, src/components/PlayerBattingData.tsx, src/components/PlayerPitchingData.tsx, src/components/SheetrockStandings.tsx
- **Verification:** Build passes with zero type errors
- **Committed in:** 9826a8d (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both were pre-existing build errors surfaced during verification. Required for build to pass. No scope creep.

## Issues Encountered
- OneDrive sync interference caused `.next` cache corruption on Windows (EINVAL readlink errors). Resolved by deleting `.next` directory before rebuilding. This is a known issue with Next.js on OneDrive-synced directories.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Codebase is clean of all Prisma/SQLite artifacts
- SPREADSHEET_ID env var is ready for the shared sheets.ts utility in Plan 01-02
- All 5 API routes are stubbed and ready for rewrite with Google Sheets data
- Build passes cleanly

---
*Phase: 01-data-foundation*
*Completed: 2026-03-03*
