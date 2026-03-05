# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** Accurate, browsable league stats and information — if the numbers are wrong or hard to find, nothing else matters.
**Current focus:** Phase 5 Design & Polish — in progress

## Current Position

Phase: 5 of 6 (Design & Polish)
Plan: 1 of 4 in phase
Status: In progress
Last activity: 2026-03-05 — Completed 05-01-PLAN.md (design system foundation)

Progress: [███████████████░░░░░] 71%

## Performance Metrics

**Velocity:**
- Total plans completed: 15
- Average duration: 7 min
- Total execution time: ~1.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Data Foundation | 3/3 | 40 min | 13 min |
| 2 - Stats Engine | 3/3 | 15 min | 5 min |
| 3 - Core Pages | 5/5 | 32 min | 6 min |
| 4 - Content Pages | 3/3 | ~15 min | ~5 min |
| 5 - Design & Polish | 1/4 | 8 min | 8 min |

**Recent Trend:**
- Last 5 plans: 03-05 (3 min), 04-01 (~5 min), 04-03 (~5 min), 04-02 (~5 min), 05-01 (8 min)
- Trend: Stable

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
- [02-02]: Year list derived from unfiltered allData via useMemo (fixes circular dependency bug)
- [02-02]: Single useEffect for fetching, triggered by [tab, scope] only (fixes double-fetch)
- [02-02]: Dynamic qualifier: floor(3.1 * avgGP) PA for hitting, floor(1 * avgGP) IP for pitching
- [02-03]: Default hitting sort changed from OPS to wRC+ descending
- [02-03]: ERA/WHIP/OPP AVG marked sortDescFirst: false; all other stats sortDescFirst: true
- [02-03]: Page size set to 50 rows (up from TanStack default of 10)
- [03-01]: GameChangerWidget extracted with ref-based unique IDs and maxGames prop
- [03-01]: YouTube API uses RSS feed parsing with graceful degradation (empty CHANNEL_ID returns empty array)
- [03-02]: Featured Teams section removed — standings widget covers team visibility
- [03-02]: Home page YouTube section conditional — only renders if channel ID configured
- [03-02]: Quick Links expanded to 4 cards (added Schedule) with 4-column grid
- [03-03]: Match standings to teams by franchise name (case-insensitive), most recent year
- [03-03]: Team aggregate OPS averaged; wRC+ averaged only for qualified hitters
- [03-03]: Players in both hitting/pitching datasets deduplicated, shown as "Both"
- [03-05]: Plain HTML tables for player detail (no StatsTable) — simpler for static career display
- [03-05]: Leaderboards year default via empty string init + setYear in years-fetch useEffect
- [03-05]: Guard leaderboard data fetch with if (!year) return to prevent empty-year fetch
- [04-03]: Layered Image + initials circle for portrait fallback (server component compatible)
- [04-03]: Template entries filtered by id prefix for user-editable JSON data pattern
- [04-01]: News articles as individual .md files in content/news/ with gray-matter frontmatter
- [04-01]: API route /api/news bridges server-only fs/gray-matter for client-side home page
- [04-01]: remark + remark-html replaces fragile regex markdown converter
- [04-02]: @tailwindcss/typography prose classes for rules markdown rendering
- [04-02]: Archives merges static JSON awards data with dynamic API standings by year
- [04-02]: Info page join link uses placeholder URL — user replaces with real signup form
- [05-01]: Providers client wrapper extracts ThemeProvider for SSR compatibility
- [05-01]: Per-page PageNavigation removed in favor of layout-level SiteNavigation
- [05-01]: CSS variable values use space-separated RGB channels for Tailwind opacity modifier support
- [05-01]: Secondary nav links shown at reduced opacity on desktop to distinguish from primary

### Pending Todos

None yet.

### Blockers/Concerns

- Codebase has 36 v1 requirements (REQUIREMENTS.md header says 32 — count should be corrected)
- No test coverage exists; refactoring in Phase 1 carries regression risk
- OneDrive sync can corrupt .next cache on Windows — delete .next before builds if errors occur
- Header labels in colIdx are inferred — need live gviz response verification (fallback indices ensure correctness)
- No league logo image exists — SiteNavigation uses text branding; logo can be added when available

## Session Continuity

Last session: 2026-03-05
Stopped at: Completed 05-01-PLAN.md
Resume file: None
