---
phase: 05-design-polish
plan: 03
subsystem: ui
tags: [tailwind, dark-mode, theme-tokens, prose-invert, skeleton, error-state]

requires:
  - phase: 05-design-polish/01
    provides: CSS custom property theme system, semantic Tailwind tokens, Skeleton and ErrorState components
  - phase: 04-content-pages
    provides: All 8 content pages exist and need theme migration
provides:
  - All content pages using unified semantic theme tokens
  - Dark mode support for prose content (rules, news articles)
  - Loading skeletons and error states on archives and media pages
  - SeasonAccordion themed for light/dark mode
affects: [05-design-polish, 06-infrastructure]

tech-stack:
  added: []
  patterns: [dark:prose-invert for markdown content, ErrorState retry pattern with retryCount]

key-files:
  created: []
  modified:
    - src/app/news/page.tsx
    - src/app/news/[slug]/page.tsx
    - src/app/rules/page.tsx
    - src/app/archives/page.tsx
    - src/app/info/page.tsx
    - src/app/hall-of-fame/page.tsx
    - src/app/schedule/page.tsx
    - src/app/media/page.tsx
    - src/components/SeasonAccordion.tsx

key-decisions:
  - "News page is server-rendered — no client-side skeleton needed"
  - "Archives stale banner uses bg-brand-gold/10 with border-brand-gold/30"
  - "SeasonAccordion uses hover:bg-table-hover for consistent interactive feedback"

patterns-established:
  - "Content page headers: bg-brand-navy text-white py-16"
  - "Stale data banners: bg-brand-gold/10 border border-brand-gold/30 text-content-primary"
  - "Error retry pattern: error + retryCount state, retryCount in useEffect deps"

duration: 6min
completed: 2026-03-05
---

# Phase 5 Plan 3: Content Page Theme Migration Summary

**Migrated all 8 content pages to semantic theme tokens with dark:prose-invert for prose content, loading skeletons on archives/media, and error states with retry**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-05T06:00:00Z
- **Completed:** 2026-03-05T06:06:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- All 8 content pages migrated from hardcoded gray/navy colors to semantic theme tokens (bg-surface-card, text-content-primary, border-border, etc.)
- Rules page and news article prose get dark:prose-invert for readable dark mode
- Hall of Fame cards fully themed: bg-surface-card, bg-surface-secondary stat boxes, bg-brand-navy initials circle
- Archives stale data banner restyled to brand-gold theme
- SeasonAccordion migrated to theme tokens with hover:bg-table-hover
- Archives page shows TableSkeleton while loading, ErrorState with retry on failure
- Media page shows CardSkeleton grid while loading, ErrorState with retry on failure

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply theme tokens and dark mode to content pages** - `814d80e` (feat)
2. **Task 2: Add loading skeletons and error states** - `1f50d09` (feat)

## Files Created/Modified
- `src/app/news/page.tsx` - Theme tokens on article cards, featured badges, links
- `src/app/news/[slug]/page.tsx` - Theme tokens on article detail, dark:prose-invert on content
- `src/app/rules/page.tsx` - Theme tokens, dark:prose-invert on rules prose
- `src/app/archives/page.tsx` - Theme tokens, stale banner restyle, TableSkeleton + ErrorState
- `src/app/info/page.tsx` - Theme tokens on all sections, map iframe unchanged
- `src/app/hall-of-fame/page.tsx` - Theme tokens on cards, stat boxes, awards badges
- `src/app/schedule/page.tsx` - Theme tokens on heading and description
- `src/app/media/page.tsx` - Theme tokens, CardSkeleton + ErrorState with retry
- `src/components/SeasonAccordion.tsx` - Theme tokens on border, background, hover, text

## Decisions Made
- News listing page is server-rendered (synchronous getNewsArticles), so no client-side skeleton needed — only archives and media have client-side data fetching
- Archives stale banner uses bg-brand-gold/10 with border-brand-gold/30 (consistent with 05-02 pattern)
- SeasonAccordion button uses hover:bg-table-hover for interactive consistency with stats tables

## Deviations from Plan

None — plan executed exactly as written. The only note is that the news listing page turned out to be server-rendered rather than client-side, so it didn't need a loading skeleton (plan allowed for this with "if it has a loading state" conditional).

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All content pages now use the unified theme system
- Ready for 05-04-PLAN.md: Stats table visual polish (team logos, headshots, awards, dropdowns) + mobile responsive pass
- Pre-existing build prerender errors on `/`, `/stats/players`, `/stats/teams` are unrelated to this plan (likely addressed by 05-02 running in parallel)

---
*Phase: 05-design-polish*
*Completed: 2026-03-05*
