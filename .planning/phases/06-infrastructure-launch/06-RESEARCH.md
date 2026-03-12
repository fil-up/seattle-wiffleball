# Phase 6: Infrastructure & Launch - Research

**Researched:** 2026-03-12
**Domain:** Vercel deployment, codebase cleanup, non-developer maintainability documentation
**Confidence:** HIGH

## Summary

Phase 6 is the cleanup-and-ship phase for a Next.js 14 App Router site. The work falls into three distinct streams: (1) codebase cleanup — removing debug routes/components and deciding the fate of console statements; (2) Vercel deployment — a zero-config process for Next.js with one environment variable to set; and (3) owner documentation — writing plain-language guides for a non-developer.

The dependency cleanup requirement (INFRA-02: remove sheetrock and graceful-fs) is largely pre-resolved. `sheetrock` was already removed from `package.json` in a prior commit. `graceful-fs` is a transitive dependency of `next@14.0.3` itself — it cannot be removed without upgrading Next.js, and the requirement to remove it should be interpreted as "remove any direct reference in package.json" which is already done. The cleanup task should focus on what remains: debug pages, debug components, and the `console.error` question.

The `console.error` calls (16+ files, all in catch blocks) are legitimate error logging, not debug noise. The INFRA-03 requirement says remove "debug pages and console.logs" — the `console.log` (not `console.error`) variant does not appear anywhere in source. There are zero `console.log` calls in `src/`. The planner should treat: delete `/debug/*` routes and the 2 debug-only components (`StandingsDebug`, `TeamMapping`) as the primary cleanup task, while leaving `console.error` in catch blocks intact.

**Primary recommendation:** Deploy via Vercel dashboard (GitHub import), set `SPREADSHEET_ID` env var, delete debug pages/components, rename `SheetrockStandings` to `StandingsTable`, and write a single OWNER.md guide.

## Standard Stack

No new dependencies required for this phase. All work is subtraction (removing code) plus Vercel platform setup.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Vercel | current | Next.js hosting | Zero-config Next.js deployment, first-party support |
| Next.js | 14.0.3 (existing) | Framework | Already in use, no change needed |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Vercel Dashboard | web | Set env vars, manage deployments | One-time setup + ongoing env management |
| vercel CLI | optional | Local linking, env pull | Only needed if owner wants local dev |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel | Netlify, Railway, Fly.io | Vercel is the native platform for Next.js; zero config, best ISR/Edge support |
| Vercel Dashboard env vars | vercel.json env section | vercel.json env values are committed to git; never put secrets there |

**Installation:**
No new packages. No `npm install` step needed for this phase.

## Architecture Patterns

### Current Codebase State (What Needs Changing)

```
src/app/
├── debug/                   # DELETE ENTIRELY - 2 debug pages
│   ├── player-data/page.tsx
│   └── team-mapping/page.tsx
├── ...production pages...

src/components/
├── StandingsDebug.tsx       # DELETE - only used by debug/player-data
├── TeamMapping.tsx          # DELETE - only used by debug/team-mapping
├── PlayerBattingData.tsx    # KEEP - used in stats/teams/[team]/page.tsx (production)
├── PlayerPitchingData.tsx   # KEEP - used in stats/teams/[team]/page.tsx (production)
├── SheetrockStandings.tsx   # RENAME to StandingsTable.tsx (legacy name, production use)
└── ...
```

**Critical distinction:** `PlayerBattingData` and `PlayerPitchingData` have confusingly debug-sounding names but are used in the production team detail page (`src/app/stats/teams/[team]/page.tsx`). Delete only `StandingsDebug` and `TeamMapping` components. Leave `PlayerBattingData`/`PlayerPitchingData` intact.

### Pattern 1: Vercel Zero-Config Next.js Deployment

**What:** Vercel auto-detects Next.js and sets build command (`next build`), output directory (`.next`), install command (`npm install`). No `vercel.json` needed for a standard Next.js app.
**When to use:** Always for new Next.js deployments — override only if project uses a non-root directory or custom build pipeline.
**Steps:**
1. Push code to GitHub (already done — main branch)
2. Go to vercel.com → New Project → Import from GitHub
3. Vercel detects Next.js automatically
4. Add environment variable: `SPREADSHEET_ID` = `<sheets-id>` (Production + Preview environments)
5. Deploy

No `vercel.json` file is needed. The existing `next.config.js` is sufficient.

### Pattern 2: Server-Only Environment Variables

