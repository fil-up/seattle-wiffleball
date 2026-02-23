# Codebase Structure

**Analysis Date:** 2025-02-23

## Directory Layout

```
seattle-wiffleball/
├── prisma/
│   ├── schema.prisma       # Prisma schema (Player, Team, stats models)
│   └── dev.db              # SQLite database (gitignored)
├── scripts/
│   └── import-data.ts      # Google Sheets → Prisma ETL
├── src/
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   │   ├── admin/import/route.ts
│   │   │   ├── leaderboards/route.ts
│   │   │   ├── players/[id]/route.ts
│   │   │   ├── players/route.ts
│   │   │   ├── stats/route.ts
│   │   │   ├── teams/[id]/route.ts
│   │   │   └── teams/route.ts
│   │   ├── debug/         # Debug/dev pages
│   │   │   ├── player-data/page.tsx
│   │   │   └── team-mapping/page.tsx
│   │   ├── leaderboards/page.tsx
│   │   ├── news/
│   │   │   ├── [slug]/page.tsx
│   │   │   └── page.tsx
│   │   ├── stats/
│   │   │   ├── players/page.tsx
│   │   │   └── teams/
│   │   │       ├── [team]/page.tsx
│   │   │       └── page.tsx
│   │   ├── teams/
│   │   │   ├── [id]/page.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── PageNavigation.tsx
│   │   ├── PlayerBattingData.tsx
│   │   ├── PlayerPitchingData.tsx
│   │   ├── SheetrockStandings.tsx
│   │   ├── StandingsDebug.tsx
│   │   ├── StatsFilter.tsx
│   │   ├── StatsTable.tsx
│   │   ├── TeamMapping.tsx
│   │   └── ...
│   ├── config/
│   │   ├── teamCodeLogos.ts
│   │   └── teams.ts
│   ├── data/
│   │   └── news.json
│   ├── lib/
│   │   ├── news.ts
│   │   └── prisma.ts
│   └── types/
│       └── stats.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.js
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and API routes
- Contains: `page.tsx` files, `layout.tsx`, `route.ts`, `globals.css`
- Key files: `layout.tsx`, `page.tsx`, `api/**/route.ts`

**`src/app/api/`:**
- Purpose: Server-side API endpoints
- Contains: Route handlers exporting `GET` or `POST`
- Key files: `players/route.ts`, `teams/route.ts`, `teams/[id]/route.ts`, `stats/route.ts`, `leaderboards/route.ts`, `admin/import/route.ts`

**`src/components/`:**
- Purpose: Reusable React components
- Contains: UI components (tables, filters, navigation, data displays)
- Key files: `StatsTable.tsx`, `StatsFilter.tsx`, `PageNavigation.tsx`, `SheetrockStandings.tsx`, `PlayerBattingData.tsx`, `PlayerPitchingData.tsx`

**`src/config/`:**
- Purpose: Static configuration
- Contains: Team lists, team code mappings
- Key files: `teams.ts`, `teamCodeLogos.ts`

**`src/data/`:**
- Purpose: Static JSON data
- Contains: `news.json`
- Key files: `news.json`

**`src/lib/`:**
- Purpose: Shared utilities and data access
- Contains: Prisma client, news helpers
- Key files: `prisma.ts`, `news.ts`

**`src/types/`:**
- Purpose: TypeScript interfaces
- Contains: `stats.ts` (PlayerHittingStats, PlayerPitchingStats, etc.)
- Key files: `stats.ts`

**`prisma/`:**
- Purpose: Database schema and migrations
- Contains: `schema.prisma`, `dev.db`
- Key files: `schema.prisma`

**`scripts/`:**
- Purpose: CLI and ETL scripts
- Contains: `import-data.ts`
- Key files: `import-data.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout, metadata, footer
- `src/app/page.tsx`: Home page
- `next.config.js`: Next.js config (images unoptimized)

**Configuration:**
- `tsconfig.json`: Path alias `@/*` → `./src/*`
- `tailwind.config.ts`: Tailwind CSS
- `prisma/schema.prisma`: Database schema

**Core Logic:**
- `src/lib/prisma.ts`: Prisma client singleton
- `src/lib/news.ts`: News loading and markdown-to-HTML
- `scripts/import-data.ts`: Google Sheets → Prisma import

**API Routes:**
- `src/app/api/players/route.ts`: List players (Prisma)
- `src/app/api/players/[id]/route.ts`: Single player (Prisma)
- `src/app/api/teams/route.ts`: List teams (Google Sheets)
- `src/app/api/teams/[id]/route.ts`: Single team (Prisma)
- `src/app/api/stats/route.ts`: Hitting/pitching stats (Prisma)
- `src/app/api/leaderboards/route.ts`: Leaderboards (Prisma)
- `src/app/api/admin/import/route.ts`: Trigger import script

**Testing:**
- Not detected (no `*.test.*`, `*.spec.*`, `jest.config`, `vitest.config`)

## Naming Conventions

**Files:**
- Pages: `page.tsx` (App Router)
- API routes: `route.ts`
- Components: PascalCase (e.g. `StatsTable.tsx`, `PageNavigation.tsx`)
- Config/lib: camelCase (e.g. `teams.ts`, `news.ts`)

**Directories:**
- Route segments: lowercase, kebab-case for multi-word (e.g. `stats/players`, `stats/teams`)
- Dynamic segments: `[id]`, `[slug]`, `[team]`

**Exports:**
- Default export for pages, components, and API route handlers
- Named exports for config and lib (e.g. `teams`, `getTeamById`, `prisma`)

## Where to Add New Code

**New Page:**
- Add `src/app/[route]/page.tsx`
- Use `PageNavigation` if it should have the shared nav bar
- Follow existing pattern: `"use client"`, `useState`/`useEffect`, `fetch` or lib calls

**New API Endpoint:**
- Add `src/app/api/[name]/route.ts` or `src/app/api/[name]/[param]/route.ts`
- Export `GET` or `POST` handler
- Use `prisma` from `@/lib/prisma` for DB access

**New Component:**
- Add `src/components/[Name].tsx`
- Use `@/` path alias for imports
- Prefer composition with existing components (e.g. `StatsTable`, `StatsFilter`)

**New Config or Type:**
- Config: `src/config/[name].ts`
- Types: `src/types/[name].ts` or inline in component

**New Data Source:**
- Static: `src/data/[name].json` + lib in `src/lib/`
- Dynamic: Add API route or extend `scripts/import-data.ts`

## Special Directories

**`src/app/debug/`:**
- Purpose: Debug and development pages
- Contains: `player-data/page.tsx`, `team-mapping/page.tsx`
- Generated: No
- Committed: Yes

**`public/images/`:**
- Purpose: Static images (logos, hero)
- Contains: Team logos, `seattle-wiffleball-logo.png`, `game-highlights.gif`
- Generated: No
- Committed: Yes

**`prisma/dev.db`:**
- Purpose: SQLite database
- Generated: Yes (by `prisma db push` or import)
- Committed: Typically gitignored
