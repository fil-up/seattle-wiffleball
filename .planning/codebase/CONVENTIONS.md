# Coding Conventions

**Analysis Date:** 2025-02-23

## Naming Patterns

**Files:**
- Page components: `page.tsx` (Next.js App Router convention)
- Components: PascalCase, e.g. `StatsTable.tsx`, `PageNavigation.tsx`, `PlayerBattingData.tsx`
- Lib modules: camelCase, e.g. `news.ts`, `prisma.ts`
- Config: camelCase, e.g. `teams.ts`, `teamCodeLogos.ts`
- API routes: `route.ts` in `app/api/*/` directories

**Functions:**
- Components: PascalCase, e.g. `export default function StatsTable`, `export default function Home`
- Utilities: camelCase, e.g. `getNewsArticles`, `getFeaturedArticle`, `resolveTeamByCode`
- API handlers: HTTP verb names, e.g. `GET`, `POST`

**Variables:**
- camelCase for variables and state, e.g. `selectedYear`, `visibleStats`, `totalsPaQual`
- UPPER_SNAKE_CASE for constants, e.g. `TEAM_CODE_MAP`, `DEFAULT_LOGO`

**Types:**
- Interfaces: PascalCase, e.g. `StatsTableProps<T>`, `NewsArticle`, `StatsFilterProps`
- Type aliases: PascalCase, e.g. `Team`, `TeamCodeMeta`, `ArticlePageProps`
- Props interfaces: `ComponentNameProps` pattern

## Code Style

**Formatting:**
- No Prettier config detected; relies on editor defaults
- Double quotes for strings in some files (`"react"`), single quotes in others (`'next/link'`); mixed usage
- 2-space indentation observed

**Linting:**
- ESLint via `eslint-config-next` (Next.js 14.0.3)
- Run: `npm run lint` (runs `next lint`)
- Inline disables used for `@next/next/no-img-element` when using raw `<img>` instead of Next `Image`, e.g. in `src/app/teams/[id]/page.tsx`, `src/app/teams/page.tsx`

## Import Organization

**Order:**
1. React/Next.js: `import Link from 'next/link'`, `import Image from 'next/image'`, `import { useState, useEffect } from 'react'`
2. Type imports: `import type { Metadata } from 'next'`
3. Local aliases: `import { teams } from '@/config/teams'`, `import PageNavigation from '@/components/PageNavigation'`
4. Third-party: `import { useReactTable, ... } from '@tanstack/react-table'`

**Path Aliases:**
- `@/*` maps to `./src/*` (from `tsconfig.json` paths)
- Use `@/components/`, `@/lib/`, `@/config/`, `@/data/`, `@/types/` for imports

**Client vs Server:**
- `"use client"` at top of file for client components (e.g. `src/app/page.tsx`, `src/app/stats/players/page.tsx`)
- Server components omit directive

## Error Handling

**API Routes:**
- Try/catch around async logic
- `console.error('Error ...:', error)` in catch blocks
- Return `NextResponse.json({ error: '...' }, { status: 500 })` for server errors
- Return `NextResponse.json({ error: '...' }, { status: 400 })` for validation/bad request
- Return `NextResponse.json({ error: '...' }, { status: 404 })` for not found
- Return `NextResponse.json({ error: '...' }, { status: 401 })` for unauthorized

Example from `src/app/api/players/[id]/route.ts`:
```typescript
} catch (error) {
  console.error('Error fetching player:', error)
  return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 })
}
```

**Client-Side Fetch:**
- Try/catch in async handlers
- `console.error` for logging
- `setLoading(false)` in both success and catch paths
- No user-facing error UI; loading state reverts

**Not Found:**
- Use `notFound()` from `next/navigation` for missing resources (e.g. `src/app/news/[slug]/page.tsx`)

## Logging

**Framework:** `console` only; no structured logger

**Patterns:**
- `console.error` for caught errors in API routes and client fetch handlers
- `console.log` used for debug in some components (e.g. `src/app/stats/teams/[team]/page.tsx`, `src/components/PlayerBattingData.tsx`) — should be removed for production

**When to Log:**
- API routes: log errors in catch blocks
- Client: log errors in fetch catch blocks; avoid debug logs in production

## Comments

**When to Comment:**
- Section markers in JSX: `{/* Top Blue Navigation Bar (sticky) */}`, `{/* Hero Section */}`
- Column mapping in data processing: `// Year column`, `// GP column`
- Inline eslint disables with reason

**JSDoc/TSDoc:**
- Not used; no JSDoc on exported functions or types

## Function Design

**Size:**
- Some page components are large (e.g. `src/app/page.tsx` ~330 lines, `src/app/stats/players/page.tsx` ~385 lines)
- Prefer smaller, focused components where feasible

**Parameters:**
- Destructured props: `{ data, columns, initialSortField }: StatsTableProps<T>`
- Default values for optional props: `initialSortDesc = true`, `showPagination = true`

**Return Values:**
- Components return JSX
- API handlers return `NextResponse.json(...)`
- Lib functions return typed data or `null`

## Module Design

**Exports:**
- Default export for page components and UI components
- Named exports for lib functions and shared types
- Barrel files: not used; direct imports from module paths

**Barrel Files:**
- None; import directly from `@/lib/news`, `@/components/StatsTable`, etc.

---

*Convention analysis: 2025-02-23*
