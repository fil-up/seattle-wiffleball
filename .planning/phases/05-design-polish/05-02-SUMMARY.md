---
phase: 05-design-polish
plan: 02
subsystem: ui
tags: [tailwind, theme-tokens, skeleton, error-state, dark-mode, loading]

requires:
  - phase: 05-design-polish
    provides: CSS custom property theme system, Skeleton/ErrorState components, SiteNavigation
provides:
  - All 8 core pages using semantic theme tokens (dark mode ready)
  - Skeleton loading states on all data-fetching pages
  - ErrorState with retry on all data-fetching pages
  - Brand-styled stale data banners
affects: [05-design-polish, 06-infrastructure]

tech-stack:
  added: []
  patterns: [retryCount state for fetch retry, error-before-loading render priority]

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/app/stats/players/page.tsx
    - src/app/stats/players/[id]/page.tsx
    - src/app/stats/teams/page.tsx
    - src/app/stats/teams/[team]/page.tsx
    - src/app/teams/page.tsx
    - src/app/teams/[id]/page.tsx
    - src/app/leaderboards/page.tsx
    - src/components/StandingsWidget.tsx
    - src/components/LeaderboardPodium.tsx
    - src/components/PlayerBattingData.tsx
    - src/components/PlayerPitchingData.tsx

key-decisions:
  - "Error states render before loading checks for priority visibility"
  - "retryCount in useEffect deps for clean retry without full remount"
  - "StandingsWidget keeps existing skeleton (adequate) rather than importing TableSkeleton"
  - "Stale banners use bg-brand-gold/10 with inline SVG warning icon"

patterns-established:
  - "Retry pattern: retryCount state + setError(false) + setRetryCount(c => c+1)"
  - "Error > Loading > Empty > Content render priority chain"

duration: 12min
completed: 2026-03-05
---

# Phase 5 Plan 2: Core Page Migration Summary

**Removed inline home page navigation, migrated all 8 core pages and 4 shared components to semantic theme tokens, added TableSkeleton/CardSkeleton loading and ErrorState retry to every data-fetching page**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-05T06:00:00Z
- **Completed:** 2026-03-05T06:12:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Removed 50-line inline sticky navigation bar from home page (SiteNavigation in layout.tsx handles all navigation)
- Replaced all hardcoded gray/white/blue Tailwind classes with semantic theme tokens across 8 page files and 4 shared components
- Restyled stale data banners from yellow to brand-gold/10 with SVG warning icon for consistent theming
- Added TableSkeleton/CardSkeleton loading placeholders to 7 data-fetching pages (replacing bare "Loading..." text)
- Added ErrorState with retry button to 7 data-fetching pages with retryCount mechanism

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove old navigation and apply theme tokens** - `41ffd5b` (feat)
2. **Task 2: Add skeleton loading and error states** - `973325e` (feat)

## Files Created/Modified
- `src/app/page.tsx` - Removed inline nav, applied theme tokens to hero, news, videos, quick links sections
- `src/app/stats/players/page.tsx` - Theme tokens on controls/banners, TableSkeleton + ErrorState with retry
- `src/app/stats/players/[id]/page.tsx` - Theme tokens on career stats tables, TableSkeleton + ErrorState
- `src/app/stats/teams/page.tsx` - Theme tokens on team cards/standings, CardSkeleton + ErrorState
- `src/app/stats/teams/[team]/page.tsx` - Theme tokens on yearly records/selectors, TableSkeleton + ErrorState
- `src/app/teams/page.tsx` - Theme tokens on team grid, CardSkeleton + ErrorState
- `src/app/teams/[id]/page.tsx` - Theme tokens on roster/stats/summary cards, CardSkeleton + TableSkeleton + ErrorState
- `src/app/leaderboards/page.tsx` - Theme tokens on podium cards, CardSkeleton + ErrorState
- `src/components/StandingsWidget.tsx` - Theme tokens on table, links, skeleton (kept existing skeleton)
- `src/components/LeaderboardPodium.tsx` - Theme tokens on podium config, player links, rankings
- `src/components/PlayerBattingData.tsx` - Theme tokens on table/headers/rows, brand-styled stale banner
- `src/components/PlayerPitchingData.tsx` - Theme tokens on table/headers/rows, brand-styled stale banner

## Decisions Made
- Error states render before loading checks so users see retry buttons immediately on failure
- Used retryCount state in useEffect deps for clean retry without unmounting the component
- Kept StandingsWidget's existing animate-pulse skeleton rather than importing TableSkeleton (it's already adequate and themed)
- Stale banners use `bg-brand-gold/10 border-brand-gold/30` with inline SVG warning icon for brand consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 core pages fully themed with semantic tokens and dark mode support
- Loading and error states provide polished UX on all data-fetching pages
- Ready for 05-04-PLAN.md: Stats table visual polish, team logos, headshots, awards, mobile responsive pass
- PageNavigation/Navigation components still exist but are no longer imported by any core page (05-04 will delete them)

---
*Phase: 05-design-polish*
*Completed: 2026-03-05*
