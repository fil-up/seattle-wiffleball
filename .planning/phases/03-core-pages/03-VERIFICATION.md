---
phase: 03-core-pages
verified: 2026-03-04T23:30:00Z
status: passed
score: 14/14 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 11/14
  gaps_closed:
    - "Player detail page created at /stats/players/[id] — links from team roster and leaderboards now resolve"
    - "Leaderboards year selector defaults to current season (most recent year) instead of 'all'"
  gaps_remaining: []
  regressions: []
---

# Phase 3: Core Pages Verification Report

**Phase Goal:** The site's primary pages exist and display correct, live data with working navigation between them
**Verified:** 2026-03-04T23:30:00Z
**Status:** passed
**Re-verification:** Yes — after gap closure (plan 03-05)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Desktop nav shows Home, News, Players, Teams, Leaderboards, Schedule, and Media links | ✓ VERIFIED | PageNavigation.tsx lines 6-14 define all 7 nav links |
| 2 | Mobile hamburger menu opens and closes, showing all nav links | ✓ VERIFIED | PageNavigation.tsx uses useState toggle (line 17), hamburger/close icons (lines 54-63), mobile menu renders all navLinks (lines 68-84) |
| 3 | GameChangerWidget accepts maxGames prop and renders GC scoreboard | ✓ VERIFIED | GameChangerWidget.tsx accepts `maxGames` prop, loads GC SDK script, calls `gc.scoreboard.init` |
| 4 | YouTubeEmbed renders a lite YouTube embed that loads iframe only on click | ✓ VERIFIED | YouTubeEmbed.tsx uses `react-lite-youtube-embed` library |
| 5 | YouTube API route returns video data from RSS feed in { data, stale } envelope | ✓ VERIFIED | api/youtube/route.ts fetches RSS XML, parses entries, returns `{ data, stale }` envelope |
| 6 | Home page shows hero, standings sidebar, news section, quick links, and compact GC widget | ✓ VERIFIED | page.tsx: hero, GC widget with maxGames=2, news+standings 2-col layout, quick links grid |
| 7 | Home page no longer has Featured Teams section | ✓ VERIFIED | No "Featured Teams" text found in codebase |
| 8 | Schedule page displays full-size GameChanger scoreboard widget | ✓ VERIFIED | schedule/page.tsx renders `<GameChangerWidget maxGames={10} />` |
| 9 | Media page displays YouTube video gallery or empty state | ✓ VERIFIED | media/page.tsx fetches /api/youtube, shows loading/empty/grid states |
| 10 | Teams index shows all teams with large logos and name/record visible on hover | ✓ VERIFIED | teams/page.tsx: logos, hover reveals record, fetches from /api/teams + /api/standings |
| 11 | Team detail page shows roster, aggregate batting/pitching stats, year selector | ✓ VERIFIED | teams/[id]/page.tsx: year selector, roster with player cards, team batting/pitching stats |
| 12 | Clicking a player card navigates to player detail page | ✓ VERIFIED | teams/[id]/page.tsx lines 277, 323, 367: Link href={`/stats/players/${playerId}`}; page exists at src/app/stats/players/[id]/page.tsx |
| 13 | Leaderboards page shows podium-style top 3 with categories AVG, HR, RBI, wRC+, ERA, K, W, WHIP, IP, K/9, OPP AVG | ✓ VERIFIED | LeaderboardPodium.tsx + leaderboards/page.tsx define all 11 stat categories |
| 14 | Leaderboards year selector defaults to current season | ✓ VERIFIED | leaderboards/page.tsx lines 69-72: `if (ys.length > 0) setYear(String(ys[0]))` — sets to most recent year; `else setYear('all')` only when no years |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/PageNavigation.tsx` | Responsive nav with 7 links | ✓ VERIFIED | 88 lines, all links present, mobile toggle |
| `src/components/GameChangerWidget.tsx` | GC scoreboard embed | ✓ VERIFIED | Loads SDK, inits widget with widgetId |
| `src/components/YouTubeEmbed.tsx` | Lite YT embed | ✓ VERIFIED | Uses react-lite-youtube-embed |
| `src/components/StandingsWidget.tsx` | Compact standings sidebar | ✓ VERIFIED | Fetches standings, renders sorted table |
| `src/components/LeaderboardPodium.tsx` | Podium-style leaderboard display | ✓ VERIFIED | Gold/silver/bronze config, top 3 + ranks 4-10, links to /stats/players/[id] |
| `src/app/api/youtube/route.ts` | YouTube RSS API | ✓ VERIFIED | Parses RSS XML, returns { data, stale } |
| `src/app/api/leaderboards/route.ts` | Leaderboards API | ✓ VERIFIED | Sort + filter + limit, ascending for ERA/WHIP/OPP AVG |
| `src/app/page.tsx` | Home page | ✓ VERIFIED | Hero + GC + news + standings + quick links |
| `src/app/schedule/page.tsx` | Schedule page | ✓ VERIFIED | Full-size GC widget |
| `src/app/media/page.tsx` | Media page | ✓ VERIFIED | YouTube gallery with loading/empty/grid |
| `src/app/teams/page.tsx` | Teams index | ✓ VERIFIED | Team cards with logos, hover reveals record |
| `src/app/teams/[id]/page.tsx` | Team detail | ✓ VERIFIED | Roster + team stats + year selector + player links |
| `src/app/leaderboards/page.tsx` | Leaderboards page | ✓ VERIFIED | Year defaults to latest (line 71), all categories |
| `src/app/stats/players/[id]/page.tsx` | Player detail page | ✓ VERIFIED | 216 lines, fetches /api/players/[id], career hitting + pitching by year |
| `src/app/api/players/[id]/route.ts` | Player detail API | ✓ VERIFIED | Fetches hitting + pitching by player ID |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Home page | /api/youtube | fetch in useEffect | ✓ WIRED | Fetches videos, renders if available |
| Home page | StandingsWidget | Component import | ✓ WIRED | Rendered in sidebar |
| Home page | GameChangerWidget | Component import | ✓ WIRED | maxGames=2 |
| Schedule page | GameChangerWidget | Component import | ✓ WIRED | maxGames=10 |
| Media page | /api/youtube | fetch in useEffect | ✓ WIRED | Fetches 12 videos |
| Media page | YouTubeEmbed | Component import | ✓ WIRED | Renders per-video embed |
| Teams index | /api/teams | fetch in useEffect | ✓ WIRED | Loads team list |
| Teams index | /api/standings | fetch in useEffect | ✓ WIRED | Loads records |
| Teams index → Team detail | Link href | Next.js Link | ✓ WIRED | `/teams/${team.id}` → [id]/page.tsx |
| Team detail | /api/teams/[id] | fetch in useEffect | ✓ WIRED | Loads team + standings |
| Team detail | /api/stats | fetch in useEffect | ✓ WIRED | Loads hitting + pitching |
| Team detail → Player detail | Link href | Next.js Link | ✓ WIRED | `/stats/players/${playerId}` → [id]/page.tsx exists |
| Leaderboards | /api/leaderboards | fetch in useEffect | ✓ WIRED | Fetches per-stat with year filter |
| Leaderboards → Player detail | Link in LeaderboardPodium | Next.js Link | ✓ WIRED | `/stats/players/${playerId}` → [id]/page.tsx exists |
| Player detail | /api/players/[id] | fetch in useEffect | ✓ WIRED | Fetches hitting + pitching, renders tables |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| PAGE-01: Home page with hero, standings, news, quick links | ✓ SATISFIED | — |
| PAGE-03: Teams index with all teams, logos, records | ✓ SATISFIED | — |
| PAGE-04: Team detail with roster, season records, team stats | ✓ SATISFIED | Player links now resolve |
| PAGE-06: Leaderboards with top performers by stat category | ✓ SATISFIED | Year defaults to current; player links resolve |
| LIVE-01: GameChanger widget for schedule/scores | ✓ SATISFIED | — |
| LIVE-02: YouTube video streams | ✓ SATISFIED | Channel ID needs configuration but code complete |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/youtube/route.ts` | 3 | `TODO: Replace with Seattle Wiffle YouTube channel ID` | ℹ️ Info | Expected — requires real channel ID for production |
| `src/app/api/youtube/route.ts` | 4 | `const CHANNEL_ID = ''` | ℹ️ Info | Empty channel ID — gracefully handled with empty state |

