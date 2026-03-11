---
status: complete
phase: 05-design-polish
source: 05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md
started: 2026-03-11T21:00:00Z
updated: 2026-03-11T21:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Light/Dark Mode Toggle
expected: Sun/moon toggle visible in nav. Clicking switches light/dark. Persists on reload.
result: issue
reported: "Toggle visible and preference persists on reload. However some text colors don't switch — appears hardcoded white in many sections site-wide (leaderboards and others). Dark mode mostly works; light mode has invisible white-on-white text in multiple areas."
severity: major

### 2. Mobile Navigation
expected: On a narrow screen (or with DevTools mobile mode), a hamburger menu icon appears. Tapping it opens a slide-in panel with nav links. Tapping a link or the backdrop closes it.
result: pass

### 3. Stats Table Sticky Headers
expected: On /stats/players, the table header row (with column names like AVG, OPS, HR) stays pinned to the top as you scroll down through players. Header background is navy/dark branded.
result: issue
reported: "Headers are not pinned when scrolling. Header background is transparent — dark in dark mode, light in light mode, not navy."
severity: major

### 4. Inline Team Logos in Stats Table
expected: On /stats/players, each player row shows a small team logo icon (16x16) next to their name.
result: issue
reported: "Most teams show logos correctly. American Dreams (abbreviation 'AD') is missing its logo — likely a team code mismatch between the spreadsheet abbreviation 'AD' and the team config."
severity: minor

### 5. Player Name Links in Stats Table
expected: On /stats/players, clicking a player's name navigates to their individual player detail page (e.g., /stats/players/john-doe).
result: issue
reported: "Links work and navigate correctly. However, stat values on the player detail page are not rounded like they are on the main stats page (e.g., showing many decimal places)."
severity: minor

### 6. Stats Loading Skeleton
expected: On /stats/players, there's a brief skeleton loading animation (pulsing placeholder rows) while data loads, instead of a blank page or "Loading..." text.
result: pass

### 7. Stats Error State with Retry
expected: If stats fail to load, an error message appears with a Retry button. Clicking Retry re-fetches the data without reloading the page.
result: skipped
reason: difficult to test without DevTools offline simulation

### 8. Stale Data Banner
expected: If the data cache is serving stale data, a gold-tinted warning banner appears at the top of the stats page with a warning icon.
result: skipped
reason: difficult to trigger on demand

### 9. Headshot Placeholder on Player Detail
expected: On a player detail page (/stats/players/[id]), a silhouette/placeholder SVG appears where a player headshot would go.
result: pass

### 10. Dark Mode — Rules Page Readable
expected: On /rules, switching to dark mode keeps the rules text legible (white text on dark background, not dark text on dark background).
result: issue
reported: "Rules body text is legible in dark mode. However the page title doesn't switch colors with theme (likely hardcoded). Also rules content appears as an unformatted block of text — numbered sections not rendering as structured markdown."
severity: major

### 11. Hall of Fame Award Icons
expected: On /hall-of-fame, MVP entries show a trophy icon and Cy Young/Batting Title entries show a star icon, both in gold.
result: issue
reported: "Icons are visible but have no color — not rendering in gold."
severity: minor

### 12. Team Detail Mobile Tabs
expected: On a team detail page (/teams/[id]) on mobile, the page shows tabs for Roster / Batting / Pitching / Records. Tapping each tab switches the visible content.
result: issue
reported: "Only 'Roster' tab is showing — Batting, Pitching, Records tabs are missing. Season dropdown is not populated and does not work."
severity: major

### 13. Home Page Hero Mobile Layout
expected: On mobile, the home page hero section stacks vertically (text on top, image/graphic below) rather than side-by-side.
result: pass

### 14. Archives Loading & Error States
expected: On /archives, a skeleton table loads while data fetches, and if it fails, an error state with a Retry button appears.
result: pass

## Summary

total: 14
passed: 5
issues: 8
pending: 0
skipped: 2

## Gaps

- truth: "All text and UI elements switch correctly between light and dark mode site-wide"
  status: failed
  reason: "User reported: some text hardcoded white, invisible in light mode — affects leaderboards and multiple sections across the site"
  severity: major
  test: 1
  artifacts: []
  missing: []

- truth: "Stats table headers are sticky (pinned to top on scroll) with a navy background"
  status: failed
  reason: "User reported: headers not pinned when scrolling; background is transparent not navy"
  severity: major
  test: 3
  artifacts: []
  missing: []

- truth: "Player name links navigate to detail page; stat values on detail page are properly rounded"
  status: failed
  reason: "User reported: links work but stat values on player detail page show too many decimal places, not rounded like the main stats table"
  severity: minor
  test: 5
  artifacts: []
  missing: []

- truth: "Rules page title switches color correctly in light/dark mode; rules content renders as structured markdown with numbered sections"
  status: failed
  reason: "User reported: title doesn't switch with theme (hardcoded color). Rules content is an unformatted block of text — numbered sections not rendering properly."
  severity: major
  test: 10
  artifacts: []
  missing: []

- truth: "Team detail page shows Roster/Batting/Pitching/Records tabs on mobile; season dropdown is populated and functional"
  status: failed
  reason: "User reported: only 'Roster' tab visible — Batting, Pitching, Records tabs missing. Season dropdown not populated and does not work."
  severity: major
  test: 12
  artifacts: []
  missing: []

- truth: "Hall of Fame award icons (trophy/star) render in gold color"
  status: failed
  reason: "User reported: icons are visible but have no color — not gold"
  severity: minor
  test: 11
  artifacts: []
  missing: []

- truth: "All player rows in stats table show an inline team logo"
  status: failed
  reason: "User reported: American Dreams (abbreviation 'AD') missing logo — likely team code mismatch"
  severity: minor
  test: 4
  artifacts: []
  missing: []
