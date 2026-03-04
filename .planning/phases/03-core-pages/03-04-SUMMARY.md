---
phase: "03-core-pages"
plan: "04"
subsystem: "leaderboards"
tags: ["leaderboards", "podium", "k9", "pitching-stats", "components"]

dependency_graph:
  requires: ["01-02", "02-01"]
  provides: ["leaderboard-podium-component", "k9-stat", "complete-pitching-categories"]
  affects: ["05-visual-polish"]

tech_stack:
  added: []
  patterns: ["podium-layout", "stat-formatters", "calculated-fields"]

file_tracking:
  key_files:
    created:
      - src/components/LeaderboardPodium.tsx
    modified:
      - src/lib/sheets.ts
      - src/app/api/leaderboards/route.ts
      - src/app/leaderboards/page.tsx

decisions:
  - id: "03-04-hitting-categories"
    description: "Hitting leaderboard categories: AVG, HR, RBI, wRC+ (removed OPS, OBP, SLG from previous set)"
  - id: "03-04-pitching-categories"
    description: "Pitching leaderboard categories: ERA, K, W, WHIP, IP, K/9, OPP AVG (expanded from 3 to 7)"
  - id: "03-04-oppavg-ascending"
    description: "OPP AVG added to ASCENDING_STATS — lower opponent batting average ranks higher"

metrics:
  duration: "4 min"
  completed: "2026-03-04"
---

# Phase 03 Plan 04: Podium-Style Leaderboards Summary

**One-liner:** Podium-layout leaderboards with K/9 calculated field, 11 stat categories (4 hitting + 7 pitching), and player linking.

## What Was Done

### Task 1: Add K/9 to pitching transforms and fix leaderboard API sort
- Added `k9` calculated field to both `transformYearlyPitching` and `transformTotalsPitching`
- K/9 formula: `(strikeouts / inningsPitched) * 9` with division-by-zero protection
- Extracted `inningsPitched` and `strikeouts` to local variables for reuse in calculation
- Added `k9: number` to `YearlyPitchingRow` and `TotalsPitchingRow` interfaces
- Added `oppAvg` to `ASCENDING_STATS` set in leaderboard API (lower is better for pitchers)
- Verified `oppAvg` already existed in both yearly and totals pitching transforms

### Task 2: Create LeaderboardPodium component and transform leaderboards page
- Created `LeaderboardPodium` component with visual podium layout for top 3 players
- Podium shows 2nd-1st-3rd ordering with gold/silver/bronze color coding and height differentiation
- Ranks 4-10 displayed in compact list rows below podium
- Graceful fallback when fewer than 3 players (shows list instead of podium)
- Replaced inline `SmallTable` component with `LeaderboardPodium` throughout
- Updated hitting categories to AVG, HR, RBI, wRC+ (from 7 stats to focused 4)
- Expanded pitching categories to ERA, K, W, WHIP, IP, K/9, OPP AVG (from 3 to 7)
- Added stat formatter map for consistent number display (3 decimals for averages, 2 for rates, etc.)
- Responsive grid layout: `grid-cols-1 md:grid-cols-2` for podium cards
- Player names link to `/stats/players/${playerId}` detail pages

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | aaaa73a | feat(03-04): add K/9 to pitching transforms and fix leaderboard sort |
| 2 | 5688e2d | feat(03-04): podium-style leaderboards with all stat categories |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Hitting categories: AVG, HR, RBI, wRC+ | Focused set per CONTEXT.md spec — removed OPS, OBP, SLG to reduce visual clutter |
| Pitching categories: ERA, K, W, WHIP, IP, K/9, OPP AVG | Complete pitching stat coverage; K/9 and OPP AVG fill gaps in original implementation |
| oppAvg sorts ascending | Lower opponent batting average is better for pitchers |
| Podium falls back to list for < 3 players | Prevents broken layout when a category has sparse data |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc --noEmit` — passes
- `npm run build` — completes successfully (exit code 0)
- K/9 field exists in both pitching transforms
- LeaderboardPodium component created and imported
- All 11 stat categories configured (4 hitting + 7 pitching)
- oppAvg in ASCENDING_STATS set

## Next Phase Readiness

No blockers. All leaderboard stat categories are now complete. Visual polish (Phase 5) can enhance podium styling further if desired.
