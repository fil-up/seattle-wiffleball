# Architecture

**Analysis Date:** 2025-02-23

## Pattern Overview

**Overall:** Next.js App Router with hybrid data sources (Prisma/SQLite + Google Sheets + static JSON)

**Key Characteristics:**
- Client-side data fetching dominates; most pages use `"use client"` and `fetch()` in `useEffect`
- Dual data sources: Prisma-backed API routes for teams/players/leaderboards vs. direct Google Sheets gviz URLs for player stats, standings, and team lists
- Static config (`teams`, `news.json`) coexists with dynamic DB and Sheets data
- No server components for data; layout is server-rendered but pages are client components

## Layers

**Presentation (Pages):**
- Purpose: Route-level UI, composition of components
- Location: `src/app/**/page.tsx`
- Contains: Client components that fetch data, render layouts, compose shared components
- Depends on: `@/components/*`, `@/config/*`, `@/lib/*`, API routes
- Used by: Next.js routing

**Components:**
- Purpose: Reusable UI (tables, filters, navigation, data displays)
- Location: `src/components/`
- Contains: `StatsTable`, `StatsFilter`, `PageNavigation`, `SheetrockStandings`, `PlayerBattingData`, `PlayerPitchingData`, `TeamMapping`, `StandingsDebug`
- Depends on: React, `@tanstack/react-table`, `Link`, `Image`
- Used by: Pages

**API Routes:**
- Purpose: Server-side data endpoints
- Location: `src/app/api/**/route.ts`
- Contains: GET handlers for players, teams, stats, leaderboards; POST for admin import
- Depends on: `@/lib/prisma`, `NextResponse`
- Used by: Client `fetch()` calls

**Data / Lib:**
- Purpose: Data access, shared utilities, config
- Location: `src/lib/`, `src/config/`, `src/data/`, `src/types/`
- Contains: `prisma.ts`, `news.ts`, `teams.ts`, `teamCodeLogos.ts`, `news.json`, `stats.ts`
- Depends on: Prisma, JSON imports
- Used by: API routes, pages, components

**Database:**
- Purpose: Persistent storage for players, teams, stats
- Location: `prisma/schema.prisma`, `prisma/dev.db`
- Contains: Player, Team, PlayerTeam, PlayerHittingStats, PlayerPitchingStats, TeamStats
- Depends on: Prisma client
- Used by: API routes, import script

**Import / Scripts:**
- Purpose: ETL from Google Sheets to Prisma
- Location: `scripts/import-data.ts`
- Contains: Google Sheets API/CSV fetch, team mapping, hitting/pitching/standings import
- Depends on: Prisma, googleapis, axios
- Used by: CLI (`npm run import`) or `POST /api/admin/import`

## Data Flow

**Player Stats (Stats/Players page):**
1. `src/app/stats/players/page.tsx` fetches directly from Google Sheets gviz URLs (IH, IP tabs)
2. Parses JSON response, maps cells to hitting/pitching rows
3. Filters by year, qualified, totals qualifiers
4. Renders via `StatsTable` with `StatsFilter`

**Teams Index (Stats/Teams page):**
1. `src/app/stats/teams/page.tsx` fetches `/api/teams`
2. `/api/teams/route.ts` fetches Google Sheets `Player/Team Adj` and returns team list (no Prisma)
3. `SheetrockStandings` fetches Standings sheet directly from gviz

**Team Detail (Stats/Teams/[team]):**
1. `src/app/stats/teams/[team]/page.tsx` fetches team metadata from Sheets `Player/Team Adj` and yearly records from `Standings`
2. `PlayerBattingData` and `PlayerPitchingData` fetch from IH/IP gviz URLs with team filter

**Teams Index (Legacy /teams):**
1. `src/app/teams/page.tsx` fetches `/api/teams` (different route returns Prisma teams)
2. `/api/teams/route.ts` in this context returns Prisma teams—there is a conflict: `/api/teams` fetches Sheets in the current codebase
3. `src/app/teams/[id]/page.tsx` fetches `/api/teams/[id]` which uses Prisma

**Leaderboards:**
1. `src/app/leaderboards/page.tsx` fetches `/api/leaderboards` with category, year, stat, limit
2. `src/app/api/leaderboards/route.ts` queries Prisma, aggregates by player for all-time, returns top N

**News:**
1. Pages call `getNewsArticles()`, `getNewsArticleWithHtml()` from `src/lib/news.ts`
2. Data comes from `src/data/news.json`; markdown converted to HTML in lib

**Admin Import:**
1. `POST /api/admin/import` with `x-import-secret` header
2. Spawns `ts-node scripts/import-data.ts`
3. Script uses Google Sheets API or CSV fallback, upserts into Prisma

**State Management:**
- No global state library; each page manages local `useState` and `useEffect`
- Filter state (year, qualified, scope) lives in page components and is passed to children

## Key Abstractions

**Prisma Client:**
- Singleton in `src/lib/prisma.ts` to avoid multiple instances in dev
- Used by: `/api/players`, `/api/players/[id]`, `/api/teams/[id]`, `/api/stats`, `/api/leaderboards`, `scripts/import-data.ts`

**StatsTable:**
- Generic table component using `@tanstack/react-table`
- Accepts `data`, `columns`, `initialSortField`, pagination, sticky columns
- Examples: `src/app/stats/players/page.tsx`, `src/components/StatsTable.tsx`

**PageNavigation:**
- Shared nav bar (Home, News, Players, Teams, Leaderboards)
- Used by: stats pages, leaderboards, teams; not on home (home has its own nav)

**SheetrockStandings:**
- Fetches Google Sheets Standings via gviz, parses JSON, displays yearly and all-time tabs
- Location: `src/components/SheetrockStandings.tsx`

**Team Config Duplication:**
- `src/config/teams.ts`: static list for home page featured teams
- `src/config/teamCodeLogos.ts`: code → name/logo mapping
- API/Sheets: dynamic team list from `Player/Team Adj`
- Prisma: Team model with `name`, `abbr`, `logoUrl`

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Metadata, Inter font, global CSS, footer, wraps `{children}`

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: `/`
- Responsibilities: Hero, GameChanger widget, featured teams (from config), news preview (from lib), quick links

**API Routes:**
- `GET /api/players` – Prisma players with hitting/pitching/teams
- `GET /api/players/[id]` – Single player
- `GET /api/teams` – Google Sheets team list (Player/Team Adj)
- `GET /api/teams/[id]` – Prisma team with stats and roster
- `GET /api/stats` – Prisma hitting/pitching stats, sorted
- `GET /api/leaderboards` – Prisma leaderboards, single stat, year or all-time
- `POST /api/admin/import` – Runs import script

## Error Handling

**Strategy:** Try/catch in API routes and scripts; `console.error` + `NextResponse.json` with status codes

**Patterns:**
- API: `catch (error) { console.error(...); return NextResponse.json({ error: '...' }, { status: 500 })`
- Client: `fetch().then().catch()`; loading/error state in components
- No centralized error boundary or error page customization observed

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` in API routes and components (e.g. `stats/teams/[team]/page.tsx`)

**Validation:** Minimal; query params parsed with `parseInt`, `searchParams.get()`; no Zod or similar

**Authentication:** None for public pages; `POST /api/admin/import` uses `IMPORT_SECRET` env var
