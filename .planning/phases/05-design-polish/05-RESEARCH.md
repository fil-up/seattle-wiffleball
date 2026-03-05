# Phase 5: Design & Polish - Research

**Researched:** 2026-03-05
**Domain:** UI theming, responsive design, visual polish (Tailwind CSS + Next.js 14)
**Confidence:** HIGH

## Summary

Phase 5 polishes the existing 18-page Next.js 14 site with a league-branded color theme (blue/yellow from the logo), dark/light mode toggle, responsive mobile layouts, skeleton loading states, and visual refinement of stats tables. No new features — this phase refines what exists.

The site already uses Tailwind CSS v3 with `@tailwindcss/typography`, TanStack React Table v8, and the Inter font. The primary brand color `#25397B` (navy blue) is already used throughout, but hardcoded as raw hex values instead of Tailwind theme tokens. Team logos (25+ files) already exist in `public/images/teams/`. The core work is systematizing the design — extracting a proper color palette into `tailwind.config.ts`, adding dark mode support via `next-themes`, unifying the fragmented navigation, and applying consistent visual patterns across all pages.

**Primary recommendation:** Use `next-themes` for dark mode, `@headlessui/react` for accessible dropdown restyling, and Tailwind theme tokens for the color system — zero custom CSS frameworks needed. Page transitions can use simple CSS View Transitions (experimental) or lightweight CSS opacity transitions without adding framer-motion.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-themes | ^0.4.6 | Dark/light mode toggle | 9.8M weekly downloads; handles persistence, system detection, hydration, cross-tab sync. The de facto standard for Next.js theming |
| @headlessui/react | ^2.2.2 | Accessible dropdown/menu/dialog components | Made by Tailwind Labs; fully accessible, unstyled, works directly with Tailwind utilities. Needed for polished dropdowns and mobile slide-in menu |
| tailwindcss | ^3.3.5 | (existing) Utility CSS framework | Already installed; enable `darkMode: 'class'` and extend theme colors |
| @tailwindcss/typography | ^0.5.19 | (existing) Prose styling | Already installed; needs dark mode prose variants |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | ^2.1.0 | Conditional class merging | Cleaner conditional className logic (optional but useful) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Manual localStorage + useEffect | next-themes handles edge cases (FOUC, hydration, system preference sync) that manual solutions get wrong |
| @headlessui/react | Native HTML `<select>` with CSS | Native selects can't be fully styled cross-browser; Headless UI gives full control with built-in a11y |
| framer-motion (for transitions) | CSS View Transitions API or simple CSS opacity transitions | framer-motion adds ~30KB for subtle fades; CSS transitions are zero-cost and sufficient for this use case |
| Custom hamburger menu | @headlessui/react Dialog + Transition | Headless UI's Dialog handles focus trapping, aria attributes, and escape-to-close automatically |

**Installation:**
```bash
npm install next-themes @headlessui/react clsx
```

## Architecture Patterns

### Recommended Changes to Project Structure
```
src/
├── app/
│   └── layout.tsx           # Add ThemeProvider wrapper, unified Navigation, footer
├── components/
│   ├── Navigation.tsx        # REWRITE: unified nav for all pages (desktop + mobile)
│   ├── ThemeToggle.tsx       # NEW: dark/light mode toggle button
│   ├── Skeleton.tsx          # NEW: reusable skeleton primitives
│   ├── ErrorState.tsx        # NEW: friendly error message + retry component
│   ├── EmptyState.tsx        # NEW: illustration + friendly text for empty data
│   ├── StatsTable.tsx        # MODIFY: add sticky headers, dark mode classes
│   ├── StatsFilter.tsx       # MODIFY: restyle dropdowns with Headless UI
│   ├── PageNavigation.tsx    # DELETE: merge into unified Navigation
│   └── ...
├── lib/
│   └── theme.ts              # NEW: color tokens, CSS variable definitions
└── styles/
    └── globals.css            # MODIFY: CSS variables for theme colors
```

