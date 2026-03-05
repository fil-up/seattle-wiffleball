# Phase 4: Content Pages - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the remaining informational/content pages: News, Rules, Archives, Info, and Hall of Fame. These are read-focused pages that display league content, history, and reference information. Interactive features (comments, search, filtering) are out of scope.

</domain>

<decisions>
## Implementation Decisions

### News content & structure
- Source: Markdown files in the repo (one `.md` file per article in a content folder)
- Preview display: Title, date, short excerpt, and thumbnail image per article
- Volume: Moderate — roughly a couple dozen articles (seasonal recaps, announcements, previews)
- Labeling: Simple tag/label shown per article (e.g., "Recap", "Announcement") but no filtering UI needed
- Content reference: Migrate/adapt existing content from the old site

### Archives & historical data
- Data scope: Season champions, final standings, and award winners per season
- Layout: Accordion/expandable sections — one per season, expand to see details
- Content source: Mix — standings data derived from Google Sheets, awards/champions from a static JSON or Markdown file
- Cross-linking: Clicking a past season links into the existing stats page filtered by that year
- Award details and season counts to be determined by researcher from available data

### Hall of Fame
- Player images: AI-generated portrait/bust images — user will provide these as static assets
- Selection: Manually curated — stored in a JSON or Markdown file, user decides who's inducted
- Entry content: Full career stats summary, awards won, seasons played, and a written bio per player
- Count: About a dozen players to start

### Rules page
- Content source: Existing rules at https://seattlewiffleball.com/rules.html — migrate content to the new site
- Structure: Organized into sections with headers (e.g., General Rules, Batting, Pitching, Field Rules)

### Info / About page
- Content: League description, field location with embedded map, season schedule info, and how to join
- Join mechanism: External link (Google Form or similar signup URL)

### Claude's Discretion
- Markdown parsing library/approach for news articles
- Exact accordion component implementation for archives
- Map embed provider (Google Maps, Mapbox, etc.)
- Hall of Fame card/grid layout design
- News article URL slug format
- Loading and empty states for all pages

</decisions>

<specifics>
## Specific Ideas

### Content source URLs (for researcher to reference/scrape)
- **Rules:** https://seattlewiffleball.com/rules.html
- **Recent news (2018-2025):** https://seattlewiffleball.com/news.html
- **Old news (2015-2017):**
  - https://www.leaguelineup.com/miscinfo.asp?menuid=33&url=seattlewiffleball
  - https://www.leaguelineup.com/miscinfo.asp?menuid=34&url=seattlewiffleball
  - https://www.leaguelineup.com/miscinfo.asp?menuid=35&url=seattlewiffleball

These URLs contain real league content that should inform the page structure and content format. The researcher should examine them to understand what content exists and how to best structure it in the new site.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-content-pages*
*Context gathered: 2026-03-04*
