# Phase 2: Stats Engine - Research

**Researched:** 2026-03-04
**Domain:** Stats data pipeline accuracy, header-based column mapping, client-side filtering/sorting with TanStack React Table
**Confidence:** HIGH

## Summary

This phase fixes stat accuracy bugs, implements header-based column mapping for resilient spreadsheet parsing, and builds correct batting and pitching stats tables with working year/team/scope filters and dynamic qualifier thresholds. The codebase already has the data pipeline infrastructure from Phase 1 (`src/lib/sheets.ts` with gviz parsing, caching, and `{data, stale}` envelope), TanStack React Table for sortable tables, and API routes that serve hitting and pitching data. The work is primarily bug fixes and refactoring — no new libraries are needed.

The investigation revealed several concrete bugs: (1) the stats page has a year-list circular dependency where the dropdown shrinks to one year after initial load, (2) two competing `useEffect` hooks cause double data fetching on tab change, (3) qualifier filtering uses a naive `wrcPlus > 0` proxy instead of the specified PA/IP threshold formula, (4) there is no team filter on the stats page, (5) default hitting sort uses OPS instead of the specified wRC+, and (6) identical transform functions are duplicated across 4 API route files, making STAT-03 (header-based mapping) changes require 4× the edits.

**Primary recommendation:** Centralize all transform functions into `src/lib/sheets.ts` with header-based column mapping via `cols` labels, then rebuild the stats page with a single data-fetching effect that separates full data (for filter options) from filtered display data.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.0.3 | App Router, API routes | Already in use |
| @tanstack/react-table | ^8.10.7 | Sortable, filterable, paginated stats tables | Already in use; best-in-class table library |
| TypeScript | 5.3.x | Type safety for stat row interfaces | Already in use |
| Tailwind CSS | ^3.3.5 | Table and filter styling | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `src/lib/sheets.ts` | Custom | gviz fetch/parse/cache/transform | Every API route accessing Google Sheets |
| `GvizCol.label` | gviz API | Column header names for header-based mapping | All transform functions (replacing hardcoded indices) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side qualifier computation | Server-side qualifier param | Server-side requires either a separate API call or computing avg GP on the server; client-side is simpler since all data is already fetched |
| Per-route transform functions | Centralized transforms in sheets.ts | Centralized is better — 4 route files currently duplicate the same transforms |

**Installation:**
```bash
# No new packages needed — everything is already in the stack
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── sheets.ts             # fetchSheet + centralized transforms + header mapping
├── app/
│   ├── api/
│   │   ├── players/
│   │   │   ├── route.ts      # Uses centralized transforms from sheets.ts
│   │   │   └── [id]/route.ts # Same centralized transforms
│   │   ├── stats/route.ts    # Same centralized transforms
│   │   └── leaderboards/route.ts  # Same centralized transforms
│   └── stats/
│       └── players/
│           └── page.tsx       # Rebuilt stats page with proper filter state management
├── components/
│   ├── StatsTable.tsx         # Enhanced with smart sort direction metadata
│   └── StatsFilter.tsx        # Enhanced with team filter, scope selector
```

### Pattern 1: Header-Based Column Mapping
**What:** Build a `Map<string, number>` from `cols[i].label` to index `i`, then look up columns by header name instead of hardcoded index.
**When to use:** Every transform function that reads from Google Sheets.
**Example:**
```typescript
// In src/lib/sheets.ts

export function buildColumnMap(cols: GvizCol[]): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = 0; i < cols.length; i++) {
    const label = cols[i].label?.trim()
    if (label) {
      map.set(label, i)
    }
  }
  return map
}

export function col(row: GvizRow, colMap: Map<string, number>, header: string, fallbackIndex?: number): number {
  const idx = colMap.get(header) ?? fallbackIndex
  if (idx === undefined) return -1
  return idx
}

// Transform example:
export function transformYearlyHitting(rows: GvizRow[], cols: GvizCol[]) {
  const cm = buildColumnMap(cols)
  return rows.map((row) => ({
    year: cellNumber(row, cm.get('Year') ?? 0),
    team: cellString(row, cm.get('Team') ?? 4),
    games: cellNumber(row, cm.get('G') ?? 7),
    plateAppearances: cellNumber(row, cm.get('PA') ?? 8),
    // ... etc
  }))
}
```