### Pattern 1: CSS Custom Properties for Theme Colors
**What:** Define color palette as CSS variables in `globals.css`, mapped to Tailwind theme tokens. Both light and dark values defined in `:root` and `.dark` selectors.
**When to use:** All color references throughout the site.
**Example:**
```css
/* globals.css */
:root {
  --color-bg-primary: 255 255 255;      /* white */
  --color-bg-secondary: 249 250 251;    /* gray-50 */
  --color-bg-card: 255 255 255;         /* white */
  --color-text-primary: 17 24 39;       /* gray-900 */
  --color-text-secondary: 107 114 128;  /* gray-500 */
  --color-brand-primary: 37 57 123;     /* #25397B navy */
  --color-brand-accent: 255 215 0;      /* #FFD700 gold */
  --color-table-stripe: 249 250 251;    /* gray-50 */
  --color-table-hover: 243 244 246;     /* gray-100 */
  --color-border: 229 231 235;          /* gray-200 */
}

.dark {
  --color-bg-primary: 17 24 39;         /* gray-900 */
  --color-bg-secondary: 31 41 55;       /* gray-800 */
  --color-bg-card: 31 41 55;            /* gray-800 */
  --color-text-primary: 243 244 246;    /* gray-100 */
  --color-text-secondary: 156 163 175;  /* gray-400 */
  --color-brand-primary: 59 91 173;     /* lighter navy for dark bg */
  --color-brand-accent: 255 215 0;      /* gold stays */
  --color-table-stripe: 31 41 55;       /* gray-800 */
  --color-table-hover: 55 65 81;        /* gray-700 */
  --color-border: 55 65 81;             /* gray-700 */
}
```

```typescript
// tailwind.config.ts — extend colors
colors: {
  brand: {
    navy: 'rgb(var(--color-brand-primary) / <alpha-value>)',
    gold: 'rgb(var(--color-brand-accent) / <alpha-value>)',
  },
  surface: {
    primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
    secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
    card: 'rgb(var(--color-bg-card) / <alpha-value>)',
  },
  content: {
    primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
    secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
  },
}
```

### Pattern 2: ThemeProvider in Root Layout
**What:** Wrap the app in `next-themes` ThemeProvider at the layout level, with `attribute="class"` to enable Tailwind's `dark:` prefix.
**When to use:** Root layout (`app/layout.tsx`).
**Example:**
```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Pattern 3: Skeleton Screen Components
**What:** Reusable skeleton primitives that match content shapes using Tailwind's `animate-pulse`.
**When to use:** All loading states currently showing "Loading..." text.
**Example:**
```tsx
function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded bg-gray-300 dark:bg-gray-700', className)} />
}

function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
```

### Pattern 4: Unified Navigation with Mobile Slide-in
**What:** A single Navigation component used across all pages via root layout, with desktop horizontal nav, mobile hamburger → slide-in panel from right, active page indicator, and dark mode toggle.
**When to use:** Replace both `Navigation.tsx` and `PageNavigation.tsx` plus the home page's inline nav.
**Example:**
```tsx
// Uses @headlessui/react Dialog for the mobile slide-in panel
import { Dialog, Transition } from '@headlessui/react'

// Desktop: horizontal nav with underline on active link
// Mobile: hamburger icon → Dialog panel sliding in from right
// Both: dark mode toggle button in the nav bar
```

### Anti-Patterns to Avoid
- **Duplicating nav markup in individual pages:** The home page currently renders its own nav bar inline. ALL navigation must come from the layout.
- **Hardcoding color hex values:** Replace all `#25397B`, `bg-gray-50`, `text-gray-900` etc. with theme-aware tokens or `dark:` variants.
- **Using `hidden` for mobile menu:** The current mobile menu uses `className="hidden md:hidden"` which means it never shows. Use state-driven visibility with transitions.
- **Mixing styled and unstyled selects:** All dropdowns should use the same Headless UI `Listbox` or `Select` component with consistent styling.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle + persistence | Manual localStorage + useEffect + class toggling | next-themes ThemeProvider | Handles FOUC prevention, SSR hydration, system preference detection, cross-tab sync |
| Accessible dropdown selectors | Custom `<div>` + click handlers + keyboard events | @headlessui/react Listbox | Proper ARIA attributes, keyboard navigation, focus management, screen reader support |
| Mobile slide-in menu | Custom overlay + transform + scroll lock | @headlessui/react Dialog + Transition | Focus trapping, Escape to close, scroll lock, backdrop click, a11y |
| Page transition animations | framer-motion AnimatePresence | CSS opacity transitions on layout wrapper | Sufficient for "subtle fade" requirement; zero bundle cost |

**Key insight:** Theming and accessible interactive components are deceptively complex. next-themes solves 10+ edge cases (FOUC, hydration mismatch, system preference sync, cross-tab). Headless UI solves keyboard navigation, ARIA roles, focus management. Rolling these by hand leads to accessibility bugs and visual glitches.

