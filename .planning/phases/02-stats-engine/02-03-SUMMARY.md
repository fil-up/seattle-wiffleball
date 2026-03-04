---
phase: 02-stats-engine
plan: 03
subsystem: ui
tags: [react, tanstack-table, sorting, sortDescFirst, stats]

requires:
  - phase: 02-02
    provides: Correct data flow with allData state and useMemo filtering
provides:
  - Smart per-column sort direction via sortDescFirst metadata
  - Correct default sorts (wRC+ desc for hitting, ERA asc for pitching)
  - Visual sort direction indicators on all sortable columns
  - 50-row page size for stats context
affects: [05-01]

tech-stack:
  added: []
  patterns:
    - "sortDescFirst on column defs: TanStack natively reads column.sortDescFirst for first-click direction"

key-files:
  created: []
  modified:
    - src/app/stats/players/page.tsx
    - src/components/StatsTable.tsx

key-decisions:
  - "Default hitting sort changed from OPS to wRC+ descending"
  - "ERA/WHIP/OPP AVG marked sortDescFirst: false; all other stats sortDescFirst: true"
  - "Unsorted columns show ⇅ indicator in gray; active sort shows ↑/↓"
  - "Page size set to 50 rows (up from TanStack default of 10)"

patterns-established:
  - "sortDescFirst metadata: every stat column carries its natural sort direction for first-click behavior"

duration: 5min
completed: 2026-03-04
---

# Phase 2 Plan 3: Smart Sort Direction & Default Sort Fix Summary

**Per-column sortDescFirst metadata on all stat columns, wRC+ default for hitting, ERA default for pitching, visual sort indicators, and 50-row page size**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-04
- **Completed:** 2026-03-04
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Every hitting column marked `sortDescFirst: true` (counting stats and rate stats where higher is better)
- Pitching rate stats ERA, WHIP, OPP AVG marked `sortDescFirst: false` (lower is better)
- Default hitting sort changed from OPS to wRC+ descending
- Default pitching sort remains ERA ascending
- Unsorted columns now show subtle ⇅ indicator for sortability cue
- Page size increased from 10 to 50 rows for better stats browsing
- TanStack natively respects `sortDescFirst` — no custom sort logic needed

## Task Commits

Each task was committed atomically:

1. **Task 1: Add smart sort direction to column definitions and fix sort defaults** - `4b16884` (feat)
2. **Task 2: Ensure StatsTable respects sortDescFirst and verify full integration** - `0169a96` (feat)

## Files Created/Modified
- `src/app/stats/players/page.tsx` - Added sortDescFirst to all columns, fixed default sort from OPS to wRC+, consistent indentation
- `src/components/StatsTable.tsx` - Added ⇅ unsorted indicator, increased page size to 50, sortDescFirst passes through natively

## Decisions Made
- Default hitting sort changed from OPS to wRC+ descending — wRC+ is the more comprehensive offensive metric
- ERA/WHIP/OPP AVG are the only three columns with `sortDescFirst: false` — these are rate stats where lower is better
- All other stats (counting stats + rate stats where higher is better like AVG/OBP/SLG) use `sortDescFirst: true`
- Unsorted indicator uses ⇅ character in `text-gray-300` for subtle visual cue without clutter
- Page size set to 50 — a full league season typically has fewer than 50 players per team, so most views fit in one page

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Phase 2 Completion

This was the final plan in Phase 2 (Stats Engine). All Phase 2 success criteria are now met:

1. **Switching year, team, and scope filters updates stats tables correctly** — fixed in 02-02
2. **All-time batting totals pull from IH sheet** — fixed in 02-01
3. **Adding/reordering columns in Sheets doesn't break parsing** — header-based mapping in 02-01
4. **Stats page displays sortable, filterable batting and pitching tables** — completed across 02-01 through 02-03
5. **Default hitting sort: wRC+ descending** — implemented in 02-03
6. **Default pitching sort: ERA ascending** — implemented in 02-03
7. **Smart sort direction per column** — implemented in 02-03
8. **Sticky first 2 columns** — preserved from existing implementation

## Next Phase Readiness
- Phase 2 complete — stats engine delivers accurate, sortable, filterable batting and pitching tables
- Ready for Phase 3 (Core Pages): Home, Teams, Leaderboards, and media embeds
- Stats visual polish (team logos, headshots, award icons, polished dropdowns) deferred to Phase 5

---
*Phase: 02-stats-engine*
*Completed: 2026-03-04*
