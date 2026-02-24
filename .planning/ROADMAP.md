# Roadmap: Seattle Wiffleball Website Revamp

## Overview

This roadmap takes the existing ~80% complete Next.js site and delivers a production-ready league stats hub before the May 2026 season. The work flows from data reliability outward: first consolidate the data pipeline on Google Sheets (eliminating Prisma/SQLite), then fix stat accuracy bugs, then build out all pages, then apply visual polish and responsive design, and finally clean up and deploy. Every phase delivers a verifiable capability — if stats are wrong, nothing else matters.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Data Foundation** - Consolidate on Google Sheets, remove Prisma/SQLite, centralize config and parsing
- [ ] **Phase 2: Stats Engine** - Fix stat bugs, build accurate batting/pitching tables with working filters
- [ ] **Phase 3: Core Pages** - Build Home, Teams, Leaderboards pages and embed live/media widgets
- [ ] **Phase 4: Content Pages** - Build News, Rules, Archives, Info, and Hall of Fame pages
- [ ] **Phase 5: Design & Polish** - Visual refinement, responsive layout, theming, and UX consistency
- [ ] **Phase 6: Infrastructure & Launch** - Cleanup, deploy to Vercel, ensure non-developer maintainability

## Phase Details

### Phase 1: Data Foundation
**Goal**: All data flows through a single, reliable pipeline from Google Sheets — no dual-source confusion, no Prisma remnants
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, INFRA-04
**Success Criteria** (what must be TRUE):
  1. Every page that displays data fetches it through Next.js API routes — no client-side Google Sheets fetches
  2. The spreadsheet ID is configured in one environment variable; changing it updates the entire site
  3. Google Sheets gviz responses are parsed by a single shared utility used across all API routes
  4. Repeated page loads within the cache window do not trigger new requests to Google Sheets
  5. No Prisma schema, SQLite database file, or Prisma client code exists in the codebase
**Plans**: 3 plans

Plans:
- [ ] 01-01: Remove Prisma/SQLite and centralize spreadsheet configuration
- [ ] 01-02: Build shared gviz parsing utility and centralized API routes for all Sheets data
- [ ] 01-03: Add caching layer and migrate all page components to use API routes

### Phase 2: Stats Engine
**Goal**: Stats tables show accurate, correctly filtered batting and pitching data built on the new data pipeline
**Depends on**: Phase 1
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, PAGE-05
**Success Criteria** (what must be TRUE):
  1. Switching year, team, and scope filters updates stats tables correctly with no stale or missing data
  2. All-time batting totals pull from the correct sheet (IH, not IP)
  3. Adding or reordering columns in Google Sheets does not break stats parsing — columns are mapped by header name
  4. The Stats page displays sortable, filterable batting and pitching tables with all expected stat columns
**Plans**: 3 plans

Plans:
- [ ] 02-01: Fix data bugs — wrong sheet reference for totals, implement header-based column mapping
- [ ] 02-02: Fix year/team/scope filtering and rebuild batting stats table
- [ ] 02-03: Build pitching stats table and integrate both into the Stats page

### Phase 3: Core Pages
**Goal**: The site's primary pages exist and display correct, live data with working navigation between them
**Depends on**: Phase 2
**Requirements**: PAGE-01, PAGE-03, PAGE-04, PAGE-06, LIVE-01, LIVE-02
**Success Criteria** (what must be TRUE):
  1. Home page loads with hero section, standings widget, news preview, featured teams, and quick links
  2. Teams index shows all current teams with logos and records; clicking a team opens its detail page with roster, season records, and team stats
  3. Leaderboards page shows top performers by stat category with year filtering
  4. GameChanger schedule/scores widget is embedded and functional on the appropriate page
  5. YouTube video stream embeds display on the appropriate page
**Plans**: 4 plans

Plans:
- [ ] 03-01: Build Home page with hero, standings widget, news preview, and quick links
- [ ] 03-02: Build Teams index and Team detail pages with roster, records, and team stats
- [ ] 03-03: Build Leaderboards page with stat category filtering
- [ ] 03-04: Integrate GameChanger and YouTube embeds

### Phase 4: Content Pages
**Goal**: All remaining site pages exist with correct, browsable content
**Depends on**: Phase 3
**Requirements**: PAGE-02, PAGE-07, PAGE-08, PAGE-09, PAGE-10
**Success Criteria** (what must be TRUE):
  1. News section lists articles with previews; clicking an article opens its full content page
  2. Rules page displays league rules and regulations (no more 404)
  3. Archives page shows past seasons, champions, and historical records
  4. Info page shows league description, field location, and how to join
  5. Hall of Fame page displays AI-generated player busts, career stats/awards, and player bios
**Plans**: 3 plans

Plans:
- [ ] 04-01: Build News section — article list and individual article pages
- [ ] 04-02: Build Rules, Archives, and Info pages
- [ ] 04-03: Build Hall of Fame page with player busts, stats, and bios

