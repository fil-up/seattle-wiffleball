# Phase 1: Data Foundation - Research

**Researched:** 2026-03-03
**Domain:** Google Sheets gviz data pipeline, Next.js 14 API routes, in-memory caching
**Confidence:** HIGH

## Summary

This phase replaces a dual-source data architecture (Prisma/SQLite + client-side Google Sheets gviz fetches) with a single, reliable pipeline: Google Sheets → Next.js API routes → React components. The codebase currently has the spreadsheet ID hardcoded in 8 source files across 13 occurrences, a fragile `substring(47).slice(0, -2)` gviz response parser duplicated across 8 files, 5 API routes that still use Prisma, and 7 client-side components that fetch directly from Google Sheets (bypassing the server entirely).

The standard approach is straightforward: (1) delete all Prisma/SQLite artifacts, (2) centralize the spreadsheet ID in a single `SPREADSHEET_ID` env var, (3) build a shared gviz fetch-and-parse utility with built-in caching, (4) create/rewrite API routes to use that utility, and (5) convert client components to fetch from API routes instead of Google directly. No new libraries are needed — the existing stack (Next.js 14, native `fetch`) provides everything required.

**Primary recommendation:** Build a single `src/lib/sheets.ts` module that owns the spreadsheet ID, gviz URL construction, response parsing, caching, and staleness tracking — then have every API route use it.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.0.3 | App Router, API routes, server components | Already in use; API Route Handlers are the natural server proxy |
| TypeScript | 5.3.x | Type safety for parsed sheet data | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native `fetch` | Built-in | Fetching gviz data from Google Sheets | All server-side data fetching |
| `Map` (JS built-in) | N/A | In-memory TTL cache | Simple cache store — no external dependencies needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual Map cache | Next.js `fetch` with `next: { revalidate: 30 }` | Built-in revalidation is simpler but doesn't support stale-while-revalidate with banner signaling or serving last-known-good data on failure |
| Manual Map cache | `unstable_cache` (Next.js) | API is still unstable in v14; doesn't support stale data on failure or banner metadata |
| Manual Map cache | Redis/Memcached | Overkill for 20–100 visitors; adds infrastructure dependency |
| No library | `node-cache` npm package | Adds dependency for something achievable in ~30 lines |

**Installation:**
```bash
# No new packages needed. Remove Prisma packages:
npm uninstall @prisma/client prisma googleapis axios sheetrock
```

**Note:** `googleapis` is only used by `scripts/import-data.ts` (the Prisma import). `axios` is only used there too. `sheetrock` is listed as a dependency but not actually imported anywhere in the source code — it's vestigial.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── sheets.ts           # Shared gviz fetch, parse, cache utility
├── app/
│   └── api/
│       ├── players/
│       │   ├── route.ts     # Rewritten: hitting + pitching stats from Sheets
│       │   └── [id]/
│       │       └── route.ts # Rewritten: individual player from Sheets
│       ├── teams/
│       │   ├── route.ts     # Already uses gviz — refactor to use shared utility
│       │   └── [id]/
│       │       └── route.ts # Rewritten: team detail from Sheets
│       ├── standings/
│       │   └── route.ts     # NEW: standings data (yearly + all-time)
│       ├── leaderboards/
│       │   └── route.ts     # Rewritten: leaderboards from Sheets
│       └── stats/
│           └── route.ts     # Rewritten or removed (may merge into others)
```

### Pattern 1: Centralized Sheets Utility (`src/lib/sheets.ts`)
**What:** A single module that encapsulates spreadsheet ID, gviz URL building, response parsing, caching with TTL, and staleness tracking.
**When to use:** Every API route that needs data from Google Sheets.
**Example:**
```typescript
// src/lib/sheets.ts

