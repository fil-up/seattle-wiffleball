# Phase 5: Design & Polish - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual refinement, responsive layout, theming, and UX consistency across the entire site. The site looks modern, league-branded, and works well on phones at the field. No new features or pages — this phase polishes what exists.

</domain>

<decisions>
## Implementation Decisions

### Color theme & league branding
- Both light and dark mode with a toggle in the navigation bar
- Light mode is the default for first-time visitors
- Blue & yellow color palette to match the existing league logo (logo is already in the repo)
- ESPN / major-league professional vibe — data-heavy, polished, serious sports site feel
- Restyle existing stale-data banners to match the new theme

### Stats table visual polish
- Small team logo icon (16-20px) displayed next to the player name in the same column
- Alternating striped rows with hover highlight on both
- Small award icons (MVP, batting title, etc.) next to the player's name inline
- Generic silhouette icon for headshot placeholders when no photo exists
- Custom-styled dropdown selectors (year, team, stat filters) matching the site theme
- No special highlighting for stat leaders — just the numbers
- Comfortable row spacing — breathable, easy to scan, not cramped
- Sticky table headers that stay visible when scrolling down

### Mobile layout
- Stats tables use horizontal scroll on mobile — swipe to see more columns
- Hamburger menu icon opening a slide-in panel from the right
- Navigation bar fixed at top on mobile — always visible when scrolling
- Readable font sizing prioritized over fitting more data — scroll is fine
- Home page stacks all sections vertically on mobile (scores, standings, news, etc.)
- Team detail page uses tabs on mobile (roster / stats / records) instead of stacking
- Primary mobile use case: checking live scores and schedule at the field

### Loading states, errors & navigation
- Skeleton screens for loading states — gray placeholder shapes matching the expected layout
- Friendly, casual error messages — "Couldn't grab the stats. Try again?" with retry button
- Horizontal top navigation bar on desktop — standard sports site layout
- Active page indicated by underline / bottom border on the nav link
- Subtle fade transitions between pages
- Empty states use illustration + friendly text (not bare "No results" messages)
- Full footer with nav links mirrored, contact info, and social links

### Claude's Discretion
- Exact blue & yellow shade selection — pick what looks best for both light and dark modes
- Skeleton screen designs for each page type
- Empty state illustration style (simple SVG vs emoji-based vs abstract)
- Exact transition timing and easing
- Footer layout and social link arrangement
- Stale banner restyle approach

</decisions>

<specifics>
## Specific Ideas

- ESPN is the visual reference — the site should feel like a real league stats hub, not a hobby project
- League logo already exists in the repo — color palette should be derived from it
- Blue and yellow are the league's identity colors
- People check the site on their phones at the field — mobile readability is critical

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-design-polish*
*Context gathered: 2026-03-04*
