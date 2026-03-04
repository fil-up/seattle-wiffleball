---
phase: 02-stats-engine
plan: 01
subsystem: api
tags: [google-sheets, gviz, transforms, typescript, column-mapping]

requires:
  - phase: 01-data-foundation
    provides: fetchSheet with gviz parsing, caching, {data, stale} envelope
provides:
  - buildColumnMap and colIdx utilities for header-based column lookup
  - 4 centralized transform functions (YearlyHitting, TotalsHitting, YearlyPitching, TotalsPitching)
  - 4 TypeScript row interfaces for type-safe stat data
  - All API routes using centralized transforms from sheets.ts
affects: [02-stats-engine plans 02 and 03, 03-core-pages leaderboards]

tech-stack:
  added: []
  patterns:
    - "Header-based column mapping with case-insensitive lookup and fallback indices"
    - "Centralized transforms in sheets.ts imported by all API routes"

key-files:
  created: []
  modified:
    - src/lib/sheets.ts
    - src/app/api/players/route.ts
    - src/app/api/players/[id]/route.ts
    - src/app/api/stats/route.ts
    - src/app/api/leaderboards/route.ts

key-decisions:
  - "Branch-specific fetchSheet calls instead of union-typed transform variable for TypeScript type narrowing"
  - "Case-insensitive header matching via toLowerCase in buildColumnMap"
  - "Fallback indices match existing hardcoded values for zero-change behavior when headers are absent"

patterns-established:
  - "Header-based column mapping: buildColumnMap(cols) + colIdx(cm, header, fallback) for all sheet data access"
  - "Centralized transform pattern: all stat transforms live in sheets.ts, API routes import and pass directly to fetchSheet"

duration: 5min
completed: 2026-03-04
---

# Phase 2 Plan 1: Centralize Transforms Summary

**12 duplicated transform functions consolidated into 4 centralized, header-mapped transforms in sheets.ts with TypeScript interfaces**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-04T13:02:20Z
- **Completed:** 2026-03-04T13:06:59Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Centralized all stat transform functions into src/lib/sheets.ts — single change point for column mapping
- Added buildColumnMap and colIdx utilities for case-insensitive header-based column lookup with fallback indices
- Exported 4 TypeScript row interfaces for type-safe stat data across the codebase
- Removed 490 lines of duplicated transform code from 4 API route files

## Task Commits

Each task was committed atomically:

1. **Task 1: Add header-based column mapping utilities and centralized transforms to sheets.ts** - `18089bd` (feat)
2. **Task 2: Update all API routes to use centralized transforms from sheets.ts** - `5abef14` (refactor)

## Files Created/Modified
- `src/lib/sheets.ts` - Added buildColumnMap, colIdx, 4 interfaces, 4 transform functions (+283 lines)
- `src/app/api/players/route.ts` - Deleted 4 local transforms, import from sheets.ts
- `src/app/api/players/[id]/route.ts` - Deleted 2 local transforms, import from sheets.ts
- `src/app/api/stats/route.ts` - Deleted 2 local transforms, import from sheets.ts
- `src/app/api/leaderboards/route.ts` - Deleted 4 local transforms, import from sheets.ts

## Decisions Made
- Used branch-specific fetchSheet calls (ternary per type/scope) instead of a union-typed transform variable — avoids TypeScript generic inference issues with incompatible return types
- Header names in colIdx calls use lowercase inferred names (e.g., 'first', 'last', 'year', 'g', 'pa') — actual gviz header labels should be verified on first live run and adjusted if needed
- Fallback indices exactly match the previously hardcoded values, ensuring zero behavior change when headers are absent or empty

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript union type error with fetchSheet generic**
- **Found during:** Task 2 (updating API routes)
- **Issue:** Assigning a union of transform functions (`transformTotalsHitting | transformTotalsPitching`) to a variable and passing it to `fetchSheet` caused TypeScript to fail inference — the generic `T` couldn't resolve across incompatible return types
- **Fix:** Split into branch-specific fetchSheet calls using ternary expressions so TypeScript infers the correct generic per branch
- **Files modified:** players/route.ts, stats/route.ts, leaderboards/route.ts
- **Verification:** `npm run build` succeeds with zero type errors
- **Committed in:** 5abef14 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor typing adjustment. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Centralized transforms ready for Plan 02-02 (stats page bug fixes) and Plan 02-03 (filters/qualifiers)
- Header labels should be verified against live gviz response on first run — colIdx fallback indices ensure correctness even without header discovery
- STAT-02 (hitting totals sheet reference) confirmed correct: IH sheet with totals column layout at A1:AP600

---
*Phase: 02-stats-engine*
*Completed: 2026-03-04*