### Pattern 2: Separated Filter State (Full Data vs Display Data)
**What:** Keep full unfiltered data in one state variable (for extracting year/team lists), and derived filtered data in a `useMemo` for display.
**When to use:** The stats page — prevents the year-list circular dependency bug.
**Example:**
```typescript
const [allData, setAllData] = useState<StatRow[]>([])

// Derive filter options from UNFILTERED data
const years = useMemo(() => {
  const unique = [...new Set(allData.map(r => r.year).filter(Boolean))]
  return unique.sort((a, b) => b - a)
}, [allData])

const teams = useMemo(() => {
  if (!selectedYear) return []
  const yearData = allData.filter(r => r.year === selectedYear)
  return [...new Set(yearData.map(r => r.team).filter(Boolean))].sort()
}, [allData, selectedYear])

// Derive display data from full data + active filters
const displayData = useMemo(() => {
  let filtered = allData
  if (selectedYear) filtered = filtered.filter(r => r.year === selectedYear)
  if (selectedTeam) filtered = filtered.filter(r => r.team === selectedTeam)
  if (qualified) filtered = filtered.filter(r => meetsQualifier(r, qualifierThreshold))
  return filtered
}, [allData, selectedYear, selectedTeam, qualified, qualifierThreshold])
```

### Pattern 3: Dynamic Qualifier Threshold Computation
**What:** Calculate qualifier threshold from the year's data rather than using a fixed number or naive proxy.
**When to use:** Yearly scope with the "Qualified" toggle enabled.
**Example:**
```typescript
function computeQualifierThreshold(
  data: StatRow[],
  year: number,
  type: 'hitting' | 'pitching'
): number {
  const yearPlayers = data.filter(r => r.year === year && r.games > 0)
  if (yearPlayers.length === 0) return 0
  const avgGames = yearPlayers.reduce((sum, r) => sum + r.games, 0) / yearPlayers.length
  const multiplier = type === 'hitting' ? 3.1 : 1.0
  return Math.floor(multiplier * avgGames)
}
```

### Pattern 4: Smart Sort Direction Metadata
**What:** Define per-column sort direction defaults so first-click sorts in the stat's natural direction.
**When to use:** StatsTable column definitions.
**Example:**
```typescript
const ASCENDING_STATS = new Set(['era', 'whip', 'oppAvg'])

// In column definitions, set sortDescFirst based on stat type:
{ header: "ERA", accessorKey: "era", sortDescFirst: false }  // lower is better
{ header: "HR", accessorKey: "homeRuns", sortDescFirst: true } // higher is better

// TanStack React Table supports sortDescFirst per-column
```

### Anti-Patterns to Avoid
- **Deriving filter options from filtered data:** The year dropdown must come from the full unfiltered dataset. If you extract years from already-year-filtered data, the dropdown collapses to one option.
- **Multiple competing useEffects for data fetching:** Have ONE effect that fetches data, triggered by the parameters that actually require a re-fetch (tab, scope). Apply year/team/qualifier filters via `useMemo`, not via re-fetching.
- **Hardcoded column indices without fallback:** When implementing header-based mapping, always include fallback indices for graceful degradation if headers are missing or empty.
- **Duplicated transform functions across route files:** Centralizing transforms in `sheets.ts` ensures STAT-03 changes propagate to all consumers.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table sorting, pagination, filtering | Custom table state management | TanStack React Table (already installed) | Handles edge cases like stable sort, multi-column, accessibility |
| Column sort direction logic | Custom asc/desc toggle | TanStack's `sortDescFirst` column option | Built into the library; per-column control |
| Header-to-index mapping | Inline index lookups per transform | Shared `buildColumnMap()` utility | One function used by all transforms; DRY |

**Key insight:** The hardest part of this phase is NOT the column mapping or sorting — it's the state management of the stats page. The current page has a spaghetti of `useEffect` hooks that cause cascading re-renders, double fetches, and stale filter state. Getting the data flow right (fetch once → store full data → derive everything else) is the most impactful change.

## Common Pitfalls

