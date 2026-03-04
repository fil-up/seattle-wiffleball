---
phase: "03"
plan: "03"
subsystem: "teams"
tags: ["teams", "roster", "stats", "standings", "grid"]
dependency_graph:
  requires: ["01-02", "02-01"]
  provides: ["teams-index-with-records", "team-detail-roster-stats"]
  affects: ["05-01", "05-02"]
tech_stack:
  added: []
  patterns: ["parallel-fetch", "client-side-team-filtering", "aggregate-stat-computation"]
key_files:
  created: []
  modified: ["src/app/teams/page.tsx", "src/app/teams/[id]/page.tsx"]
decisions:
  - id: "03-03-01"
    description: "Match standings to teams by franchise name (case-insensitive) using most recent year"
  - id: "03-03-02"
    description: "Team aggregate OPS is averaged across all hitters; wRC+ averaged only for qualified hitters"
  - id: "03-03-03"
    description: "Players appearing in both hitting and pitching datasets shown once with 'Both' designation"
metrics:
  duration: "6 min"
  completed: "2026-03-04"
---

# Phase 3 Plan 3: Teams Index & Detail Summary

**One-liner:** Logo-focused teams grid with hover records, team detail page with roster cards and aggregate batting/pitching stats

## What Was Done

### Task 1: Enhance teams index to logo-focused grid with records
- Transformed teams index from basic card grid to a logo-focused layout
- Added parallel fetch from `/api/teams` and `/api/standings?scope=yearly` via `Promise.all`
- Enlarged logos to `w-36 h-36 md:w-44 md:h-44` in a 5-column grid (`lg:grid-cols-5`)
- Team record (W-L, WIN%) revealed on hover with smooth opacity + translateY CSS transition
- Added `PageNavigation` component for consistent site navigation
- Logo scales up on hover (`group-hover:scale-105`)
- Cards use `rounded-xl shadow-md hover:shadow-xl` styling

### Task 2: Add roster and team stats to team detail page
- Added stats fetching: `/api/stats?category=hitting&year=${year}&qualified=false` and pitching equivalent
- Client-side team filtering by `team.name` and `team.uniqueTeamName` (case-insensitive)
- **Roster section:** Player cards in responsive grid showing name, role (Hitter/Pitcher/Both), and key stats
- Players deduplicated across hitting/pitching datasets — those in both shown as "Both"
- Each player card links to `/stats/players/${playerId}`
- **Team batting aggregate:** G (max), AVG (H/AB), HR (sum), RBI (sum), OPS (avg), wRC+ (avg of qualified)
- **Team pitching aggregate:** ERA (ER/IP*9), WHIP ((H+BB)/IP), K (sum), W-L (sum)
- Individual player breakdown tables for both batting (sorted by PA desc) and pitching (sorted by IP desc)
- Player names in breakdown tables are clickable links to their detail pages
- Added `PageNavigation` and `StatCard` helper component
- Year selector updates roster, stats, and season summary

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 03-03-01 | Match standings to teams by franchise name (case-insensitive), use most recent year | Standings use franchise name as identifier; latest year is most relevant for index display |
| 03-03-02 | Team aggregate OPS averaged across all hitters; wRC+ averaged only for qualified hitters (wrcPlus > 0) | OPS is meaningful for all players; wRC+ of 0 indicates non-qualified and would skew team average |
| 03-03-03 | Deduplicate players in both hitting and pitching datasets, show once as "Both" | Avoids duplicate roster cards; combined stat line shows both batting and pitching contributions |

## Deviations from Plan

### Parallel Execution Conflict

**Task 2** content was committed by a parallel plan executor (commit `42dfe21` from 03-01 plan) that performed a broad `git add` that swept up the team detail page changes written to disk by this executor. The content is identical to what was planned — no functional deviation occurred, only the commit attribution differs.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `85d94db` | feat(03-03): enhance teams index to logo-focused grid with records |
| 2 | `42dfe21` | (committed by parallel 03-01 executor — content matches plan exactly) |

## Verification

- [x] `npx tsc --noEmit` passes with zero errors
- [x] Teams index fetches both teams and standings data
- [x] Teams index shows large logos in 5-column grid with hover records
- [x] Team detail fetches hitting and pitching stats filtered by team
- [x] Roster section shows deduplicated player cards with role designation
- [x] Team stats section shows aggregate batting and pitching stats
- [x] Player names/cards link to `/stats/players/${playerId}`
- [x] Year selector updates all sections
- [x] Both pages have PageNavigation

## Next Phase Readiness

No blockers. Player detail page (`/stats/players/${playerId}`) does not exist yet — links will 404 until it is built (likely Phase 4 or later). This is expected and documented.