### Phase 5: Design & Polish
**Goal**: The site looks modern, league-branded, and works well on phones at the field
**Depends on**: Phases 2, 3, 4
**Requirements**: STAT-06, STAT-07, STAT-08, STAT-09, UX-01, UX-02, UX-03, UX-04, UX-05
**Success Criteria** (what must be TRUE):
  1. Stats tables have striped rows, hover effects, clean typography, and team logo icons displayed inline
  2. Player views show headshot placeholders and award icons (MVP, batting title, etc.) next to names
  3. Dropdown selectors for year, team, and stat category are visually polished and consistent site-wide
  4. Every page renders correctly on mobile screens with no horizontal scroll or broken layouts
  5. Site uses a consistent dark/league-branded color theme with uniform navigation across all pages
**Plans**: 3 plans

Plans:
- [ ] 05-01: Stats table visual polish — inline team logos, headshot placeholders, award icons, polished dropdowns
- [ ] 05-02: Responsive design pass across all pages for mobile
- [ ] 05-03: Dark/branded color theme, consistent navigation, error states, and loading indicators

### Phase 6: Infrastructure & Launch
**Goal**: Site is deployed, cleaned up, and maintainable by the non-developer league owner
**Depends on**: Phase 5
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-05
**Success Criteria** (what must be TRUE):
  1. Site is live on Vercel with correct environment variables and builds without errors
  2. No unused dependencies (sheetrock, graceful-fs) remain in package.json
  3. No debug pages or console.log statements exist in production code
  4. Non-developer owner can update news (edit JSON file), change environment variables, and drop in team/player images without touching code
**Plans**: 3 plans

Plans:
- [ ] 06-01: Codebase cleanup — remove unused dependencies, debug console.logs, and dead code
- [ ] 06-02: Deploy to Vercel with environment configuration
- [ ] 06-03: Document maintenance procedures for non-developer owner

## Coverage Map

Every v1 requirement mapped to exactly one phase. No orphans. No duplicates.

| Requirement | Description | Phase |
|-------------|-------------|-------|
| DATA-01 | Consolidate on Google Sheets, remove Prisma/SQLite | Phase 1 |
| DATA-02 | Centralize spreadsheet ID in env var | Phase 1 |
| DATA-03 | Centralize gviz parsing into shared utility | Phase 1 |
| DATA-04 | Proxy all Sheets data through API routes | Phase 1 |
| DATA-05 | Add caching layer for Sheets data | Phase 1 |
| STAT-01 | Fix year/team/scope filtering bugs | Phase 2 |
| STAT-02 | Fix wrong sheet reference (IP instead of IH) | Phase 2 |
| STAT-03 | Map columns by header name | Phase 2 |
| STAT-04 | Player batting stats table | Phase 2 |
| STAT-05 | Player pitching stats table | Phase 2 |
| STAT-06 | Team logo icons in stats tables | Phase 5 |
| STAT-07 | Player headshot placeholders | Phase 5 |
| STAT-08 | Award icons next to player names | Phase 5 |
| STAT-09 | Polished dropdown selectors | Phase 5 |
| PAGE-01 | Home page | Phase 3 |
| PAGE-02 | News section | Phase 4 |
| PAGE-03 | Teams index | Phase 3 |
| PAGE-04 | Team detail pages | Phase 3 |
| PAGE-05 | Stats page | Phase 2 |
| PAGE-06 | Leaderboards page | Phase 3 |
| PAGE-07 | Rules page | Phase 4 |
| PAGE-08 | Archives page | Phase 4 |
| PAGE-09 | Info page | Phase 4 |
| PAGE-10 | Hall of Fame page | Phase 4 |
| LIVE-01 | GameChanger widget | Phase 3 |
| LIVE-02 | YouTube video streams | Phase 3 |
| UX-01 | Modern stats tables | Phase 5 |
| UX-02 | Responsive design | Phase 5 |
| UX-03 | Consistent navigation | Phase 5 |
| UX-04 | Dark/league-branded theme | Phase 5 |
| UX-05 | Error states and loading indicators | Phase 5 |
| INFRA-01 | Deploy to Vercel | Phase 6 |
| INFRA-02 | Remove unused dependencies | Phase 6 |
| INFRA-03 | Remove debug pages and console.logs | Phase 6 |
| INFRA-04 | Remove Prisma/SQLite entirely | Phase 1 |
| INFRA-05 | Clean, maintainable codebase | Phase 6 |

**Mapped:** 36/36 ✓

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 0/3 | Not started | - |
| 2. Stats Engine | 0/3 | Not started | - |
| 3. Core Pages | 0/4 | Not started | - |
| 4. Content Pages | 0/3 | Not started | - |
| 5. Design & Polish | 0/3 | Not started | - |
| 6. Infrastructure & Launch | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-23*
*Last updated: 2026-02-23*
