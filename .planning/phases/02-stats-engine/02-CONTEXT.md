# Phase 2: Stats Engine - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix stat accuracy bugs, build correct batting and pitching tables with working filters, and implement header-based column mapping so spreadsheet changes don't break parsing. This phase delivers accurate, filterable, sortable stats tables — not visual polish (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Filter behavior and defaults
- Default to **yearly** scope on page load
- Default year is the **most recent season** auto-detected from the data
- Team filter works by **team the player was on THAT year** (e.g. show all players on Team X in 2024)
- No year filter is shown in totals view — only in yearly view
- When filters return no results, show a simple **"No players match these filters"** message — no suggestion logic

### Qualifier logic
- Hitting qualifier threshold: **floor(3.1 × average games played per player that year)** plate appearances
- Pitching qualifier threshold: **floor(1 × average games played per player that year)** innings pitched
- "Average games played" is calculated from **all players who appeared that year** (anyone with ≥1 game)
- Qualifier source: **calculate from the player data** (not pre-computed in the spreadsheet — investigate whether a pre-computed value exists during research)
- Qualified toggle is **on by default** (show only qualified players)
- For all-time career totals, qualifier approach is at Claude's discretion (current design uses a numeric Min PA/IP input box which is reasonable)

### Stat columns
- In yearly view, **no Year column** — the year filter already communicates which season is shown
- In all-time totals view, **show Seasons column** (number of seasons played)
- Specific hitting and pitching stat columns are at Claude's discretion — current set is reasonable (Hitting: G, PA, AB, R, H, 2B, 3B, HR, RBI, BB, SO, AVG, OBP, SLG, OPS, wRC+; Pitching: G, IP, W, L, SV, K, BB, H, R, ER, ERA, WHIP, OPP AVG)

### Sorting and table interactions
- Default hitting sort: **wRC+ descending**
- Default pitching sort: **ERA ascending** (lower is better)
- Column click sorting: **smart defaults** — first click sorts by the stat's natural direction (descending for counting stats like HR/RBI, ascending for rate stats like ERA/WHIP), second click reverses
- **Sticky first 2 columns** (Player and Team) — keep current behavior so they stay visible when scrolling horizontally

### Claude's Discretion
- Exact stat columns for hitting and pitching tables (current set is a reasonable starting point)
- Career totals qualifier approach (current Min PA/IP input is fine)
- Tie-breaking logic for equal stat values
- Exact spacing and typography of filter controls

</decisions>

<specifics>
## Specific Ideas

- Qualifier thresholds are dynamic per-year, not fixed numbers — this requires computing average games played from the data for each season
- The formula is league-specific: 3.1× avg games for hitting PA, 1× avg games for pitching IP
- Header-based column mapping (STAT-03) is critical — the spreadsheet columns may be reordered or added to, and the stats page must not break

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-stats-engine*
*Context gathered: 2026-03-03*