**What:** `SPREADSHEET_ID` (without `NEXT_PUBLIC_` prefix) is already correctly configured as a server-only variable in `src/lib/sheets.ts`. This means it stays in Vercel's environment variable settings as-is — no prefix needed, no client exposure.

**Verification:** The variable is read only in `src/lib/sheets.ts`, which runs server-side. It correctly throws if missing at module load time:
```typescript
// src/lib/sheets.ts
const SPREADSHEET_ID = process.env.SPREADSHEET_ID
if (!SPREADSHEET_ID) {
  throw new Error('SPREADSHEET_ID environment variable is not set.')
}
```

### Pattern 3: Console Statement Handling

**What:** All 16 `console.error` calls are in catch blocks — they are legitimate server-side error logging, not debug noise. There are zero `console.log`, `console.debug`, `console.warn`, or `console.info` calls in `src/`.

**Decision:** Keep all `console.error` calls. The INFRA-03 requirement targets "debug console.logs" — and there are none. The requirement is already satisfied for console statements. Do not strip `console.error` from catch blocks; they are the only error visibility the server-side has.

### Anti-Patterns to Avoid

- **Do not add vercel.json with env values:** Environment variable values in `vercel.json` are committed to git. Use the Vercel dashboard for `SPREADSHEET_ID`.
- **Do not add NEXT_PUBLIC_ prefix to SPREADSHEET_ID:** The sheet ID would be exposed in every JavaScript bundle sent to browsers. It's correctly server-only now.
- **Do not delete PlayerBattingData or PlayerPitchingData:** Despite their debug-suggestive names, they are used in production team detail pages.
- **Do not remove graceful-fs from package.json:** It is not in `package.json` directly. It is a transitive dep of `next`. No action needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hiding debug pages from production | Route-level auth, feature flags | Delete the files | Debug pages need to simply not exist |
| Environment variable documentation | Custom config UI | Vercel dashboard + OWNER.md | Owner only needs to know: Settings > Env Vars |
| Deployment automation | Custom CI scripts | Vercel GitHub integration | Auto-deploy on push to main is built-in |

**Key insight:** This phase is almost entirely subtraction. The risk is accidentally deleting production-used components while targeting debug ones.

## Common Pitfalls

### Pitfall 1: Deleting Production Components Named Like Debug Components

**What goes wrong:** `PlayerBattingData` and `PlayerPitchingData` sound like debug component names (they were originally created for the `/debug/player-data` page) but are now the real components used on `stats/teams/[team]/page.tsx`. Deleting them breaks team detail pages.
**Why it happens:** Debug pages were the initial consumers, production pages were added later, component names were never updated.
**How to avoid:** Before deleting any component, run `grep -r "ComponentName" src/app` to verify all usages. Only `StandingsDebug` and `TeamMapping` are exclusively used by debug pages.
**Warning signs:** TypeScript compile error after deletion — catch this before deployment.

### Pitfall 2: graceful-fs Is Not a Direct Dependency

**What goes wrong:** The requirement says "remove graceful-fs from package.json" but it's not there — it's a transitive dep of `next@14.0.3`. Trying to `npm uninstall graceful-fs` either does nothing or breaks things.
**Why it happens:** Historical requirement written when graceful-fs was a direct dep; it was already removed.
**How to avoid:** Check `package.json` before any uninstall. `sheetrock` is already gone. `graceful-fs` can't be touched. Requirement is satisfied.

### Pitfall 3: Missing SPREADSHEET_ID Causes Build Failure at Runtime, Not Build Time

**What goes wrong:** `next build` succeeds even without `SPREADSHEET_ID` set, because the variable is read at runtime (API route invocations), not at build time. The site deploys but every data fetch returns 500 errors.
**Why it happens:** Server components can check env vars at build time, but API routes run at request time. The existing `throw new Error` in `sheets.ts` fires at runtime.
**How to avoid:** Verify `SPREADSHEET_ID` is set in Vercel before deploying, then test a data-fetching page after first deployment.
**Warning signs:** All stats/standings pages show error states after deployment.

### Pitfall 4: SheetrockStandings Name Causes Owner Confusion

**What goes wrong:** The component is named after the now-removed `sheetrock` library. While this doesn't break anything, it creates confusion if the owner ever needs to troubleshoot, and it's "dead code smell" that makes the codebase harder to maintain.
**Why it happens:** Component created during the sheetrock era, never renamed after the library was removed.
**How to avoid:** Rename `SheetrockStandings.tsx` → `StandingsTable.tsx` and update the single import in `src/app/stats/teams/page.tsx`.

### Pitfall 5: Owner Documentation Must Be GitHub-Accessible