### Pitfall 1: Year List Circular Dependency
**What goes wrong:** The year dropdown shows only one year (the currently selected one) instead of all available years.
**Why it happens:** Years are extracted from `stats` state, but `stats` is already filtered by `selectedYear`. After the first render cycle, the filtered data only contains one year's worth of rows.
**How to avoid:** Store the full unfiltered API response in a separate state variable (`allData`). Derive year/team lists from `allData` via `useMemo`, never from the filtered display data.
**Warning signs:** Year dropdown that worked on first load but becomes a single-option dropdown after selection.
**Current location:** `src/app/stats/players/page.tsx` lines 128-136

### Pitfall 2: Double Data Fetching on Tab Change
**What goes wrong:** Switching between Hitting/Pitching tabs triggers TWO API calls instead of one.
**Why it happens:** Two `useEffect` hooks both react to `tab` changes — one on line 115 (`[tab]`) and one on line 123 (`[tab, scope, selectedYear, ...]`). Both call `fetchData()`.
**How to avoid:** Have a single `useEffect` responsible for fetching. The `[tab]` effect should ONLY handle resetting filters for the new tab, not fetching data.
**Warning signs:** Network tab shows duplicate requests when switching tabs.
**Current location:** `src/app/stats/players/page.tsx` lines 115-126

### Pitfall 3: Wrong Qualifier Proxy
**What goes wrong:** "Qualified" filter shows players with any non-zero wRC+ (hitting) or non-zero ERA (pitching), instead of players who met the plate appearance / innings pitched threshold.
**Why it happens:** The proper qualifier formula (floor(3.1 × avg GP) PA, floor(1 × avg GP) IP) wasn't implemented; a simpler proxy was used during initial development.
**How to avoid:** Compute the qualifier threshold dynamically from the year's data. For each year, calculate average games played across all players who appeared, multiply by 3.1 (hitting) or 1.0 (pitching), floor the result, and filter by PA/IP ≥ threshold.
**Warning signs:** Players with very few plate appearances but non-zero wRC+ appearing in the "qualified" view.
**Current location:** `src/app/stats/players/page.tsx` lines 91-97, `/api/stats/route.ts` lines 117-120

### Pitfall 4: Header Label Discovery
**What goes wrong:** Header-based column mapping uses wrong header names, silently falling back to incorrect indices.
**Why it happens:** The actual header labels in the Google Sheets are unknown until a live gviz response is inspected. Labels might be "Year", "YEAR", "Yr", or empty.
**How to avoid:** During implementation, log the actual `cols` array from a live gviz response to discover exact header labels. Build the column map with case-insensitive matching and explicit fallback indices.
**Warning signs:** Transform returning all zeros or null values for certain columns.

### Pitfall 5: Totals vs Yearly Column Layout Mismatch
**What goes wrong:** Totals data shows wrong values because the column layout differs from yearly data.
**Why it happens:** The IH/IP totals section (rows 1-600/1-270) has a different column layout than the yearly section (rows 700+/300+). Totals lack Year, nameId, and Team columns; First/Last name are at indices 0-1 instead of 2-3.
**How to avoid:** Use SEPARATE header mappings for totals vs yearly transforms. The header labels from the gviz `cols` array will naturally be different for different ranges.
**Warning signs:** Player names appearing in the Year column, or numeric values in the Name column.

## Code Examples

### Current Bug: Year List Circular Dependency
```typescript
// CURRENT (BUGGY) — src/app/stats/players/page.tsx
useEffect(() => {
  if (scope === "yearly" && stats.length > 0) {
    // BUG: `stats` is already filtered by selectedYear
    // so uniqueYears collapses to [selectedYear]
    const uniqueYears = Array.from(
      new Set(stats.map(s => s.year).filter(Boolean))
    ).sort((a, b) => b - a)
    setYears(uniqueYears)
    if (uniqueYears.length > 0 && !selectedYear) {
      setSelectedYear(uniqueYears[0])
    }
  }
}, [stats, scope, selectedYear])

// FIX: derive from unfiltered data
const years = useMemo(() => {
  if (scope !== 'yearly') return []
  return [...new Set(allData.map(r => r.year).filter(Boolean))].sort((a, b) => b - a)
}, [allData, scope])
```

