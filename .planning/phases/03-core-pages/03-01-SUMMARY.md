---
phase: "03-core-pages"
plan: "01"
subsystem: "shared-components"
tags: ["navigation", "gamechanger", "youtube", "components"]

dependency_graph:
  requires: []
  provides: ["PageNavigation with Schedule/Media links", "GameChangerWidget component", "YouTubeEmbed component", "YouTube API route"]
  affects: ["03-02", "03-03", "03-04"]

tech_stack:
  added: ["react-lite-youtube-embed@3.5.1"]
  patterns: ["lite-embed lazy loading", "RSS feed parsing via regex", "ref-based unique IDs for widget instances"]

key_files:
  created:
    - src/components/GameChangerWidget.tsx
    - src/components/YouTubeEmbed.tsx
    - src/app/api/youtube/route.ts
  modified:
    - src/components/PageNavigation.tsx
    - package.json

decisions:
  - id: "nav-links-array"
    description: "Extracted nav links into a shared array to DRY desktop and mobile rendering"
  - id: "gc-ref-id"
    description: "Use useRef with random string for GameChanger widget target ID (avoids useId colon issues)"
  - id: "youtube-channel-placeholder"
    description: "YouTube API route returns empty array gracefully when CHANNEL_ID is not configured"

metrics:
  duration: "5 min"
  completed: "2026-03-04"
---

# Phase 03 Plan 01: Shared Components & Navigation Fix Summary

**One-liner:** Fixed mobile nav bug, added Schedule/Media links, extracted GameChangerWidget and YouTubeEmbed as reusable components, created YouTube RSS API route with graceful degradation.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Fix PageNavigation and extract GameChangerWidget | f02ff6d | PageNavigation.tsx, GameChangerWidget.tsx |
| 2 | Install react-lite-youtube-embed, create YouTubeEmbed and YouTube API route | 42dfe21 | YouTubeEmbed.tsx, route.ts, package.json |

## What Was Built

### PageNavigation.tsx (modified)
- Added `"use client"` directive and `useState` for mobile menu toggle
- Fixed mobile menu bug: changed `className="hidden md:hidden"` (always hidden) to conditional `menuOpen ? 'block md:hidden' : 'hidden'`
- Added Schedule (`/schedule`) and Media (`/media`) links with SVG icons to both desktop and mobile nav
- Mobile menu now shows all 7 links: Home, News, Players, Teams, Leaderboards, Schedule, Media
- Hamburger icon toggles to X when menu is open
- Mobile links close menu on click via `onClick={() => setMenuOpen(false)}`
- Extracted nav links into a shared array to eliminate duplication between desktop and mobile sections

### GameChangerWidget.tsx (new)
- Extracted from inline function in `src/app/page.tsx` (lines 9-54)
- Accepts `maxGames` prop (default 4) and `className` prop
- Uses `useRef` for stable unique target ID (`gc-widget-{random}`) to prevent conflicts across pages
- Checks `window.GC` before loading script to prevent duplicate SDK loads
- Removed all `console.log`/`console.error` calls for production readiness
- Named export: `export function GameChangerWidget(...)`

### YouTubeEmbed.tsx (new)
- Wraps `LiteYouTubeEmbed` from `react-lite-youtube-embed`
- Props: `videoId`, `title`, `className`
- Renders with `poster="hqdefault"` and `webp` for optimized thumbnails
- Applies `rounded-lg overflow-hidden` base styles with optional `className`

### /api/youtube route (new)
- Server-side YouTube RSS feed fetcher
- Returns `{ data, stale }` envelope matching project convention
- Placeholder `CHANNEL_ID` — returns `{ data: [], stale: false }` when empty (graceful degradation)
- Parses RSS XML with regex: extracts `videoId`, `title`, `published` from `<entry>` blocks
- Accepts optional `?limit=N` query param (default 12, max 50)
- Uses `{ next: { revalidate: 3600 } }` for 1-hour ISR cache

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Nav links extracted to shared array | DRYs rendering for desktop and mobile — single source of truth for link order/icons |
| useRef for widget ID (not useId) | React's useId returns colons which break CSS selectors; random string is simpler and safe |
| YouTube channel ID as placeholder | Graceful degradation lets downstream pages render without YouTube configured yet |

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `npx tsc --noEmit` passes with zero errors
- All 4 files exist: PageNavigation.tsx (modified), GameChangerWidget.tsx (new), YouTubeEmbed.tsx (new), api/youtube/route.ts (new)
- `npm ls react-lite-youtube-embed` confirms react-lite-youtube-embed@3.5.1
- Mobile menu uses state toggle (not hardcoded hidden)

## Next Phase Readiness

All shared components are ready for import by plans 03-02 through 03-04:
- **03-02 (Home/Schedule/Media pages):** Can import GameChangerWidget, YouTubeEmbed, and use /api/youtube route
- **03-03, 03-04:** PageNavigation already shows Schedule and Media links
- **No blockers** for subsequent plans