## Common Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC) on Dark Mode
**What goes wrong:** Page briefly renders in light mode before JavaScript applies the dark class, causing a visible flash.
**Why it happens:** Next.js server-renders HTML without knowing the user's theme preference. The `dark` class isn't applied until client-side hydration.
**How to avoid:** `next-themes` injects a script into `<head>` that reads localStorage and applies the theme class before paint. Use `suppressHydrationWarning` on the `<html>` tag. Set `defaultTheme="light"` so first-time visitors never flash.
**Warning signs:** Brief white flash when loading pages in dark mode.

### Pitfall 2: Sticky Header + Sticky Column Intersection
**What goes wrong:** When a table has both sticky headers (`position: sticky; top: 0`) and sticky columns (`position: sticky; left: 0`), the corner cell where they intersect needs the highest z-index or it renders behind other sticky elements.
**Why it happens:** Multiple sticky contexts compete for stacking order in scrollable containers.
**How to avoid:** Use z-index layering: sticky header cells get `z-30`, sticky column cells get `z-20`, and the intersection cell (top-left corner) gets `z-40`. Both `<thead>` and the sticky column cells must have explicit background colors (not `bg-inherit` from transparent parents).
**Warning signs:** Content visually overlapping headers or columns when scrolling in both directions.

### Pitfall 3: Hardcoded Colors Preventing Dark Mode
**What goes wrong:** Pages that use `bg-white`, `text-gray-900`, `bg-gray-50` etc. without `dark:` variants stay light-themed even in dark mode.
**Why it happens:** Tailwind's dark mode requires explicit `dark:` variants on every color utility, or CSS variables that auto-switch.
**How to avoid:** Use the CSS variable approach (Pattern 1 above) so colors switch automatically. For the migration, search-and-replace common patterns: `bg-white` → `bg-white dark:bg-gray-900`, `text-gray-900` → `text-gray-900 dark:text-gray-100`, etc. The CSS variable approach is better for new code.
**Warning signs:** Any element that stays white/light in dark mode.

### Pitfall 4: Mobile Table Unreadable at Small Font Sizes
**What goes wrong:** Trying to squeeze all stat columns into a mobile viewport by shrinking font size makes the table unreadable.
**Why it happens:** Data tables have many columns (16-18 in the stats table) that can't fit on 375px screens.
**How to avoid:** The CONTEXT decision is correct: use horizontal scroll on mobile. Keep font size readable (at least 14px / `text-sm`). Sticky first 1-2 columns (player name, team) so context is always visible while scrolling through stat columns. The StatsTable already supports sticky columns — keep this behavior.
**Warning signs:** Users pinch-zooming to read stats on mobile.

### Pitfall 5: Navigation Inconsistency Across Pages
**What goes wrong:** Currently the home page has its own inline nav bar with different links, icons, and styling than the `PageNavigation` component used on other pages. The root layout has no navigation at all.
**Why it happens:** The nav evolved organically — home page was built with its own nav, then `PageNavigation` was created for subpages, but neither was added to the root layout.
**How to avoid:** Create ONE unified navigation component. Add it to `app/layout.tsx` so every page gets it automatically. Remove navigation rendering from all individual page components. The home page's hero section should be BELOW the shared nav, not contain it.
**Warning signs:** Different nav links or styling on different pages; pages missing links that other pages have.

### Pitfall 6: Theme Toggle Hydration Mismatch
**What goes wrong:** The theme toggle button renders incorrectly on first load (shows wrong icon/state) because server doesn't know the user's theme.
**Why it happens:** Server renders with the default theme, but the client may have a stored preference.
**How to avoid:** Mount the toggle only after hydration using a `mounted` state flag. `next-themes` provides this pattern in its documentation. Render a placeholder (same size) during SSR to prevent layout shift.
**Warning signs:** Toggle icon flickers or shows the wrong state on page load.

## Code Examples

### Example 1: Theme Toggle Button
```tsx
'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Placeholder to prevent layout shift during SSR
    return <div className="w-9 h-9" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

### Example 2: Headless UI Listbox for Polished Dropdowns
```tsx
'use client'
import { Listbox, Transition } from '@headlessui/react'

interface SelectProps<T> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  label?: string
}