**What goes wrong:** Documentation written as a local file that the owner never finds. The non-developer owner needs to be able to update news and environment variables without needing to clone the repo or read code.
**Why it happens:** Developers think in repo terms; non-developers think in "what website/app do I go to?"
**How to avoid:** Write `OWNER.md` in the repo root with GitHub-viewable markdown. Point the owner to GitHub's web editor for markdown news files. Include Vercel dashboard URL for env var updates.

## Code Examples

### Deleting a Debug Route (filesystem)
```bash
# These are the only files/dirs to delete
rm -rf src/app/debug/
rm src/components/StandingsDebug.tsx
rm src/components/TeamMapping.tsx
```

### Renaming SheetrockStandings
```bash
# 1. Rename file
mv src/components/SheetrockStandings.tsx src/components/StandingsTable.tsx

# 2. Update the component name inside the file
# Change: const SheetrockStandings: React.FC = () =>
# To:     const StandingsTable: React.FC = () =>

# 3. Update the single import in stats/teams page
# Change: import SheetrockStandings from '@/components/SheetrockStandings'
# To:     import StandingsTable from '@/components/StandingsTable'
```

### Vercel Environment Variable Setup
```
Vercel Dashboard:
Project Settings → Environment Variables → Add New

Key:         SPREADSHEET_ID
Value:       <the-google-sheets-id>
Environment: Production ✓, Preview ✓, Development (optional)
```

### Verifying Build Locally Before Deploy
```bash
# Run production build to catch TypeScript/ESLint errors
npm run build

# Expected output includes:
# ✓ Compiled successfully
# No TypeScript errors
```

### Owner News Article Format
```markdown
---
title: "Article Title Here"
date: "2026-03-12"
excerpt: "One sentence summary shown on the home page and news list."
image: "/images/news/optional-image.jpg"
tag: "Announcement"
---

Article body in plain markdown goes here.

## Subheadings work like this

- Bullet lists work
- Like this
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| sheetrock (client-side sheets) | gviz API via server-side API routes | Phase 1 | Already removed from package.json |
| Prisma/SQLite | Google Sheets gviz API | Phase 1 | Already removed |
| Debug pages for data inspection | N/A — delete them | This phase | Clean production codebase |

**Deprecated/outdated:**
- `SheetrockStandings` component name: Named after the removed sheetrock library; rename to `StandingsTable`
- `/debug/player-data` and `/debug/team-mapping` routes: Development-only inspection pages; delete before launch

## Open Questions

1. **Should console.error be kept in client-side catch blocks?**
   - What we know: All 16 `console.error` calls are in catch blocks; 8 are in API routes (server-side), 8 are in client page components (client-side). The client-side ones do show in browser dev tools in production.
   - What's unclear: Whether the requirement to remove "console.logs" extends to `console.error` in client catch blocks. Client-side `console.error` is not harmful or a security concern but is visible in DevTools.
   - Recommendation: Keep all `console.error` — they are legitimate error visibility. The requirement targets "debug console.logs" which are already absent. If the planner wants to be strict, client-side ones can be stripped; server-side API route ones should stay.

2. **Should PlayerBattingData and PlayerPitchingData be renamed?**
   - What we know: They are used in production but their names suggest debug provenance.
   - What's unclear: Whether renaming is in scope for INFRA-03 ("clean codebase").
   - Recommendation: Rename is nice-to-have, not required for launch. Defer unless time allows.

## Sources

### Primary (HIGH confidence)
- Next.js official docs (https://nextjs.org/docs/app/guides/environment-variables) — env variable handling, NEXT_PUBLIC_ vs server-only, lastUpdated 2026-02-27
- Vercel official docs (https://vercel.com/docs/deployments/configure-a-build) — build configuration, zero-config Next.js
- Vercel official docs (https://vercel.com/docs/environment-variables) — env var management, environments
- Vercel official docs (https://vercel.com/docs/deployments/environments) — Production/Preview/Development environments
- Direct codebase inspection — package.json, console statement grep, component usage grep

### Secondary (MEDIUM confidence)
- Vercel project configuration docs (https://vercel.com/docs/projects/project-configuration) — vercel.json properties

### Tertiary (LOW confidence)
- None used

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Vercel + Next.js is verified via official docs; no new dependencies
- Architecture: HIGH — Based on direct codebase inspection; all files examined
- Pitfalls: HIGH — Pitfalls 1, 2, 3 are based on verified codebase inspection; Pitfall 4, 5 are based on pattern knowledge

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable domain — Vercel deployment patterns, npm dependency management)
