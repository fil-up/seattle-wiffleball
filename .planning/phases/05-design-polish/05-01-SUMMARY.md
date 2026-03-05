---
phase: 05-design-polish
plan: 01
subsystem: ui
tags: [next-themes, headlessui, tailwind, css-variables, dark-mode, navigation]

requires:
  - phase: 04-content-pages
    provides: All content pages exist and need consistent theme/navigation
provides:
  - CSS custom property theme system with light/dark mode
  - Unified SiteNavigation component (desktop + mobile)
  - ThemeToggle component for dark/light switching
  - ErrorState and Skeleton shared UI components
  - Semantic Tailwind color tokens (brand, surface, content)
affects: [05-design-polish, 06-infrastructure]

tech-stack:
  added: [next-themes, @headlessui/react, clsx]
  patterns: [CSS custom properties for theming, class-based dark mode, semantic color tokens]

key-files:
  created:
    - src/components/SiteNavigation.tsx
    - src/components/ThemeToggle.tsx
    - src/components/ErrorState.tsx
    - src/components/Skeleton.tsx
    - src/components/Providers.tsx
  modified:
    - src/app/globals.css
    - tailwind.config.ts
    - src/app/layout.tsx
    - package.json

key-decisions:
  - "RGB channel CSS variables for Tailwind opacity modifier compatibility"
  - "Class-based dark mode via next-themes ThemeProvider"
  - "Headless UI Dialog for mobile slide-in navigation panel"
  - "Providers client wrapper to isolate ThemeProvider from server layout"
  - "Footer stays dark-themed in both modes (sports site convention)"

patterns-established:
  - "Theme tokens: bg-surface-*, text-content-*, border-border, bg-brand-*"
  - "Mobile-first responsive nav: hamburger → slide-in Dialog panel"
  - "Mounted guard pattern for hydration-safe theme toggle"

duration: 8min
completed: 2026-03-05
---

# Phase 5 Plan 1: Theme System Summary

**CSS custom property theme with next-themes dark mode, unified SiteNavigation with mobile slide-in, and shared ErrorState/Skeleton components**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-05T05:25:00Z
- **Completed:** 2026-03-05T05:33:00Z
- **Tasks:** 3
- **Files modified:** 22

## Accomplishments
- Light/dark theme system using CSS custom properties with space-separated RGB channels for Tailwind opacity support
- Unified SiteNavigation in layout.tsx with desktop horizontal nav, mobile hamburger/slide-in panel, active link indicators, and ThemeToggle
- Shared ErrorState component with warning icon, configurable message, and optional retry button
- TableSkeleton and CardSkeleton loading placeholder components with animate-pulse animations
- All components use semantic theme tokens for automatic light/dark mode support

## Task Commits

Each task was committed atomically:

1. **Task 1: Theme system** - `7e288e0` (feat) — CSS variables, Tailwind config, ThemeProvider
2. **Task 2: Unified SiteNavigation** - `dd3adc1` (feat) — Desktop/mobile nav, ThemeToggle, footer restyle
3. **Task 3: ErrorState and Skeleton** - `7e27abb` / `2446b31` (feat) — Shared loading/error components

## Files Created/Modified
- `src/app/globals.css` - CSS custom properties for :root (light) and .dark theme colors
- `tailwind.config.ts` - darkMode: 'class', semantic color tokens (brand/surface/content/table)
- `src/app/layout.tsx` - ThemeProvider wrapper, SiteNavigation, flex sticky footer
- `src/components/SiteNavigation.tsx` - Desktop horizontal nav + mobile Headless UI slide-in panel
- `src/components/ThemeToggle.tsx` - Sun/moon toggle with mounted hydration guard
- `src/components/Providers.tsx` - Client wrapper for ThemeProvider (SSR isolation)
- `src/components/ErrorState.tsx` - Warning icon, message, optional retry button
- `src/components/Skeleton.tsx` - TableSkeleton and CardSkeleton with animate-pulse
- `package.json` - Added next-themes, @headlessui/react, clsx
- 16 page files - Removed per-page PageNavigation imports (now handled by layout)

## Decisions Made
- Used space-separated RGB channels in CSS variables so Tailwind can apply opacity modifiers (e.g., `bg-brand-navy/90`)
- Class-based dark mode via next-themes (vs media query) for explicit user control
- Headless UI Dialog + Transition for mobile nav panel (accessible, animated)
- Extracted ThemeProvider into Providers.tsx client component to avoid SSR prerender errors
- Footer stays dark in both modes — convention for sports sites (ESPN-style)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extracted ThemeProvider into Providers client wrapper**
- **Found during:** Task 1 (ThemeProvider in layout.tsx)
- **Issue:** Wrapping ThemeProvider directly in the server component layout.tsx caused SSR prerender errors
- **Fix:** Created src/components/Providers.tsx as 'use client' wrapper around ThemeProvider
- **Files modified:** src/components/Providers.tsx, src/app/layout.tsx
- **Verification:** Build passes, theme toggle works
- **Committed in:** 7e27abb

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for correct SSR behavior. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Theme system, navigation, and shared components are in place
- Ready for 05-02-PLAN.md: Core page theme migration (home, stats, teams, leaderboards)
- All pages now inherit SiteNavigation from layout.tsx
- ErrorState and Skeleton components ready for integration in loading/error states

---
*Phase: 05-design-polish*
*Completed: 2026-03-05*
