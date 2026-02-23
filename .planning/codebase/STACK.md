# Technology Stack

**Analysis Date:** 2025-02-23

## Languages

**Primary:**
- TypeScript 5.3.2 - All application code in `src/`, scripts, config

**Secondary:**
- JavaScript - `next.config.js`, `postcss.config.js` (legacy config files)

## Runtime

**Environment:**
- Node.js (target ES2018 per `tsconfig.json`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.0.3 - React framework, App Router, API routes
- React 18.2.0 - UI components

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript 5.3.2 - Type checking
- PostCSS 8.4.31 - CSS processing
- Tailwind CSS 3.3.5 - Utility-first styling
- Autoprefixer 10.4.16 - Vendor prefixes
- ts-node 10.9.2 - Run TypeScript scripts (import script)
- ESLint 8.54.0 + eslint-config-next 14.0.3 - Linting

## Key Dependencies

**Critical:**
- `@prisma/client` ^5.6.0 - Database ORM, used in `src/lib/prisma.ts` and all API routes
- `next` 14.0.3 - Framework core
- `react` ^18.2.0, `react-dom` ^18.2.0 - UI
- `@tanstack/react-table` ^8.10.7 - Sortable/filterable stats tables in `src/components/StatsTable.tsx`

**Infrastructure:**
- `googleapis` ^131.0.0 - Google Sheets API (scripts only, `scripts/import-data.ts`)
- `axios` ^1.6.2 - HTTP client for CSV fallback when fetching Google Sheets (scripts only)
- `remark` ^15.0.1 - In package.json; not imported in `src/` (news uses custom regex markdown in `src/lib/news.ts`)
- `sheetrock` ^1.2.0 - In package.json; not imported anywhere (unused)
- `graceful-fs` ^4.2.11 - In package.json; not directly imported (likely transitive)

## Configuration

**Environment:**
- No `.env` or `.env.example` committed
- Required vars documented in `scripts/import-data.ts` and `src/app/api/admin/import/route.ts`
- Path alias: `@/*` → `./src/*` in `tsconfig.json`

**Build:**
- `next.config.js` - Images unoptimized, no remote patterns
- `tailwind.config.ts` - Content paths for `src/`, custom primary/secondary colors
- `postcss.config.js` - tailwindcss, autoprefixer
- `tsconfig.json` - ES2018, strict, bundler module resolution

## Platform Requirements

**Development:**
- Node.js (version not pinned; no `.nvmrc` or `.node-version`)
- SQLite database at `prisma/dev.db` (created by `prisma db push`)

**Production:**
- Deployment target not configured (no `vercel.json`, no CI/CD in repo)
- SQLite file-based DB; must persist `prisma/dev.db` or configure `DATABASE_URL` for production DB

---

*Stack analysis: 2025-02-23*