export function Select<T>({ value, onChange, options, label }: SelectProps<T>) {
  const selected = options.find(o => o.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        {label && <Listbox.Label className="text-sm font-medium text-content-primary">{label}</Listbox.Label>}
        <Listbox.Button className="relative w-full rounded-lg bg-surface-card border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-left text-sm">
          <span>{selected?.label}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">▾</span>
        </Listbox.Button>
        <Transition
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-surface-card shadow-lg border border-gray-200 dark:border-gray-600 py-1 text-sm">
            {options.map((opt) => (
              <Listbox.Option
                key={String(opt.value)}
                value={opt.value}
                className={({ active }) =>
                  `cursor-pointer select-none px-3 py-2 ${active ? 'bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-blue-300' : 'text-content-primary'}`
                }
              >
                {opt.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
```

### Example 3: Error State Component
```tsx
interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = "Couldn't grab the stats. Try again?", onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" /* warning icon */ />
      <p className="mt-4 text-lg font-medium text-content-primary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
```

### Example 4: Inline Team Logo in Stats Table Column
```tsx
// Column definition with inline team logo
{
  header: 'Player',
  accessorKey: 'player.name',
  cell: ({ row }) => {
    const teamCode = row.original.teamCode
    const logoUrl = teamCode ? `/images/teams/${TEAM_CODE_MAP[teamCode]?.logo}` : null
    return (
      <div className="flex items-center gap-2">
        {logoUrl && (
          <img src={logoUrl} alt="" className="w-4 h-4 object-contain" />
        )}
        <Link href={`/stats/players/${row.original.playerId}`}>
          {row.getValue('player.name')}
        </Link>
      </div>
    )
  }
}
```

### Example 5: Sticky Table Header in StatsTable
```tsx
// Add to the <thead> element
<thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-30">

// For the corner cell (sticky header + sticky column intersection)
<th className="sticky top-0 left-0 z-40 bg-gray-50 dark:bg-gray-800">
```

## Codebase Audit: Current State vs Target

### Navigation (Critical — must fix first)
| Current State | Issue | Target |
|---------------|-------|--------|
| Home page has inline nav in page.tsx (lines 52-103) | Duplicated, different links/icons than PageNavigation | Single Navigation component in layout.tsx |
| PageNavigation.tsx used on all other pages | Each page imports it manually | Remove — layout handles it |
| Navigation.tsx exists but is stale/unused | `text-gray-300 hover:text-white` on white bg = invisible text | Delete entirely |
| Root layout.tsx has no navigation | Footer only | Add Navigation component |
| Mobile menu button exists but menu never shows | `className="hidden md:hidden"` = always hidden | Headless UI Dialog slide-in |

### Color Usage (Systematic replacement needed)
| Current Pattern | Count (approx) | Replacement |
|-----------------|-----------------|-------------|
| `bg-gray-50` (page backgrounds) | 15+ pages | `bg-surface-secondary` or `dark:bg-gray-900` |
| `bg-white` (cards/containers) | 30+ instances | `bg-surface-card dark:bg-gray-800` |
| `text-gray-900` (headings) | 40+ instances | `text-content-primary` or `dark:text-gray-100` |
| `text-gray-500` / `text-gray-600` | 50+ instances | `text-content-secondary` or `dark:text-gray-400` |
| `bg-[#25397B]` (brand navy) | 10+ instances | `bg-brand-navy` |
| `border-gray-200` | 20+ instances | `dark:border-gray-700` |
| `bg-yellow-50` (stale banners) | 6 instances | Restyle to branded warning |

### Loading States (Replace all)
| Page | Current | Target |
|------|---------|--------|
| Player Stats | "Loading..." text | TableSkeleton with filter bar skeleton |
| Player Detail | "Loading..." text | Profile header skeleton + table skeleton |
| Team Detail | "Loading..." + "Loading roster..." | Card grid skeleton + table skeleton |
| Teams Index | "Loading..." text | Card grid skeleton |
| Leaderboards | "Loading..." text | Podium skeleton grid |
| Schedule | "Loading schedule from GameChanger..." | Widget placeholder skeleton |
| Media | animate-pulse grid (already done!) | Keep — already good |
| Standings Widget | animate-pulse lines (already done!) | Keep — already good |

### Error States (Add to all data-fetching pages)
| Page | Current Error Handling | Target |
|------|----------------------|--------|
| Player Stats | console.error only | ErrorState component with retry |
| Player Detail | console.error only | ErrorState with "back to players" |
| Team Detail | No error UI | ErrorState with retry |
| Leaderboards | No error UI | ErrorState with retry |
| Home page | console.error only | Graceful degradation per section |

### Mobile Responsive Gaps
| Component/Page | Current | Target |
|----------------|---------|--------|
| Navigation | Hamburger button exists but mobile menu is broken | Slide-in panel from right |
| Stats tables | overflow-x-auto works | Keep; add sticky header behavior |
| Home page hero | Stacks OK but logo/text sizing needs work | Responsive scaling verified |
| Team detail page | Stacks vertically on mobile | Tab interface (roster / stats / records) |
| Footer | 4-column grid → 1-column on mobile (works) | Keep — already responsive |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion for page transitions | CSS View Transitions API (Next.js experimental) or simple CSS transitions | 2024-2025 | Zero bundle cost for subtle fades; framer-motion overkill for this |
| Manual dark mode with localStorage | next-themes v0.4.6 | Stable since 2023 | Handles all edge cases (FOUC, hydration, system pref) |
| Custom dropdown styling with CSS | @headlessui/react Listbox | Stable since Headless UI v2.0 (2024) | Accessible by default, Tailwind-native |
| CSS-in-JS for theming | CSS custom properties + Tailwind `dark:` variants | Tailwind v3 (2022) | Zero runtime cost, works with SSR |

**Deprecated/outdated:**
- The `Navigation.tsx` component is stale — uses light-bg text colors (`text-gray-300`) that are invisible on the white background. Should be deleted, not repaired.

## Open Questions

1. **Team logo mapping in stats data**
   - What we know: `teamCodeLogos.ts` maps team codes (like "WH", "BS") to logo filenames. Team logos exist in `/images/teams/`.
   - What's unclear: The stats API returns team *names* (e.g., "Wiffle House"), not team *codes*. The player stats rows have `team: string` (the name), not `teamCode`.
   - Recommendation: Build a reverse lookup map from team name → logo path using both `teams.ts` and `teamCodeLogos.ts`. Some team names may not have logos (historical/defunct teams) — fall back to `default-team-logo.png`.

2. **Award icons data source**
   - What we know: `archives.json` has MVP, Cy Young, Batting Champion, HR Leader per season. `hall-of-fame.json` has awards per inductee. All award values are currently `null` in archives.json.
   - What's unclear: Whether award data will be populated before this phase. If all MVP/award fields remain null, the award icon feature has no data to display.
   - Recommendation: Build the award icon UI anyway — design the components so they work when data exists but degrade gracefully (show nothing) when awards are null. This makes the feature ready for when data is populated.

3. **Page transitions approach**
   - What we know: CONTEXT says "subtle fade transitions between pages." Next.js 14's `viewTransition` is experimental and "not recommended for production."
   - What's unclear: Whether the experimental flag is stable enough for this project, or if it should be simpler CSS.
   - Recommendation: Use simple CSS opacity transition on the layout wrapper. A `transition-opacity duration-200` on the main content area, triggered by route change via a small client component, provides the subtle fade without any experimental flags or new dependencies.

4. **Home page navigation refactor scope**
   - What we know: The home page renders its own complete nav bar with different links and inline SVG icons. Moving nav to layout.tsx means the home page hero section needs restructuring.
   - What's unclear: Whether the home page's sticky nav styling (the full-bleed blue bar with gold underline) should become the unified nav style or if subpages keep PageNavigation's simpler style.
   - Recommendation: Unify to the home page's full-bleed blue bar style — it's more polished and ESPN-like. The gold accent line is a nice brand touch. Apply it everywhere.

## Sources

### Primary (HIGH confidence)
- Codebase audit: all 18 page files, 14 components, tailwind.config.ts, globals.css, layout.tsx read directly
- League logo (`seattle-wiffleball-logo.png`) inspected — confirmed navy blue + gold yellow palette
- Team logos: 25+ files confirmed in `public/images/teams/`
- next-themes npm: v0.4.6, 9.8M weekly downloads, MIT license
- @headlessui/react npm: v2.2.2, maintained by Tailwind Labs
- Tailwind CSS dark mode docs: `darkMode: 'class'` configuration
- Next.js viewTransition docs: experimental, not recommended for production

### Secondary (MEDIUM confidence)
- ESPN design system uses "Prism" with color ramp for light/dark modes (from Gamecast redesign documentation)
- CSS View Transitions API browser support: Chrome 111+, Edge 111+, Safari 18+, Firefox 133+ (from MDN-aligned sources)

### Tertiary (LOW confidence)
- Exact framer-motion bundle size impact (~30KB) — commonly cited but not verified for current version

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — next-themes and @headlessui/react are well-established, heavily used, maintained by known teams
- Architecture: HIGH — patterns directly verified against codebase structure; CSS variable theming is standard Tailwind practice
- Pitfalls: HIGH — identified from direct codebase audit (broken mobile menu, duplicate navs, hardcoded colors) plus documented dark mode edge cases

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable domain — Tailwind v3, Next.js 14, all libraries well-established)
