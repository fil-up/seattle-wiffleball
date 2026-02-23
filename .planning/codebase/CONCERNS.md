# Codebase Concerns

**Analysis Date:** 2025-02-23

## Tech Debt

**Dual data sources (Google Sheets vs Prisma):**
- Issue: Player stats, team stats, standings, and leaderboards pull from different backends. `src/app/stats/players/page.tsx` fetches directly from Google Sheets. Leaderboards (`src/app/api/leaderboards/route.ts`), players API (`src/app/api/players/route.ts`), and team detail API (`src/app/api/teams/[id]/route.ts`) use Prisma/SQLite.
- Files: `src/app/stats/players/page.tsx`, `src/app/api/leaderboards/route.ts`, `src/app/api/players/route.ts`, `src/app/api/stats/route.ts`, `src/app/api/teams/[id]/route.ts`, `src/components/SheetrockStandings.tsx`, `src/app/stats/teams/[team]/page.tsx`
- Impact: Inconsistent data between pages, duplicate parsing logic, harder to maintain. Stats/players page shows different data than leaderboards.
- Fix approach: Consolidate on Prisma as source of truth. Run import script regularly (or on schedule). Migrate stats/players page to use `/api/players` and `/api/stats` instead of direct Google Sheets fetches.

**Hardcoded spreadsheet ID:**
- Issue: Google Spreadsheet ID `1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek` is duplicated in 12+ files.
- Files: `scripts/import-data.ts`, `src/app/api/teams/route.ts`, `src/components/SheetrockStandings.tsx`, `src/app/stats/players/page.tsx`, `src/app/stats/teams/[team]/page.tsx`, `src/components/PlayerBattingData.tsx`, `src/components/PlayerPitchingData.tsx`, `src/components/TeamMapping.tsx`, `src/components/StandingsDebug.tsx`
- Impact: Changing spreadsheet requires edits in many places; easy to miss one.
- Fix approach: Add `NEXT_PUBLIC_SPREADSHEET_ID` (or `SPREADSHEET_ID`) to env and a shared config module. Import from config in all consumers.

**In-memory sorting instead of DB ordering:**
- Issue: Leaderboards and stats APIs load full result sets and sort in JavaScript.
- Files: `src/app/api/leaderboards/route.ts` (lines 37–41, 76–80, 93–97, 118–124), `src/app/api/stats/route.ts` (lines 24–28, 46–50)
- Impact: Does not scale; all rows loaded into memory. With thousands of stats rows, response time and memory grow.
- Fix approach: Use Prisma `orderBy` and `take` in the query. Add indexes for commonly sorted columns.

**Fragile Google Sheets response parsing:**
- Issue: Multiple places use `text.substring(47).slice(0, -2)` to strip Google Visualization API wrapper before `JSON.parse`.
- Files: `src/app/api/teams/route.ts` (line 16), `src/components/SheetrockStandings.tsx` (lines 63, 106), `src/app/stats/teams/[team]/page.tsx` (lines 53, 91), `src/components/TeamMapping.tsx`
- Impact: If Google changes response format or prefix length, parsing breaks across the app.
- Fix approach: Use a robust parser (e.g. regex for `google.visualization.Query.setResponse(...)`) or a dedicated library. Centralize parsing in one utility.

**Hardcoded team config:**
- Issue: `src/config/teams.ts` defines a static list of 10 teams. Home page "Featured Teams" uses this; other pages use API/Sheets data.
- Files: `src/config/teams.ts`, `src/app/page.tsx`
- Impact: New teams require code changes. Featured teams can diverge from actual league teams.
- Fix approach: Load featured teams from API or env. Remove or minimize static config.

## Known Bugs

