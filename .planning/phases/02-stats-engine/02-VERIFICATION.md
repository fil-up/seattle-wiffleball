---
phase: 02-stats-engine
verified: 2026-03-04T22:00:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
human_verification:
  - test: "Switch year dropdown from 2025 to 2024 and verify table data updates"
    expected: "Table shows only 2024 season data, team dropdown updates to teams from 2024"
    why_human: "Requires live Google Sheets data to verify correct filter behavior"
  - test: "Click wRC+ column header on hitting tab and verify sort direction"
    expected: "First click sorts descending (highest wRC+ first); second click sorts ascending"
    why_human: "Sort direction UX requires visual confirmation"
  - test: "Switch to Totals scope and verify totals hitting data loads from IH sheet"
    expected: "All-time totals display with Seasons column and correct career stats"
    why_human: "Cannot verify sheet data accuracy without comparing to spreadsheet"
  - test: "Switch between Hitting and Pitching tabs and verify no stale data from previous tab"
    expected: "Each tab shows correct stat columns; no hitting data leaks into pitching view"
    why_human: "Requires runtime verification with actual API responses"
---

# Phase 2: Stats Engine Verification Report

**Phase Goal:** Stats tables show accurate, correctly filtered batting and pitching data built on the new data pipeline
**Verified:** 2026-03-04
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Switching year, team, and scope filters updates stats tables correctly with no stale or missing data | ✓ VERIFIED | Single fetch effect on [tab, scope]; all filtering via useMemo; year list from unfiltered allData; scope change resets year+team; team list scoped to selected year |
| 2 | All-time batting totals pull from the correct sheet (IH, not IP) | ✓ VERIFIED | `SHEET_MAP['hitting-totals']` = `{ sheet: 'IH', range: 'A1:AP600' }`; leaderboards all-time hitting also fetches from 'IH'; no hitting data references 'IP' sheet |
| 3 | Adding or reordering columns in Google Sheets does not break stats parsing — columns are mapped by header name | ✓ VERIFIED | `buildColumnMap(cols)` builds case-insensitive header→index map; `colIdx(cm, header, fallback)` used for every field in all 4 transforms; no hardcoded indices in stats API routes |
| 4 | The Stats page displays sortable, filterable batting and pitching tables with all expected stat columns | ✓ VERIFIED | 18 hitting columns (Player through wRC+), 15 pitching columns (Player through OPP AVG); TanStack table with sortDescFirst per column; default sort wRC+ desc / ERA asc; year, team, qualifier, search filters; 50-row pagination |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/sheets.ts` | Centralized transforms with header-based column mapping | ✓ VERIFIED (415 lines) | 4 transforms, 4 TypeScript interfaces, `buildColumnMap`/`colIdx` utilities, `fetchSheet` with caching |
| `src/app/stats/players/page.tsx` | Stats page with tabs, filters, sortable tables | ✓ VERIFIED (252 lines) | Hitting/pitching tabs, yearly/totals scope, year/team/qualifier/search filters, useMemo architecture |
| `src/components/StatsTable.tsx` | Reusable sortable table with TanStack | ✓ VERIFIED (156 lines) | TanStack React Table, sorting with sortDescFirst, pagination (50 rows), sticky columns, sort indicators |
| `src/components/StatsFilter.tsx` | Filter controls for year, team, qualified | ✓ VERIFIED (83 lines) | Year dropdown, team dropdown, qualified checkbox; optional team props for backward compatibility |
| `src/app/api/players/route.ts` | API route using centralized transforms | ✓ VERIFIED (49 lines) | Imports all 4 transforms from sheets.ts; SHEET_MAP for hitting/pitching × yearly/totals; IH for hitting, IP for pitching |
| `src/app/api/stats/route.ts` | Stats API using centralized transforms | ✓ VERIFIED (65 lines) | Imports yearly transforms from sheets.ts; IH for hitting, IP for pitching |
| `src/app/api/leaderboards/route.ts` | Leaderboards API using centralized transforms | ✓ VERIFIED (71 lines) | Imports all 4 transforms from sheets.ts; IH for totals hitting, IP for totals pitching |
| `src/app/api/players/[id]/route.ts` | Player detail API using centralized transforms | ✓ VERIFIED (41 lines) | Imports yearly transforms from sheets.ts; IH for hitting, IP for pitching |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `stats/players/page.tsx` | `/api/players` | fetch in useEffect | ✓ WIRED | `fetch(\`/api/players?type=${tab}&scope=${scopeParam}\`)` with response → `setAllData(result.data)` |
| `stats/players/page.tsx` | `StatsTable` | import + JSX render | ✓ WIRED | `<StatsTable data={displayData} columns={columns} initialSortField={initialSort} ...>` |
| `stats/players/page.tsx` | `StatsFilter` | import + JSX render | ✓ WIRED | `<StatsFilter years={years} selectedYear={...} teams={teams} ...>` |
| `/api/players` | `sheets.ts` transforms | import + fetchSheet call | ✓ WIRED | `fetchSheet(mapping.sheet, mapping.range, transformYearlyHitting)` etc. |
| `/api/stats` | `sheets.ts` transforms | import + fetchSheet call | ✓ WIRED | `fetchSheet(sheet, range, transformYearlyHitting/Pitching)` |
| `/api/leaderboards` | `sheets.ts` transforms | import + fetchSheet call | ✓ WIRED | `fetchSheet('IH', 'A1:AP600', transformTotalsHitting)` etc. |
| `sheets.ts` transforms | `buildColumnMap`/`colIdx` | internal function call | ✓ WIRED | All 4 transforms call `buildColumnMap(cols)` then `colIdx(cm, ...)` for every field |
| `allData` state | `displayData` render | useMemo chain | ✓ WIRED | `allData` → `years` useMemo → `teams` useMemo → `displayData` useMemo → `<StatsTable data={displayData}>` |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| STAT-01: Fix year/team/scope filtering bugs | ✓ SATISFIED | — |
| STAT-02: Fix wrong sheet reference (IH not IP) | ✓ SATISFIED | — |
| STAT-03: Map columns by header name | ✓ SATISFIED | — |
| STAT-04: Player batting stats table with sorting and filtering | ✓ SATISFIED | — |
| STAT-05: Player pitching stats table with sorting and filtering | ✓ SATISFIED | — |
| PAGE-05: Stats page with full batting and pitching tables with filters | ✓ SATISFIED | — |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `stats/players/page.tsx` | 36 | `console.error` in catch block | ℹ️ Info | Legitimate error logging; cleanup deferred to Phase 6 (INFRA-03) |

No TODO/FIXME/placeholder patterns found in any Phase 2 files.
No stub implementations detected.
No empty return patterns in stats components.

### Human Verification Required

### 1. Filter Interaction with Live Data

**Test:** Switch year dropdown from most recent year to an older year, then select a team filter
**Expected:** Table shows only that year's data; team dropdown shows only teams from that season; player list updates
**Why human:** Requires live Google Sheets data to verify correct filter behavior and data accuracy

### 2. Sort Direction Behavior

**Test:** Click wRC+ column header on hitting tab; click ERA column header on pitching tab
**Expected:** wRC+ first-click sorts descending (higher is better); ERA first-click sorts ascending (lower is better); unsorted columns show ⇅
**Why human:** Sort direction UX requires visual confirmation with real data ordering

### 3. All-Time Totals Data Accuracy

**Test:** Switch to Totals scope on hitting tab; compare a player's career totals with the IH sheet
**Expected:** Career totals (G, PA, H, HR, AVG, etc.) match the Google Sheet source data
**Why human:** Cannot verify data accuracy without comparing to the actual spreadsheet values

### 4. Tab Switching Data Isolation

**Test:** View hitting data, note a player's stats, switch to pitching tab, switch back to hitting
**Expected:** Hitting data reloads correctly; no pitching data appears in hitting columns; no stale cache artifacts
**Why human:** Requires runtime verification with actual API responses

### Gaps Summary

No gaps found. All 4 success criteria are verified at the code level:

1. **Filtering architecture** is sound — single fetch + useMemo chain eliminates stale data and circular dependency bugs
2. **Sheet references** are correct — hitting data from IH, pitching data from IP, at both yearly and totals ranges
3. **Column mapping** is header-based — `buildColumnMap`/`colIdx` pattern used in all 4 transforms with fallback indices
4. **Stats tables** are fully implemented — 18 hitting columns, 15 pitching columns, sortDescFirst metadata, TanStack sorting/pagination, year/team/qualifier/search filters

The remaining items (visual polish, team logos, responsive design) are correctly deferred to Phase 5.

---

_Verified: 2026-03-04_
_Verifier: Claude (gsd-verifier)_
