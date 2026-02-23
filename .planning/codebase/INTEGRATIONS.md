# External Integrations

**Analysis Date:** 2025-02-23

## APIs & External Services

**Google Sheets:**
- Used for: League stats import (hitting, pitching, standings)
- SDK/Client: `googleapis` (Sheets API v4)
- Auth: Service account via env vars (see below)
- Implementation: `scripts/import-data.ts` - reads spreadsheet `1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek`
- Fallback: Public CSV export via `axios` when credentials absent (`https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:csv&sheet={name}`)

## Data Storage

**Databases:**
- SQLite via Prisma
  - Connection: `file:./dev.db` in `prisma/schema.prisma`
  - Client: `@prisma/client`, singleton in `src/lib/prisma.ts`

**File Storage:**
- Local filesystem only
- Team logos: `/images/teams/*.png` (static assets in `public/images/teams/`)
- News content: `src/data/news.json` (static JSON)

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None for public web app
- Admin import endpoint: Bearer-style secret via `x-import-secret` header or `?secret=` query param
  - Implementation: `src/app/api/admin/import/route.ts`
  - Env: `IMPORT_SECRET`

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- `console.error` / `console.warn` in API routes and import script

## CI/CD & Deployment

**Hosting:**
- Not detected (no `vercel.json`, no platform config)

**CI Pipeline:**
- Not detected (no `.github/workflows/` or similar)

## Environment Configuration

**Required env vars (import script):**
- `GOOGLE_CLOUD_PRIVATE_KEY` - Service account private key (required for Sheets API)
- `GOOGLE_CLOUD_CLIENT_EMAIL` - Service account email
- Optional: `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_CLOUD_PRIVATE_KEY_ID`, `GOOGLE_CLOUD_CLIENT_ID`, `GOOGLE_CLOUD_AUTH_URI`, `GOOGLE_CLOUD_TOKEN_URI`, `GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL`, `GOOGLE_CLOUD_CLIENT_X509_CERT_URL`, `GOOGLE_CLOUD_UNIVERSE_DOMAIN`

**Required env vars (admin import API):**
- `IMPORT_SECRET` - Secret for `POST /api/admin/import`

**Secrets location:**
- `.env.local` (not committed; referenced in import script error message)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2025-02-23*
