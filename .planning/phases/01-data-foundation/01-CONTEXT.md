# Phase 1: Data Foundation - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

All data flows through a single, reliable pipeline from Google Sheets. Remove Prisma/SQLite entirely, centralize the spreadsheet ID in one env var, proxy all data through Next.js API routes, build a shared gviz parsing utility, and add a caching layer. No dual-source confusion, no Prisma remnants.

</domain>

<decisions>
## Implementation Decisions

### Data freshness
- 30–60 second cache — near-instant freshness without hammering Google Sheets
- Updates happen after game days (batch), not live during games
- Traffic is moderate (20–100 visitors on game days), so short cache is safe against rate limits

### Unavailability behavior
- Show last successfully fetched (stale) data with a small banner noting data may be outdated
- Auto-retry fetching from Google Sheets in the background on a timer
- Banner wording: Claude's discretion
- First-load failure (no cached data exists yet): Claude's discretion

### Sheets structure
- **Tabs and ranges:**
  - IH (Individual Hitting) — A1:A600 player aggregates, A700:AP player yearly totals
  - IP (Individual Pitching) — A1:A270 player aggregates, A300:AA player yearly totals
  - TH (Team Hitting) — A1:Y50 team aggregates, A109:Y team yearly totals
  - TP (Team Pitching) — A1:W50 team aggregates, A106:W team yearly totals
  - Standings (Team Records) — A1:T50 team record aggregates, A54:T team yearly records
  - Player Name IDs — player name mappings
  - Player/Team Adj — O3:S team and franchise mappings
  - Awards (Tidy) — A1:H player awards
- Every range has a header row (column names in first row)
- Structure is stable season-to-season — same tabs, same layout

### Claude's Discretion
- Exact banner wording for stale data notice
- First-load failure behavior (error page vs empty state placeholders)
- Exact cache duration within the 30–60 second range

</decisions>

<specifics>
## Specific Ideas

- Spreadsheet has split ranges within tabs (e.g., IH has aggregates in rows 1–600 and yearly totals starting at row 700) — parser needs to handle these as logically separate data sets from the same tab
- Header-based column mapping is already a Phase 2 requirement (STAT-03), but the shared parser built here should be designed to support it

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-data-foundation*
*Context gathered: 2026-03-03*
