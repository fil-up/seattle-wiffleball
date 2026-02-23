# Seattle Wiffleball Website Revamp

## What This Is

A revamped website for the Seattle Wiffleball league, replacing the current seattlewiffleball.com. The site serves as the central hub for league stats, standings, news, team info, and historical records. It's built with Next.js and reads live data from Google Sheets, which is where the league manages all stats. The existing codebase got ~80% of the way there but has data flow bugs, stat inconsistencies, and needs significant visual polish before the 2026 season starts in early May.

## Core Value

Accurate, browsable league stats and information — if the numbers are wrong or hard to find, nothing else matters.

## Requirements

### Validated

- ✓ Next.js App Router with Tailwind CSS — existing
- ✓ Google Sheets data fetching via gviz — existing
- ✓ Stats tables with TanStack React Table (sortable, filterable) — existing
- ✓ Team logos stored in public/images/ — existing
- ✓ News system with JSON-based articles and markdown rendering — existing
- ✓ Page routing structure (home, stats, teams, news, leaderboards) — existing
- ✓ Google Sheets import script — existing
- ✓ Shared PageNavigation component — existing

### Active

- [ ] Fix data filtering — year/team switching, default population not working correctly
- [ ] Fix stat inconsistencies — wrong sheet referenced for totals, fragile column indices
- [ ] Consolidate data sources — eliminate confusion between Prisma/SQLite and Google Sheets; Sheets is the source of truth
- [ ] Modern UI design — polished tables, refined dropdowns, team logo icons inline, award icons, player headshot placeholders
- [ ] Home page — hero section, standings widget, news preview, league info
- [ ] News section — articles, game recaps, World Series stories
- [ ] Teams section — team pages with rosters, records, logos
- [ ] Stats section — player batting/pitching tables with year/scope filtering
- [ ] Leaderboards — top performers by stat category
- [ ] Rules page — league rules and regulations (currently 404)
- [ ] Archives page — historical seasons, past champions
- [ ] Info page — about the league, field location, contact
- [ ] Centralize config — move hardcoded spreadsheet ID to env variable
- [ ] Fix known bugs — team ID mismatch, division by zero in franchise totals
- [ ] Clean up codebase — remove unused dependencies (sheetrock, graceful-fs), debug console.logs
- [ ] Deploy to Vercel — production hosting with proper env configuration
- [ ] Responsive design — works well on mobile (players check stats on phones at the field)

### Out of Scope

- User authentication / player accounts — not needed for a read-only stats site
- CMS for news editing — keep static JSON; league office updates infrequently
- Mobile app — responsive web is sufficient
- Real-time live scoring — games are tracked in Sheets, site updates after
- Prisma/SQLite as production database — Google Sheets is the source of truth

## Context

The Seattle Wiffleball league has been running since 2015. The current site at seattlewiffleball.com is functional but visually dated — plain tables, no visual flair. The league tracks all stats in a Google Spreadsheet with tabs for Individual Hitting (IH), Individual Pitching (IP), Standings, and Player/Team Adj (team roster mappings).

The replacement site was built with AI assistance by a non-developer league member. The existing codebase has a dual data source problem: some pages fetch directly from Google Sheets (gviz URLs), while others use Prisma/SQLite populated by an import script. This creates inconsistencies. The path forward is to standardize on Google Sheets as the single source, fetched through centralized API routes with proper caching.

Key data source: Google Spreadsheet ID `1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek`

The site needs to be ready for the 2026 season opener in early May. Primary users are league players and fans checking stats, standings, and news — often on mobile at the field.

## Constraints

- **Data Source**: Google Sheets is the source of truth — the league manages everything there
- **Timeline**: Must be live before early May 2026 season start
- **Maintainability**: Non-developer owner — site must be easy to update (news JSON, env vars)
- **Budget**: Free-tier hosting (Vercel) and services only
- **Existing Assets**: Team logos already exist in public/images/; no player headshots yet (use placeholders)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Google Sheets as sole data source | League already manages stats there; eliminates dual-source confusion | — Pending |
| Drop Prisma/SQLite | Simplifies architecture; avoids sync issues between Sheets and DB | — Pending |
| Deploy on Vercel | Free tier, purpose-built for Next.js, zero-config deployment | — Pending |
| Player headshot placeholders | No images available yet; design the UI to accept them later | — Pending |
| Keep news as static JSON | League office updates infrequently; no CMS complexity needed | — Pending |

---
*Last updated: 2026-02-23 after initialization*