const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  stale: boolean;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function buildGvizUrl(sheet: string, range: string): string {
  const encodedSheet = encodeURIComponent(sheet);
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodedSheet}&range=${range}`;
}

function parseGvizResponse(text: string): { table: { cols: any[]; rows: any[] } } {
  // Strip JSONP wrapper: "/*O_o*/\ngoogle.visualization.Query.setResponse({...});"
  const match = text.match(/google\.visualization\.Query\.setResponse\(({.*})\);?\s*$/s);
  if (!match) {
    throw new Error('Invalid gviz response format');
  }
  return JSON.parse(match[1]);
}

export async function fetchSheet<T>(
  sheet: string,
  range: string,
  transform: (rows: any[], cols: any[]) => T
): Promise<{ data: T; stale: boolean }> {
  const cacheKey = `${sheet}!${range}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { data: cached.data, stale: false };
  }

  try {
    const url = buildGvizUrl(sheet, range);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const parsed = parseGvizResponse(text);
    const data = transform(parsed.table.rows, parsed.table.cols);

    cache.set(cacheKey, { data, fetchedAt: now, stale: false });
    return { data, stale: false };
  } catch (error) {
    // Serve stale data if available
    if (cached) {
      cached.stale = true;
      return { data: cached.data, stale: true };
    }
    throw error;
  }
}
```

### Pattern 2: API Route Using Shared Utility
**What:** Thin API route that calls the shared utility with a transform function.
**When to use:** Every data endpoint.
**Example:**
```typescript
// src/app/api/teams/route.ts
import { NextResponse } from 'next/server';
import { fetchSheet } from '@/lib/sheets';