**Team ID mismatch (teams index vs team detail):**
- Symptoms: Clicking a team from `/teams` can show "Loading..." indefinitely or broken layout. `/api/teams` returns teams with `id: franchiseCurrentCode.toLowerCase()` (e.g. `100-percent-real-juice`). `/api/teams/[id]` uses Prisma `findUnique({ where: { id: params.id } })`, which expects a UUID.
- Files: `src/app/teams/page.tsx`, `src/app/teams/[id]/page.tsx`, `src/app/api/teams/route.ts`, `src/app/api/teams/[id]/route.ts`
- Trigger: Visit `/teams`, click any team. Request goes to `/api/teams/100-percent-real-juice` (or similar). Prisma finds no team with that id; returns 404. Page sets `team = { error: 'Team not found' }` and renders with undefined `team.name`.
- Workaround: Use `/stats/teams` and `/stats/teams/[abbreviation]` for team pages; those use Google Sheets and work correctly.

**Division by zero in franchise totals:**
- Symptoms: Team detail API can compute `winningPercentage` as `(acc.wins + stat.wins) / (acc.wins + acc.losses + stat.wins + stat.losses)` when denominator is 0.
- Files: `src/app/api/teams/[id]/route.ts` (lines 33–41)
- Trigger: Team with no games (all zeros) in `teamStats`.
- Fix approach: Guard with `const total = acc.wins + acc.losses + stat.wins + stat.losses; winningPercentage: total > 0 ? (acc.wins + stat.wins) / total : 0`.

**Stats/players totals scope wrong sheet:**
- Issue: In totals scope, hitting fetches from "IP" sheet (`sheet=IP&range=C2:AL600`) instead of "IH". Comment says "Batting all-time totals" but uses pitching sheet.
- Files: `src/app/stats/players/page.tsx` (lines 81–82)
- Impact: All-time hitting totals may show incorrect or empty data.
- Fix approach: Use `sheet=IH` (or correct sheet) for hitting totals.

## Security Considerations

**Import endpoint secret in URL:**
- Risk: `x-import-secret` can be passed via query param: `new URL(request.url).searchParams.get('secret')`. Secrets in URLs are logged by proxies, browsers, and referrers.
- Files: `src/app/api/admin/import/route.ts` (line 8)
- Current mitigation: Header is preferred; query is fallback.
- Recommendations: Remove query param support. Use header only. Document that `IMPORT_SECRET` must be set and never logged.

**Admin import spawns child process:**
- Risk: Import route spawns `ts-node scripts/import-data.ts` with full `process.env`. If env is compromised, script has full access.
- Files: `src/app/api/admin/import/route.ts` (lines 16–18)
- Current mitigation: Secret check before execution.
- Recommendations: Run import as a separate job (cron, queue) rather than HTTP. If HTTP is required, restrict to internal network or add IP allowlist.

**No rate limiting on APIs:**
- Risk: Public GET endpoints (`/api/players`, `/api/stats`, `/api/leaderboards`, `/api/teams`) have no rate limiting.
- Files: All API route handlers
- Current mitigation: None.
- Recommendations: Add rate limiting middleware (e.g. `@upstash/ratelimit`) for production. Prioritize write/admin endpoints.

**Dangerously rendered HTML in news:**
- Risk: `dangerouslySetInnerHTML` used for article content. If news data is ever user-editable or from external source, XSS is possible.
- Files: `src/app/news/[slug]/page.tsx` (line 86), `src/lib/news.ts`
- Current mitigation: Content comes from `src/data/news.json` (static).
- Recommendations: Keep news as static/build-time only. If adding CMS, sanitize HTML (e.g. DOMPurify) before render.

## Performance Bottlenecks

**Full table scans for leaderboards:**
- Problem: `findMany` with no `orderBy` loads all qualified stats, then sorts and slices in JS.
- Files: `src/app/api/leaderboards/route.ts`, `src/app/api/stats/route.ts`
- Cause: Prisma queries lack `orderBy` and `take`.
- Improvement path: Add `orderBy: { [stat]: 'desc' }` (or `asc` for ERA/WHIP) and `take: limit` to the Prisma query.

**Players API loads all players with stats:**
- Problem: `prisma.player.findMany` with full `include` for hitting, pitching, teams. No pagination.
- Files: `src/app/api/players/route.ts`
- Cause: Single query returns all players and nested relations.
- Improvement path: Add pagination (`skip`/`take`). Consider separate endpoints for list (minimal fields) vs detail.

