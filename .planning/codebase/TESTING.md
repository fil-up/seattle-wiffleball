# Testing Patterns

**Analysis Date:** 2025-02-23

## Test Framework

**Runner:**
- Not detected
- No Jest, Vitest, or other test runner in `package.json` or config files

**Assertion Library:**
- None (no tests present)

**Run Commands:**
```bash
# No test script in package.json
# npm run test — not defined
```

**Current `package.json` scripts:**
- `dev`, `build`, `start`, `lint`, `prisma:generate`, `prisma:push`, `import`
- No `test` or `test:watch` or `test:coverage` scripts

## Test File Organization

**Location:**
- No test files found
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` in the codebase

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Test Structure

**Suite Organization:**
- Not applicable

**Patterns:**
- Not applicable

## Mocking

**Framework:**
- Not applicable (no tests)

**Patterns:**
- Not applicable

**What to Mock (when adding tests):**
- `@/lib/prisma` — Prisma client for API route tests
- `fetch` / `window.fetch` — for client components that fetch data
- `next/navigation` — `useParams`, `notFound`, `useRouter`
- External scripts (e.g. GameChanger SDK in `src/app/page.tsx`)

**What NOT to Mock:**
- Pure utility functions in `src/lib/news.ts`, `src/config/teamCodeLogos.ts` — test directly

## Fixtures and Factories

**Test Data:**
- Not applicable

**Location:**
- Suggested: `src/__tests__/fixtures/` or `__mocks__/` when introducing tests
- `src/data/news.json` could serve as fixture for news-related tests

## Coverage

**Requirements:**
- None enforced

**View Coverage:**
- Not applicable

## Test Types

**Unit Tests:**
- Not used
- Good candidates: `src/lib/news.ts` (getNewsArticles, getFeaturedArticle, getNewsArticleWithHtml, convertMarkdownToHtml), `src/config/teamCodeLogos.ts` (resolveTeamByCode), `src/config/teams.ts` (getTeamById, getTeamByName)

**Integration Tests:**
- Not used
- Good candidates: API routes in `src/app/api/` (stats, players, teams, leaderboards)

**E2E Tests:**
- Not used
- No Playwright, Cypress, or similar

## Recommended Setup (When Adding Tests)

**For Next.js 14 + TypeScript:**

1. **Vitest** (recommended for unit/integration):
   - `npm install -D vitest @vitejs/plugin-react jsdom`
   - Config: `vitest.config.ts` with path alias `@/*` matching tsconfig
   - Add `"test": "vitest"`, `"test:run": "vitest run"`, `"test:coverage": "vitest run --coverage"` to `package.json`

2. **React Testing Library** (for component tests):
   - `npm install -D @testing-library/react @testing-library/jest-dom`
   - Use with Vitest

3. **File placement:**
   - Co-located: `StatsTable.test.tsx` next to `StatsTable.tsx`
   - Or centralized: `src/__tests__/lib/news.test.ts`, `src/__tests__/components/StatsTable.test.tsx`

4. **API route testing:**
   - Use `next/test-utils` or call route handlers directly with mocked `Request`
   - Mock `@/lib/prisma` with `vi.mock('@/lib/prisma')`

## Common Patterns (For Future Use)

**Async Testing:**
```typescript
it('fetches news articles', async () => {
  const articles = getNewsArticles()
  expect(articles).toBeDefined()
  expect(Array.isArray(articles)).toBe(true)
})
```

**Error Testing:**
```typescript
it('returns null for unknown slug', () => {
  expect(getNewsArticle('nonexistent')).toBeNull()
})
```

**Component Testing:**
```typescript
import { render, screen } from '@testing-library/react'
import StatsFilter from '@/components/StatsFilter'

it('renders year select when years provided', () => {
  render(<StatsFilter years={[2023, 2024]} selectedYear={2024} onYearChange={() => {}} qualified={true} onQualifiedChange={() => {}} />)
  expect(screen.getByLabelText(/season/i)).toBeInTheDocument()
})
```

---

*Testing analysis: 2025-02-23*
