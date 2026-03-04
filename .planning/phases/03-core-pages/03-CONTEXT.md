# Phase 3: Core Pages - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the site's primary pages — Home, Teams, Leaderboards — and embed GameChanger and YouTube widgets. These are the pages users navigate between to browse the league. Content pages (News, Rules, Archives, Info, Hall of Fame) are Phase 4. Visual polish and responsive design are Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Home page — Hero section
- Big image/GIF background with content overlaid (asset should already exist in codebase)
- Overlay shows league name + tagline (e.g., "Seattle Wiffleball — Est. 20XX")
- Build layout to accept the existing GIF asset; fall back to a static image if not found

### Home page — Content layout
- Below hero: news featured article section → standings sidebar alongside → quick links at bottom
- News: single featured article highlight with smaller recent items below
- Standings: compact sidebar widget (small standings table off to the side of main content)
- Featured teams section not needed — standings widget covers team visibility

### Home page — Widgets on home
- GameChanger compact widget: shows last game result + next upcoming game (date, time, teams)
- YouTube: Claude's discretion on home page presentation (single embed or thumbnail row)

### Teams index page
- Logo-focused grid — big team logos, name and record on hover
- Team logo assets should already exist in the codebase
- Clicking a team navigates to the team detail page

### Team detail page
- Sections: roster + team stats summary + season W-L record
- Roster displayed as player cards with names (headshot placeholders come in Phase 5)
- Stats: team aggregate summary at top, individual player stats breakdown below
- Year selector to browse past seasons (not just current)
- Clicking a player card opens a player detail page with their full stats
- Layout: Claude's discretion (single column, two column, or tabbed)

### Leaderboards page
- Podium style — top 3 highlighted big, ranks 4-10 listed below
- Two sections: Hitting leaderboards then Pitching leaderboards, scrollable
- Hitting categories: AVG, HR, RBI, wRC+
- Pitching categories: ERA, K, W, WHIP, IP, K/9, OPP AVG
- Top 10 players per category
- Qualifier minimums enforced (same logic as the stats page)
- Default year: current season, with year selector to browse other years
- Clicking a player goes to their player detail page

### GameChanger widget
- Existing embed code should be in the codebase — use it
- Compact version on home page (last result + next game)
- Full version on a dedicated Schedule page
- Schedule page gets top-level nav item ("Schedule")
- Research request: investigate what additional GameChanger content/APIs are available beyond just the schedule embed

### YouTube widget
- Source: league YouTube channel — embed latest or featured videos
- Latest video on home page (presentation at Claude's discretion)
- Full video gallery on a dedicated Videos/Media page
- Videos/Media page gets top-level nav item ("Media" or "Videos")

### Quick links
- Claude's discretion on style and content

### Claude's Discretion
- Quick links design and content on home page
- YouTube presentation on home page (single embed vs thumbnail row)
- Team detail page layout (single column, two column, or tabbed)
- Exact spacing, typography, and visual hierarchy decisions (Phase 5 handles polish)

</decisions>

<specifics>
## Specific Ideas

- Hero uses an existing GIF in the codebase — look for it and build the hero around it
- Team logos already exist in the codebase — find and use them
- GameChanger embed code likely already in the codebase — find and reuse it
- Leaderboard podium style: think sports awards/podium presentation, top 3 get visual prominence
- "I'd like you to do some research to see if there is more GameChanger content we can access rather than just the schedule" — researcher should investigate GameChanger widget/API options

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-core-pages*
*Context gathered: 2026-03-04*