**Client-side fetches to Google Sheets:**
- Problem: `SheetrockStandings`, `stats/players`, `stats/teams/[team]` fetch from Google Sheets from the browser.
- Files: `src/components/SheetrockStandings.tsx`, `src/app/stats/players/page.tsx`, `src/app/stats/teams/[team]/page.tsx`
- Cause: Each user triggers Sheets requests; no caching; CORS and latency from Google.
- Improvement path: Proxy through Next.js API routes. Add caching (e.g. `revalidate` or Redis). Prefer Prisma after consolidating data sources.

## Fragile Areas

**Stats/players column indices:**
- Files: `src/app/stats/players/page.tsx` (e.g. cells[0]–cells[34])
- Why fragile: Column positions are hardcoded. Sheet layout changes break parsing.
- Safe modification: Add header-row detection and map by header name (like `scripts/import-data.ts`). Or use Prisma-backed API.

**Team mapping header detection:**
- Files: `scripts/import-data.ts` (lines 143–147), `src/app/api/teams/route.ts`
- Why fragile: Relies on substring matching (`h.includes('unique') && h.includes('teams')`). Typos or renames in sheet break import.
- Safe modification: Validate required headers at startup; fail fast with clear error. Document expected column names.

**Debug console.log in production code:**
- Files: `src/app/stats/teams/[team]/page.tsx` (lines 111–114, 184–192)
- Why fragile: Verbose logging in hot path; clutters console; potential info leak.
- Safe modification: Remove or guard with `if (process.env.NODE_ENV === 'development')`.

## Scaling Limits

**SQLite for production:**
- Current: `prisma/schema.prisma` uses `provider = "sqlite"` and `file:./dev.db`.
- Limit: SQLite is single-writer; not suitable for high concurrency. File-based DB can be problematic on serverless (e.g. Vercel).
- Scaling path: Migrate to PostgreSQL (or similar) for production. Use `DATABASE_URL` env. Update schema and run migrations.

**No caching layer:**
- Current: Every request hits DB or Google Sheets.
- Limit: Under load, repeated identical queries (e.g. standings, leaderboards) stress both.
- Scaling path: Add caching (Next.js `revalidate`, Redis, or CDN) for read-heavy endpoints.

## Dependencies at Risk

**sheetrock package:**
- Risk: `package.json` includes `sheetrock` but codebase uses raw `fetch` to Google Sheets gviz/tq URLs. Sheetrock may be unused or used only in legacy paths.
- Impact: Unused dependency adds bundle size and potential vulnerabilities.
- Migration plan: Grep for `sheetrock` usage. Remove if unused. If used, ensure it's only in necessary paths.

**next 14.0.3:**
- Risk: Next.js 14 has had multiple releases; 14.0.3 may miss security and stability fixes.
- Impact: Potential bugs and CVEs.
- Migration plan: Upgrade to latest 14.x or 15.x. Run tests and verify App Router behavior.

## Missing Critical Features

**No tests:**
- Problem: No `*.test.*` or `*.spec.*` files. No Jest/Vitest config detected.
- Blocks: Safe refactors; regression detection; CI quality gates.
- Fix approach: Add Vitest (or Jest). Start with API route tests and critical utilities (e.g. `scripts/import-data.ts` parsing).

**Rules page link with no route:**
- Problem: Home page links to `/rules` (`src/app/page.tsx` line 254). No `src/app/rules/page.tsx` found.
- Blocks: 404 on click.
- Fix approach: Create `src/app/rules/page.tsx` or remove/update the link.

## Test Coverage Gaps

**Entire codebase untested:**
- What's not tested: All API routes, import script, Google Sheets parsing, Prisma usage, React components.
- Files: All of `src/`, `scripts/`
- Risk: Changes can break behavior without detection.
- Priority: High. Start with import script and API routes that affect data integrity.

---

*Concerns audit: 2025-02-23*
