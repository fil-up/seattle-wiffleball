# Requirements: Seattle Wiffleball Website Revamp

**Defined:** 2026-02-23
**Core Value:** Accurate, browsable league stats and information — if the numbers are wrong or hard to find, nothing else matters.

## v1 Requirements

Requirements for initial release before the May 2026 season.

### Data Architecture

- [x] **DATA-01**: Consolidate on Google Sheets as single data source, removing Prisma/SQLite entirely
- [x] **DATA-02**: Centralize spreadsheet ID in environment variable (currently hardcoded in 12+ files)
- [x] **DATA-03**: Centralize gviz response parsing into a shared utility (replace fragile substring logic)
- [x] **DATA-04**: Proxy all Sheets data through Next.js API routes (no client-side fetches to Google)
- [x] **DATA-05**: Add caching layer for Sheets data to avoid hitting Google on every page load

### Stats & Tables

- [x] **STAT-01**: Fix year/team/scope filtering and default population bugs
- [x] **STAT-02**: Fix wrong sheet reference (hitting totals pulling from pitching sheet IP instead of IH)
- [x] **STAT-03**: Map columns by header name instead of hardcoded indices
- [x] **STAT-04**: Player batting stats table with sorting and filtering
- [x] **STAT-05**: Player pitching stats table with sorting and filtering
- [ ] **STAT-06**: Team logo icons displayed inline in stats tables
- [ ] **STAT-07**: Player headshot placeholders in stats/player views
- [ ] **STAT-08**: Award icons (MVP, batting title, etc.) next to player names
- [ ] **STAT-09**: Polished dropdown selectors for year, team, stat category

### Pages

- [x] **PAGE-01**: Home page with hero section, standings widget, news preview, featured teams, quick links
- [x] **PAGE-02**: News section with article list and individual article pages
- [x] **PAGE-03**: Teams index with all teams, logos, records
- [x] **PAGE-04**: Team detail pages with roster, season records by year, team batting/pitching stats
- [x] **PAGE-05**: Stats page with full batting and pitching tables with filters
- [x] **PAGE-06**: Leaderboards page with top performers by stat category
- [x] **PAGE-07**: Rules page with league rules and regulations
- [x] **PAGE-08**: Archives page with past seasons, champions, historical records
- [x] **PAGE-09**: Info page with about the league, field location, how to join
- [x] **PAGE-10**: Hall of Fame page with AI-generated player busts, career stats/awards, and player bios

### Live & Media

- [x] **LIVE-01**: Embed GameChanger widget for schedule and live scores
- [x] **LIVE-02**: Embed YouTube video streams for game broadcasts

### Design & UX

- [x] **UX-01**: Modern, polished stats tables (striped rows, hover effects, clean typography)
- [x] **UX-02**: Responsive design that works on mobile
- [x] **UX-03**: Consistent navigation across all pages
- [x] **UX-04**: Dark/league-branded color theme
- [x] **UX-05**: Proper error states and loading indicators on all pages

### Infrastructure

- [x] **INFRA-01**: Deploy to Vercel with proper environment configuration
- [x] **INFRA-02**: Remove unused dependencies (sheetrock, graceful-fs)
- [x] **INFRA-03**: Remove debug pages and console.logs
- [x] **INFRA-04**: Remove Prisma/SQLite entirely (schema, client, dev.db, import script)
- [x] **INFRA-05**: Clean, maintainable codebase a non-developer can update (news JSON, env vars, image drops)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Player Profiles

- **PROF-01**: Individual player profile pages with full career stats
- **PROF-02**: Actual player headshot photos (replacing placeholders)

### Advanced Stats

- **ADVS-01**: Advanced stats calculations (wOBA, wRC+, FIP)
- **ADVS-02**: Season-over-season trend charts for players

### Social & Engagement

- **SOCL-01**: Social media share buttons for stats and articles
- **SOCL-02**: Game recap auto-generation from box scores

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Read-only stats site; no user-generated content |
| CMS for news editing | League updates infrequently; static JSON is sufficient |
| Mobile app | Responsive web covers mobile use cases |
| Real-time live scoring | Games tracked in Sheets; site updates after |
| Prisma/SQLite as production DB | Google Sheets is the source of truth |
| Player-submitted content | Not needed; league office manages all content |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1: Data Foundation | Complete |
| DATA-02 | Phase 1: Data Foundation | Complete |
| DATA-03 | Phase 1: Data Foundation | Complete |
| DATA-04 | Phase 1: Data Foundation | Complete |
| DATA-05 | Phase 1: Data Foundation | Complete |
| STAT-01 | Phase 2: Stats Engine | Complete |
| STAT-02 | Phase 2: Stats Engine | Complete |
| STAT-03 | Phase 2: Stats Engine | Complete |
| STAT-04 | Phase 2: Stats Engine | Complete |
| STAT-05 | Phase 2: Stats Engine | Complete |
| STAT-06 | Phase 5: Design & Polish | Complete |
| STAT-07 | Phase 5: Design & Polish | Complete |
| STAT-08 | Phase 5: Design & Polish | Complete |
| STAT-09 | Phase 5: Design & Polish | Complete |
| PAGE-01 | Phase 3: Core Pages | Complete |
| PAGE-02 | Phase 4: Content Pages | Complete |
| PAGE-03 | Phase 3: Core Pages | Complete |
| PAGE-04 | Phase 3: Core Pages | Complete |
| PAGE-05 | Phase 2: Stats Engine | Complete |
| PAGE-06 | Phase 3: Core Pages | Complete |
| PAGE-07 | Phase 4: Content Pages | Complete |
| PAGE-08 | Phase 4: Content Pages | Complete |
| PAGE-09 | Phase 4: Content Pages | Complete |
| PAGE-10 | Phase 4: Content Pages | Complete |
| LIVE-01 | Phase 3: Core Pages | Complete |
| LIVE-02 | Phase 3: Core Pages | Complete |
| UX-01 | Phase 5: Design & Polish | Complete |
| UX-02 | Phase 5: Design & Polish | Complete |
| UX-03 | Phase 5: Design & Polish | Complete |
| UX-04 | Phase 5: Design & Polish | Complete |
| UX-05 | Phase 5: Design & Polish | Complete |
| INFRA-01 | Phase 6: Infrastructure & Launch | Complete |
| INFRA-02 | Phase 6: Infrastructure & Launch | Complete |
| INFRA-03 | Phase 6: Infrastructure & Launch | Complete |
| INFRA-04 | Phase 1: Data Foundation | Complete |
| INFRA-05 | Phase 6: Infrastructure & Launch | Complete |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-03-05 — Phase 4 requirements marked Complete*