### Current Bug: Duplicate Fetch on Tab Switch
```typescript
// CURRENT (BUGGY) — both fire when `tab` changes
useEffect(() => {
  if (tab === "hitting") fetchData('hitting', true)
  else fetchData('pitching', true)
}, [tab])  // <-- fires on tab change

useEffect(() => {
  const isYearly = scope === "yearly"
  fetchData(tab, isYearly)
}, [tab, scope, selectedYear, qualified, totalsPaQual, totalsIpQual])  // <-- also fires on tab change

// FIX: single fetch effect, filter via useMemo
useEffect(() => {
  fetchData(tab, scope === 'yearly')
}, [tab, scope])
// Year/team/qualifier filtering done in useMemo, not via re-fetch
```

### Centralized Transform with Header Mapping
```typescript
// Source: existing fetchSheet API + gviz cols structure

export function buildColumnMap(cols: GvizCol[]): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = 0; i < cols.length; i++) {
    const label = cols[i].label?.trim().toLowerCase()
    if (label) map.set(label, i)
  }
  return map
}

function colIdx(cm: Map<string, number>, header: string, fallback: number): number {
  return cm.get(header.toLowerCase()) ?? fallback
}

export function transformYearlyHitting(rows: GvizRow[], cols: GvizCol[]) {
  const cm = buildColumnMap(cols)
  return rows
    .map((row, index) => {
      const first = cellString(row, colIdx(cm, 'First', 2))
      const last = cellString(row, colIdx(cm, 'Last', 3))
      const nameId = cellString(row, colIdx(cm, 'Name ID', 1))
      if (!first && !last) return null
      return {
        id: `hitting-${index}`,
        playerId: nameId,
        player: { id: nameId, name: `${first} ${last}`.trim() },
        year: cellNumber(row, colIdx(cm, 'Year', 0)),
        team: cellString(row, colIdx(cm, 'Team', 4)),
        games: cellNumber(row, colIdx(cm, 'G', 7)),
        plateAppearances: cellNumber(row, colIdx(cm, 'PA', 8)),
        // ... remaining columns with header name + fallback index
      }
    })
    .filter(r => r !== null && r.player.name.trim() !== '' && r.year > 0)
}
```

### Smart Sort Direction with TanStack React Table
```typescript
// TanStack React Table supports sortDescFirst per column definition
// Source: @tanstack/react-table ColumnDef API

const ASCENDING_STATS = new Set(['era', 'whip', 'oppAvg'])

function makeSortableColumn(header: string, accessorKey: string, opts?: {
  cell?: any
}): ColumnDef<any, any> {
  return {
    header,
    accessorKey,
    sortDescFirst: !ASCENDING_STATS.has(accessorKey),
    ...opts,
  }
}
```

## Codebase Inventory

### Duplicated Transform Functions (must centralize for STAT-03)

| Transform | `/api/players` | `/api/players/[id]` | `/api/stats` | `/api/leaderboards` |
|-----------|:-:|:-:|:-:|:-:|
| `transformYearlyHitting` | ✓ (named) | ✓ (named `transformHitting`) | ✓ (named `transformHitting`) | ✓ (named) |
| `transformYearlyPitching` | ✓ (named) | ✓ (named `transformPitching`) | ✓ (named `transformPitching`) | ✓ (named) |
| `transformTotalsHitting` | ✓ | — | — | ✓ |
| `transformTotalsPitching` | ✓ | — | — | ✓ |

**Total:** 12 transform function copies across 4 files. Centralizing to `sheets.ts` makes header-based mapping a single change point.

### Known Column Index Map (inferred from current code)

**IH Yearly (A700:AP2000) — 42 columns:**
| Index | Inferred Header | Used As |
|-------|----------------|---------|
| 0 | Year | `year` |
| 1 | Name ID | `playerId` / `nameId` |
| 2 | First | First name |
| 3 | Last | Last name |
| 4 | Team | `team` |
| 6 | AVG | `avg` |
| 7 | G | `games` |
| 8 | PA | `plateAppearances` |
| 9 | AB | `atBats` |
| 10 | R | `runs` |
| 11 | H | `hits` |
| 12 | 2B | `doubles` |
| 13 | 3B | `triples` |
| 14 | HR | `homeRuns` |
| 15 | RBI | `rbis` |
| 16 | BB | `walks` |
| 17 | SO | `strikeouts` |
| 21 | OBP | `obp` |
| 22 | SLG | `slg` |
| 23 | OPS | `ops` |
| 28 | OPS+ | `opsPlus` |
| 34 | wRC+ | `wrcPlus` |

