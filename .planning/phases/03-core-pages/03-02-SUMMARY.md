---
phase: "03-core-pages"
plan: "02"
subsystem: "pages"
tags: ["home", "schedule", "media", "standings", "youtube", "layout"]

dependency_graph:
  requires: ["03-01"]
  provides: ["Restructured home page with standings sidebar", "Schedule page with full GC widget", "Media page with YouTube gallery", "StandingsWidget component"]
  affects: ["03-04"]

tech_stack:
  added: []
  patterns: ["two-column layout with sidebar", "conditional rendering based on API data", "client-side fetch with empty state handling"]

key_files:
  created:
    - src/components/StandingsWidget.tsx
    - src/app/schedule/page.tsx
    - src/app/media/page.tsx
  modified:
    - src/app/page.tsx

decisions:
  - id: "03-02-01"
    description: "Featured Teams section removed — standings widget covers team visibility"
  - id: "03-02-02"
    description: "Home page YouTube section conditional — only renders if channel ID is configured"
  - id: "03-02-03"
    description: "Quick Links expanded to 4 cards (added Schedule) with 4-column grid"

metrics:
  duration: "5 min"
  completed: "2026-03-04"
---

# Phase 03 Plan 02: Home Page Restructure + Schedule & Media Pages Summary

**One-liner:** Restructured home page with standings sidebar and compact GC widget, created Schedule page with full scoreboard, and Media page with YouTube gallery and graceful empty state.

## What Was Done

### Task 1: Create StandingsWidget and restructure home page

**StandingsWidget (`src/components/StandingsWidget.tsx`):**
- Client component that fetches `/api/standings?scope=yearly` on mount
- Filters to most recent year, sorts by win percentage descending, limits to top 10
- Compact card with rank, team, W-L, PCT columns
- Skeleton loading state and empty state handling
- Links to full standings at `/stats/teams`

**Home page restructure (`src/app/page.tsx`):**
- Removed inline `GameChangerWidget` function definition — now imports shared component from `@/components/GameChangerWidget` with `maxGames={2}`
- Removed entire Featured Teams section
- Added two-column layout: news (2/3) + standings sidebar (1/3) with mobile stacking
- Featured article displayed as large card, 2-3 recent articles as smaller cards below
- Added conditional "Latest Videos" section — fetches `/api/youtube?limit=3`, only renders if data exists
- Added Schedule and Media links to inline nav bar (matching PageNavigation's link set)
- Expanded Quick Links from 3 to 4 cards (added Schedule)
- Removed unused `teams` import and `useEffect`-only import

### Task 2: Create Schedule and Media pages

**Schedule page (`src/app/schedule/page.tsx`):**
- PageNavigation at top for consistent nav
- "Schedule & Scores" heading with description text
- Full-width `GameChangerWidget` with `maxGames={10}` for browsing the full schedule

**Media page (`src/app/media/page.tsx`):**
- PageNavigation at top for consistent nav
- Fetches `/api/youtube?limit=12` on mount
- Three states: loading (skeleton grid), empty (camera icon + friendly message), populated (3-column responsive grid)
- Each video cell: `YouTubeEmbed` component + title text below

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

1. `npx tsc --noEmit` — passes
2. No inline GameChangerWidget function in page.tsx — confirmed
3. No Featured Teams section — confirmed
4. Two-column news + standings layout — confirmed
5. `/schedule` and `/media` pages exist and build without errors — confirmed
6. `npm run build` — completes successfully

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 428cc6b | feat(03-02): create StandingsWidget and restructure home page |
| 2 | 707232a | feat(03-02): create Schedule and Media pages |

## Next Phase Readiness

Phase 03 is now complete (4/4 plans). All core pages are built:
- Home page with hero, GC widget, news+standings, optional YouTube, quick links
- Stats pages (players, teams, team detail) from 03-03
- Schedule page with full scoreboard
- Media page with YouTube gallery
- Shared components (PageNavigation, GameChangerWidget, YouTubeEmbed, StandingsWidget)

No blockers for Phase 4.
