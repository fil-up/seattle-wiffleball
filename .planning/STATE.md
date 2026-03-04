# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** Accurate, browsable league stats and information — if the numbers are wrong or hard to find, nothing else matters.
**Current focus:** Phase 2 — Stats Engine

## Current Position

Phase: 2 of 6 (Stats Engine)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-03-04 — Completed 02-02-PLAN.md

Progress: [█████░░░░░░░░░░░░░░░] 26%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 11 min
- Total execution time: 0.9 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Data Foundation | 3/3 | 40 min | 13 min |
| 2 - Stats Engine | 2/3 | 10 min | 5 min |

**Recent Trend:**
- Last 5 plans: 01-02 (10 min), 01-03 (10 min), 02-01 (5 min), 02-02 (5 min)
- Trend: Accelerating

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Google Sheets is sole data source; Prisma/SQLite removal is Phase 1 priority
- [Roadmap]: INFRA-04 (remove Prisma) grouped with DATA requirements in Phase 1 since they're tightly coupled
- [Roadmap]: Stats visual polish (STAT-06/07/08/09) deferred to Phase 5 — accuracy before aesthetics
- [01-01]: Use SPREADSHEET_ID (not NEXT_PUBLIC_) to keep sheet ID server-side only
- [01-01]: Stub routes with 503 instead of deleting, preserving structure for Plan 01-02
- [01-02]: Regex-based gviz parsing instead of fragile substring(47)
- [01-02]: All API routes return { data, stale } envelope for uniform consumption
- [01-02]: Cache key format sheet!range to distinguish split ranges within same tab
- [01-03]: Removed roster table from teams/[id] — Sheets-based route lacks player-team relationships (Phase 2)
- [01-03]: Qualifier filter uses numeric wrcPlus > 0 instead of string-based 'Non-qualifier' check
- [02-01]: Branch-specific fetchSheet calls for TypeScript type narrowing instead of union-typed transform variable
- [02-01]: Case-insensitive header matching via toLowerCase in buildColumnMap
- [02-01]: Fallback indices match existing hardcoded values for zero-change behavior
- [02-02]: Year list derived from unfiltered allData via useMemo (fixes circular dependency)
- [02-02]: Single useEffect for fetch triggered by [tab, scope] only (fixes double-fetch)
- [02-02]: Dynamic qualifier: floor(3.1 * avgGP) PA hitting, floor(1 * avgGP) IP pitching

### Pending Todos

None yet.

### Blockers/Concerns

- Codebase has 36 v1 requirements (REQUIREMENTS.md header says 32 — count should be corrected)
- No test coverage exists; refactoring in Phase 1 carries regression risk
- OneDrive sync can corrupt .next cache on Windows — delete .next before builds if errors occur
- Header labels in colIdx are inferred — need live gviz response verification (fallback indices ensure correctness)

## Session Continuity

Last session: 2026-03-04
Stopped at: Completed 02-02-PLAN.md
Resume file: None