### Human Verification Required

### 1. GameChanger Widget Renders Correctly
**Test:** Visit /schedule page and verify the GameChanger scoreboard loads
**Expected:** Widget loads GC SDK script, renders a scoreboard with games from widgetId
**Why human:** External widget depends on GC SDK loading and valid widgetId

### 2. Navigation Responsiveness
**Test:** Resize browser below md breakpoint, click hamburger, verify all links appear
**Expected:** Hamburger icon appears, clicking reveals all 7 nav links, clicking a link closes menu
**Why human:** Visual/interactive behavior

### 3. Team Logo Display
**Test:** Visit /teams and verify logos load for all teams
**Expected:** Each team card shows logo, name, record on hover
**Why human:** Depends on actual image files at `/images/teams/` paths

### 4. Home Page Hero Visual
**Test:** Visit / and verify hero section displays correctly
**Expected:** Background GIF, logo, title with gold text shadow
**Why human:** Visual styling and image loading

### 5. Player Detail Navigation
**Test:** From /teams/[id] roster or /leaderboards, click a player name
**Expected:** Navigates to /stats/players/[id] with career hitting and pitching stats
**Why human:** End-to-end flow verification

### Re-Verification Summary

All three previously identified gaps have been closed:

1. **Player detail page** — `src/app/stats/players/[id]/page.tsx` now exists (216 lines). Fetches from `/api/players/[id]`, displays career hitting and pitching stats by year. Links from team roster (teams/[id]) and leaderboard podium (LeaderboardPodium.tsx) now resolve correctly.

2. **Leaderboards year default** — `leaderboards/page.tsx` lines 69-72: after fetching years, `if (ys.length > 0) setYear(String(ys[0]))` sets the default to the most recent season. The "all" option remains available but is no longer the default.

3. **Leaderboard player links** — Same root cause as #1; resolved by player detail page creation.

No regressions detected. All 14 must-haves verified against actual codebase.

---

_Verified: 2026-03-04T23:30:00Z_
_Verifier: Claude (gsd-verifier)_