**IH Totals (A1:AP600) — different layout:**
| Index | Inferred Header | Used As |
|-------|----------------|---------|
| 0 | First | First name |
| 1 | Last | Last name |
| 2 | Seasons | `seasons` |
| 4 | G | `games` |
| 5 | PA | `plateAppearances` |
| 6 | AB | `atBats` |
| 7 | R | `runs` |
| 8 | H | `hits` |
| 9 | 2B | `doubles` |
| 10 | 3B | `triples` |
| 11 | HR | `homeRuns` |
| 12 | RBI | `rbis` |
| 13 | BB | `walks` |
| 14 | SO | `strikeouts` |
| 15 | AVG | `avg` |
| 18 | OBP | `obp` |
| 19 | SLG | `slg` |
| 20 | OPS | `ops` |
| 33 | wRC+ | `wrcPlus` |

**IP Yearly (A300:AA999) — 27 columns:**
| Index | Inferred Header | Used As |
|-------|----------------|---------|
| 0 | Year | `year` |
| 1 | Name ID | `playerId` |
| 2 | First | First name |
| 3 | Last | Last name |
| 4 | Team | `team` |
| 6 | G | `games` |
| 8 | IP | `inningsPitched` |
| 11 | W | `wins` |
| 12 | L | `losses` |
| 13 | SV | `saves` |
| 14 | K | `strikeouts` |
| 15 | BB | `walks` |
| 16 | H | `hits` |
| 17 | R | `runs` |
| 18 | ER | `earnedRuns` |
| 19 | ERA | `era` |
| 20 | WHIP | `whip` |
| 24 | OPP AVG | `oppAvg` |

**IP Totals (A1:AA270) — different layout:**
| Index | Inferred Header | Used As |
|-------|----------------|---------|
| 0 | First | First name |
| 1 | Last | Last name |
| 2 | Seasons | `seasons` |
| 4 | G | `games` |
| 6 | IP | `inningsPitched` |
| 11 | W | `wins` |
| 12 | L | `losses` |
| 13 | SV | `saves` |
| 14 | K | `strikeouts` |
| 15 | BB | `walks` |
| 16 | H | `hits` |
| 17 | R | `runs` |
| 18 | ER | `earnedRuns` |
| 19 | ERA | `era` |
| 20 | WHIP | `whip` |
| 24 | OPP AVG | `oppAvg` |

**Critical note:** These header names are INFERRED from column position and context. Actual header labels must be discovered from a live gviz response during implementation. The `cols` array in the gviz response contains `{ id, label, type }` for each column. The `label` field is what appears in the header row of the spreadsheet.

### STAT-02 Status: Sheet Reference Bug
The current SHEET_MAP in `/api/players/route.ts` maps `hitting-totals` to `{ sheet: 'IH', range: 'A1:AP600' }`, which appears correct. The `/api/leaderboards/route.ts` also correctly uses `IH` for all-time hitting. The STAT-02 bug ("hitting totals pulling from pitching sheet IP") may have been inadvertently fixed during Phase 1's route rewriting, but column indices for the totals section need verification — the totals layout is structurally different from yearly (no Year/Team/nameId columns, names at indices 0-1 instead of 2-3).

### Existing Stats Page Bug Summary

| Bug | Location | Impact | Root Cause |
|-----|----------|--------|------------|
| Year dropdown shows only 1 year | `page.tsx:128-136` | Can't switch years | Years derived from filtered data |
| Double fetch on tab change | `page.tsx:115-126` | Wasted API calls, flash of wrong data | Two useEffects both trigger fetchData |
| No team filter | `page.tsx`, `StatsFilter.tsx` | Can't filter by team | Feature not implemented |
| Wrong qualifier logic | `page.tsx:91-97` | Wrong players shown as qualified | Uses wrcPlus>0 instead of PA threshold |
| Wrong default sort | `page.tsx:199` | Hitting sorts by OPS instead of wRC+ | `initialSort = "ops"` hardcoded |
| No smart sort direction | `StatsTable.tsx` | First click always descends | No per-column sortDescFirst metadata |
| No scope/year reset | `page.tsx` | Stale filters persist across scope changes | selectedYear not cleared on scope switch |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded column indices | Header-based mapping via gviz `cols.label` | This phase (STAT-03) | Spreadsheet column changes don't break parsing |
| `wrcPlus > 0` qualifier proxy | Dynamic threshold: `floor(multiplier × avg GP)` | This phase (STAT-01) | Accurate qualifier filtering per league rules |
| Multiple useEffects for data flow | Single fetch + useMemo derived state | This phase (STAT-01) | Eliminates double-fetch and circular year list bug |
| Duplicated transform functions | Centralized transforms in sheets.ts | This phase (STAT-03) | Single change point for column mapping |