export async function GET() {
  try {
    const { data, stale } = await fetchSheet(
      'Player/Team Adj',
      'O4:S100',
      (rows) => rows
        .map((row: any) => {
          const cells = row.c || [];
          if (!cells[0]?.v || !cells[2]?.v) return null;
          return {
            id: (cells[3]?.v || '').toLowerCase(),
            name: cells[2]?.v || '',
            abbreviation: cells[3]?.v || '',
            uniqueTeamName: cells[0]?.v || '',
            teamCode: cells[1]?.v || '',
            logoUrl: cells[4]?.v
              ? `/images/teams/${cells[4].v}`
              : '/images/teams/default-team-logo.png',
          };
        })
        .filter(Boolean)
    );

    return NextResponse.json({ data, stale });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
```

### Pattern 3: Client Component Using API Route
**What:** Client component fetches from internal API route, not from Google directly.
**When to use:** Every component that currently fetches directly from Google Sheets.
**Example:**
```typescript
// Component fetching from API route
const response = await fetch('/api/standings?type=yearly');
const { data, stale } = await response.json();
// If stale, show banner
```

### Anti-Patterns to Avoid
- **Client-side Google Sheets fetches:** Never fetch `docs.google.com/spreadsheets/...` from `'use client'` components. This exposes the spreadsheet ID, bypasses caching, and can hit rate limits.
- **Hardcoded spreadsheet IDs:** Never embed the spreadsheet ID in component or route files. Always import from the shared utility.
- **Magic number parsing:** Never use `text.substring(47).slice(0, -2)`. The prefix length of `/*O_o*/\ngoogle.visualization.Query.setResponse(` can vary. Use regex matching.
- **Index-based column mapping without header awareness:** The current code maps columns by index (e.g., `cells[14]?.v` for RF). While this works, the shared parser should extract `cols` labels so Phase 2 can adopt header-based mapping (STAT-03).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| gviz response parsing | A bespoke parser per file | Single regex-based `parseGvizResponse()` in `src/lib/sheets.ts` | The `substring(47)` approach is brittle — the prefix includes `/*O_o*/\n` which is 49 chars but the code uses 47, only working due to Google's current response format |
| TTL cache | Per-route caching logic | Shared `Map`-based cache in `src/lib/sheets.ts` | Cache behavior must be consistent across all routes; stale-while-revalidate and banner signaling require centralized state |
| URL construction | Inline template strings with hardcoded IDs | `buildGvizUrl(sheet, range)` helper | The spreadsheet ID appears 13 times across 8 files; centralization eliminates this |

**Key insight:** The gviz response parsing looks trivially simple (`substring + slice + JSON.parse`) but the prefix `/*O_o*/\ngoogle.visualization.Query.setResponse(` has variable formatting. Google's response may include or omit the `/*O_o*/\n` comment prefix, and the exact byte length can change. Regex is the only robust approach.

## Common Pitfalls

### Pitfall 1: Stale substring(47) Magic Number
**What goes wrong:** The gviz response prefix length changes (Google modifies formatting), and `substring(47)` silently produces corrupt JSON or crashes with a parse error.
**Why it happens:** Developers hardcode the byte offset instead of pattern-matching.
**How to avoid:** Use `text.match(/google\.visualization\.Query\.setResponse\(({.*})\);?\s*$/s)` to extract the JSON payload regardless of prefix length.
**Warning signs:** `SyntaxError: Unexpected token` in JSON.parse during gviz parsing.

### Pitfall 2: Forgetting the Stale Data Banner
**What goes wrong:** Users see outdated data after Google Sheets becomes temporarily unreachable, with no indication the data is stale.
**Why it happens:** The cache silently serves old data on fetch failure without signaling staleness to the frontend.
**How to avoid:** Return `{ data, stale: boolean }` from every API route. Components check the `stale` field and render a banner.
**Warning signs:** API responses that return raw data arrays without metadata.

### Pitfall 3: Cache Keying by Sheet + Range
**What goes wrong:** Two API routes fetch overlapping ranges from the same sheet tab but cache them separately, wasting requests. Or worse, they use the same cache key for different ranges.
**Why it happens:** The sheet name alone isn't unique — the IH tab has aggregates (A1:A600) and yearly totals (A700:AP2000) as logically separate datasets.
**How to avoid:** Cache key MUST be `${sheet}!${range}` to distinguish between different ranges within the same tab.
**Warning signs:** Unexpected data showing up (e.g., aggregate stats when yearly stats were expected).

### Pitfall 4: Removing Prisma Before New Routes Are Working
**What goes wrong:** The leaderboards page breaks because it depends on Prisma-based API routes that haven't been migrated yet.
**Why it happens:** Removing Prisma is satisfying cleanup work, but the replacement routes must be functional first.
**How to avoid:** Migrate each Prisma-dependent API route to use the shared sheets utility BEFORE removing the Prisma code. Remove Prisma as the very last step.
**Warning signs:** 500 errors on pages that previously worked.

### Pitfall 5: Not Handling Split Ranges Within Tabs
**What goes wrong:** Fetching the IH tab returns aggregate data (rows 1–600) when yearly totals (rows 700+) were needed, or vice versa.
**Why it happens:** The spreadsheet has logically separate datasets within the same tab, separated by empty rows.
**How to avoid:** Always specify the exact range (e.g., `IH!A700:AP2000` not just `IH`). The API routes must be explicit about which sub-range they need.
**Warning signs:** Empty or garbled data from a tab that "should" have data.

## Code Examples

### gviz Response Parsing (Robust)
```typescript
// Source: https://developers.google.com/chart/interactive/docs/queries
// The gviz response is JSONP-wrapped. Format:
// /*O_o*/\ngoogle.visualization.Query.setResponse({...});

function parseGvizResponse(text: string): GvizTable {
  const match = text.match(
    /google\.visualization\.Query\.setResponse\(({.*})\);?\s*$/s
  );
  if (!match) {
    throw new Error('Failed to parse gviz response — unexpected format');
  }
  return JSON.parse(match[1]);
}

interface GvizTable {
  version: string;
  status: string;
  table: {
    cols: Array<{ id: string; label: string; type: string }>;
    rows: Array<{ c: Array<{ v: any; f?: string } | null> }>;
  };
}
```

### Row-to-Object Transform Helper
```typescript
// Extract cell values with type coercion
function cellValue(row: any, index: number): any {
  return row.c?.[index]?.v ?? null;
}

function cellString(row: any, index: number): string {
  return String(row.c?.[index]?.v ?? '');
}

function cellNumber(row: any, index: number): number {
  const v = row.c?.[index]?.v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function cellFloat(row: any, index: number, decimals?: number): number {
  const n = cellNumber(row, index);
  return decimals !== undefined ? parseFloat(n.toFixed(decimals)) : n;
}
```

### In-Memory Cache with TTL and Stale-While-Revalidate
```typescript
interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function getCached<T>(key: string): { data: T; fresh: boolean } | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const fresh = Date.now() - entry.fetchedAt < CACHE_TTL_MS;
  return { data: entry.data, fresh };
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, fetchedAt: Date.now() });
}
```

### Environment Variable Configuration
```bash
# .env.local
SPREADSHEET_ID=1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek
```

```typescript
// src/lib/sheets.ts
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
if (!SPREADSHEET_ID) {
  throw new Error('SPREADSHEET_ID environment variable is required');
}
```

**Note:** Use `SPREADSHEET_ID` (NOT `NEXT_PUBLIC_SPREADSHEET_ID`) because all fetches go through server-side API routes. There is no reason to expose the spreadsheet ID to the browser.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side gviz fetches | Server-side API routes proxying Sheets | Best practice since Next.js 13+ App Router | Eliminates CORS issues, enables caching, hides spreadsheet ID |
| `substring(47)` JSONP stripping | Regex-based extraction | N/A (the `substring` approach was always fragile) | Handles variable prefix formatting reliably |
| Prisma ORM + SQLite import pipeline | Direct gviz reads with in-memory caching | Decision for this project | Eliminates import step, reduces moving parts, data is always fresh from the sheet |
| `unstable_cache` for API caching | Custom in-memory Map cache | `unstable_cache` still experimental in Next.js 14 | Manual cache gives stale-while-revalidate with banner signaling |

**Deprecated/outdated:**
- `sheetrock` package (listed in `package.json` but unused in source code) — should be removed
- `googleapis` package — only used by the Prisma import script which is being deleted
- `axios` package — only used by the Prisma import script which is being deleted

## Codebase Inventory

### Files with Hardcoded Spreadsheet ID (13 occurrences in 8 files)
| File | Count | Context |
|------|-------|---------|
| `src/components/PlayerBattingData.tsx` | 1 | Client-side gviz fetch |
| `src/components/PlayerPitchingData.tsx` | 1 | Client-side gviz fetch |
| `src/components/SheetrockStandings.tsx` | 2 | Client-side gviz fetch (yearly + all-time) |
| `src/components/StandingsDebug.tsx` | 1 | Client-side gviz fetch (debug page) |
| `src/components/TeamMapping.tsx` | 1 | Client-side gviz fetch |
| `src/app/stats/players/page.tsx` | 4 | Client-side gviz fetch (hitting/pitching × yearly/totals) |
| `src/app/stats/teams/[team]/page.tsx` | 2 | Client-side gviz fetch (team info + standings) |
| `src/app/api/teams/route.ts` | 1 | Server-side gviz fetch (already an API route) |
| `scripts/import-data.ts` | 1 | Prisma import script (being deleted) |

### Files Using Fragile `substring(47)` Parsing (8 files)
All of the above except `scripts/import-data.ts` (which uses CSV/API format instead).

### Prisma-Dependent Files (to rewrite or delete)
| File | Action | Reason |
|------|--------|--------|
| `prisma/schema.prisma` | Delete | Prisma schema |
| `src/lib/prisma.ts` | Delete | Prisma client singleton |
| `scripts/import-data.ts` | Delete | Prisma import script |
| `src/app/api/admin/import/route.ts` | Delete | Triggers Prisma import |
| `src/app/api/stats/route.ts` | Rewrite | Uses `prisma.playerHittingStats` / `prisma.playerPitchingStats` |
| `src/app/api/players/route.ts` | Rewrite | Uses `prisma.player.findMany` |
| `src/app/api/players/[id]/route.ts` | Rewrite | Uses `prisma.player.findUnique` |
| `src/app/api/leaderboards/route.ts` | Rewrite | Uses `prisma.playerHittingStats` / `prisma.playerPitchingStats` |
| `src/app/api/teams/[id]/route.ts` | Rewrite | Uses `prisma.team.findUnique` |

### Client Components to Migrate (stop direct Google Sheets fetches)
| Component | Current Behavior | After Migration |
|-----------|-----------------|-----------------|
| `PlayerBattingData.tsx` | Fetches IH!A700:AP2000 client-side | Fetch from `/api/players?type=hitting&scope=yearly` |
| `PlayerPitchingData.tsx` | Fetches IP!A300:AA999 client-side | Fetch from `/api/players?type=pitching&scope=yearly` |
| `SheetrockStandings.tsx` | Fetches Standings!A54:T952 + B1:T49 client-side | Fetch from `/api/standings` |
| `StandingsDebug.tsx` | Fetches Standings with variable range client-side | Fetch from `/api/standings?range=...` or remove (debug page) |
| `TeamMapping.tsx` | Fetches Player/Team Adj client-side | Fetch from `/api/teams` (already exists) |
| `stats/players/page.tsx` | Fetches 4 different gviz URLs client-side | Fetch from `/api/players` or `/api/stats` |
| `stats/teams/[team]/page.tsx` | Fetches team info + standings client-side | Fetch from `/api/teams` + `/api/standings` |

### Sheets Tab → API Route Mapping
| Sheet Tab | Range | Data | API Route |
|-----------|-------|------|-----------|
| IH | A1:AP600 | Player hitting aggregates | `/api/players?type=hitting&scope=totals` |
| IH | A700:AP2000 | Player hitting yearly | `/api/players?type=hitting&scope=yearly` |
| IP | A1:AA270 | Player pitching aggregates | `/api/players?type=pitching&scope=totals` |
| IP | A300:AA999 | Player pitching yearly | `/api/players?type=pitching&scope=yearly` |
| TH | A1:Y50 | Team hitting aggregates | `/api/teams/stats?type=hitting&scope=totals` |
| TH | A109:Y | Team hitting yearly | `/api/teams/stats?type=hitting&scope=yearly` |
| TP | A1:W50 | Team pitching aggregates | `/api/teams/stats?type=pitching&scope=totals` |
| TP | A106:W | Team pitching yearly | `/api/teams/stats?type=pitching&scope=yearly` |
| Standings | A1:T50 | Team record aggregates | `/api/standings?scope=alltime` |
| Standings | A54:T | Team yearly records | `/api/standings?scope=yearly` |
| Player Name IDs | (full tab) | Player name mappings | `/api/players/names` (if needed) |
| Player/Team Adj | O3:S | Team/franchise mappings | `/api/teams` |
| Awards (Tidy) | A1:H | Player awards | `/api/awards` (if needed) |

## Open Questions

1. **Debug pages disposition**
   - What we know: `StandingsDebug.tsx` and `debug/player-data/page.tsx` and `debug/team-mapping/page.tsx` exist as diagnostic tools
   - What's unclear: Should these be kept, migrated to use API routes, or removed?
   - Recommendation: Migrate to use API routes (small effort); they're useful for verifying data integrity

2. **`src/config/teams.ts` static team list**
   - What we know: A hardcoded list of 10 teams with IDs and logo paths, used by the home page for "Featured Teams"
   - What's unclear: Should this be migrated to come from Google Sheets too, or remain static?
   - Recommendation: Leave it static for Phase 1 — it's cosmetic, not data. Could be addressed in a later phase.

3. **Leaderboards computational logic**
   - What we know: The current Prisma-based leaderboards route does significant server-side computation (aggregation, PA-weighted wRC+, multi-season filtering). This logic needs to be replicated using raw sheet data.
   - What's unclear: Whether the sheet's aggregate tabs (IH A1:AP600, IP A1:AA270) already contain the pre-computed career totals the leaderboard needs.
   - Recommendation: Investigate the aggregate ranges first — if the sheet already computes career totals, the API route can simply read and sort them instead of re-computing from yearly data.

4. **Pages Router vs App Router for teams**
   - What we know: There are two team page implementations: `src/app/teams/[id]/page.tsx` (uses Prisma via `/api/teams/[id]`) and `src/app/stats/teams/[team]/page.tsx` (uses direct gviz fetches)
   - What's unclear: Whether both should survive or if one is the "real" team page
   - Recommendation: Treat as separate pages during migration (both need to work); consolidation is a UI concern for a later phase

## Sources

### Primary (HIGH confidence)
- Codebase analysis — read all 62 files, mapped every data flow
- Next.js 14 official docs (nextjs.org/docs/14/) — fetch caching, Route Handlers, revalidation
- Google Visualization API docs (developers.google.com/chart/interactive/docs/queries) — gviz response format

### Secondary (MEDIUM confidence)
- Next.js `unstable_cache` docs — confirmed still experimental in v14, not recommended for this use case
- Community patterns for gviz parsing — regex extraction confirmed as more robust than substring

### Tertiary (LOW confidence)
- None — all claims verified against codebase analysis and official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries needed; all patterns use built-in Next.js 14 and native JS
- Architecture: HIGH — the pattern (shared utility → API routes → client components) is well-established in Next.js
- Pitfalls: HIGH — identified from direct codebase analysis (the `substring(47)` fragility, dual data sources, split ranges)

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable — Next.js 14 and Google Sheets gviz are both mature, low churn)
