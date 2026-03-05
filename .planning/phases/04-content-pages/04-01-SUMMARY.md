---
phase: 04-content-pages
plan: 01
subsystem: content
tags: [gray-matter, remark, remark-html, markdown, news, api-route]

# Dependency graph
requires:
  - phase: 03-core-pages
    provides: home page with news section, PageNavigation component
provides:
  - markdown-based news system with frontmatter parsing
  - /api/news endpoint for client-side consumption
  - async article rendering with remark HTML processing
affects: [06-infrastructure-launch]

# Tech tracking
tech-stack:
  added: [gray-matter@4.0.3, remark-html@16.0.1]
  patterns: [content-as-markdown with frontmatter, API route for client pages consuming server-only libs]

key-files:
  created:
    - content/news/*.md (6 article files)
    - src/app/api/news/route.ts
  modified:
    - src/lib/news.ts
    - src/app/news/[slug]/page.tsx
    - src/app/page.tsx
    - package.json

key-decisions:
  - "Markdown files in content/news/ at project root (not src/) for clear content/code separation"
  - "API route bridges server-only fs/gray-matter and client-side home page"
  - "remark + remark-html replaces fragile regex-based markdown converter"

patterns-established:
  - "Content-as-markdown: frontmatter for metadata, body for content, gray-matter for parsing"
  - "API bridge pattern: server-only libs exposed via /api/ route for 'use client' consumers"

# Metrics
duration: ~5min
completed: 2026-03-04
---

# Phase 4 Plan 01: News System Migration Summary

**Migrated news from single JSON file to individual markdown files with gray-matter frontmatter and remark-html processing, added /api/news route for client consumption**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-04
- **Completed:** 2026-03-04
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Migrated 6 news articles from `src/data/news.json` to individual `.md` files in `content/news/` with YAML frontmatter
- Refactored `src/lib/news.ts` to use gray-matter for frontmatter parsing and remark+remark-html for article body processing
- Created `/api/news` route so the client-side home page can fetch articles without importing server-only fs modules
- Updated home page to fetch news via API with useState/useEffect pattern
- Updated article detail page with brand-consistent styling (`#25397B`) and PageNavigation
- Deleted `src/data/news.json`

## Task Commits

Each task was committed atomically:

1. **Task 1: Install deps, migrate articles, refactor news lib, create API route** - `f9bfda8` (feat)
2. **Task 2: Update news pages and home page, verify integration, clean up** - `e0d8fde` (feat)

## Files Created/Modified
- `content/news/round-one-playoff-preview.md` - Article markdown with frontmatter
- `content/news/its-crunch-time.md` - Article markdown with frontmatter
- `content/news/in-season-tournament.md` - Article markdown with frontmatter
- `content/news/season-preview.md` - Article markdown with frontmatter
- `content/news/new-seattle-wiffleball-website.md` - Article markdown with frontmatter
- `content/news/kind-of-new-and-somewhat-improved.md` - Article markdown with frontmatter
- `src/app/api/news/route.ts` - GET endpoint returning all articles as JSON
- `src/lib/news.ts` - Refactored: gray-matter + remark instead of JSON + regex
- `src/app/news/[slug]/page.tsx` - Async component with brand colors and PageNavigation
- `src/app/page.tsx` - Client-side news fetch via /api/news, inline NewsArticle type
- `package.json` - Added gray-matter, remark-html dependencies
- `src/data/news.json` - Deleted

## Decisions Made
- Placed markdown files in `content/news/` at project root for clear content/code separation
- Created `/api/news` route to bridge server-only fs/gray-matter and client-side home page
- Used remark + remark-html to replace the fragile regex-based markdown converter from the original codebase

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- News system fully functional with markdown-based content
- Pattern established for future content pages (Rules, Archives, Info can follow similar markdown approach)
- Ready for 04-02-PLAN.md (Rules, Archives, and Info pages)

---
*Phase: 04-content-pages*
*Completed: 2026-03-04*