## Open Questions

1. **Actual gviz column header labels**
   - What we know: The gviz API returns `cols` with `{ id, label, type }` for each column. The `label` is the spreadsheet header text.
   - What's unclear: The exact header labels in the IH and IP sheets — they could be "Year", "YEAR", "Yr", or something unexpected.
   - Recommendation: During implementation, add a temporary `console.log(cols)` in the transform function to capture the actual header labels from a live response. Build the column map with case-insensitive matching. Keep fallback indices for resilience.

2. **Whether qualifier thresholds exist pre-computed in the spreadsheet**
   - What we know: The CONTEXT.md says "calculate from the player data" and notes to investigate if a pre-computed value exists. The Phase 1 research mapped the spreadsheet tabs but didn't find a dedicated qualifier column.
   - What's unclear: Whether any cell in the spreadsheet contains the league-wide average GP or qualifier threshold per year.
   - Recommendation: Compute client-side from player data. The formula is simple: `floor(multiplier × (totalGames / playerCount))`. The data is already fetched. No extra API call needed.

3. **Career totals qualifier approach**
   - What we know: CONTEXT.md says "Claude's discretion" and notes the current Min PA/IP input is reasonable.
   - What's unclear: Whether the current defaults (100 PA, 75 IP) are appropriate for this league's scale.
   - Recommendation: Keep the current Min PA/IP input approach for totals. The thresholds can be adjusted by the user. Don't over-engineer this.

4. **Team filter values — abbreviation vs full name**
   - What we know: The `team` field in stats data contains values from the spreadsheet (column index 4 in yearly data). The `/api/teams` route provides team objects with `name`, `abbreviation`, `uniqueTeamName`.
   - What's unclear: Whether the `team` value in stats data matches `abbreviation` or `name` from the teams list.
   - Recommendation: During implementation, log sample `team` values from stats data and compare against the teams list. The filter dropdown should display team names but match against whatever identifier the stats data uses.

5. **`/api/stats/route.ts` vs `/api/players/route.ts` overlap**
   - What we know: Both routes serve similar data. The stats page fetches from `/api/players`. The `/api/stats` route serves yearly data only with server-side sorting and qualifying. The `/api/leaderboards` route duplicates all four transform functions.
   - What's unclear: Whether `/api/stats` should be consolidated into `/api/players` or kept separate.
   - Recommendation: The stats page should use `/api/players` (which already handles yearly + totals). The `/api/stats` route is used by nothing on the stats page — investigate if any other page uses it. If not, it can be deprecated. The leaderboards route should import centralized transforms from `sheets.ts`.

## Sources

### Primary (HIGH confidence)
- Codebase analysis — read all relevant files: `sheets.ts`, 4 API routes, stats page, StatsTable, StatsFilter, PlayerBattingData, PlayerPitchingData
- TanStack React Table docs — `sortDescFirst` column option confirmed available in v8
- Phase 1 research and completed plans — established data pipeline patterns

### Secondary (MEDIUM confidence)
- Google Visualization API — gviz `cols` array format with `{ id, label, type }` per column
- CONTEXT.md decisions — qualifier formula, filter behavior, sort defaults

### Tertiary (LOW confidence)
- Inferred column header names — based on column position and stat type; actual labels need live verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; TanStack React Table already in use and well-understood
- Architecture: HIGH — patterns (centralized transforms, separated filter state, useMemo derivation) are well-established React patterns
- Pitfalls: HIGH — all bugs identified from direct codebase analysis with specific line numbers
- Column mapping: MEDIUM — header names are inferred; actual labels need live gviz response verification

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable — no external library changes expected; this is primarily internal refactoring)
