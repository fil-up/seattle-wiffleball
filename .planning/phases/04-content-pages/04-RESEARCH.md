# Phase 4: Content Pages - Research

**Researched:** 2026-03-04
**Domain:** Next.js static content pages, Markdown parsing, accordion UI, map embeds, data-driven archives
**Confidence:** HIGH

## Summary

Phase 4 builds five content-focused pages: News (article list + detail), Rules, Archives, Info, and Hall of Fame. The codebase already has a working news system (`src/lib/news.ts` + `src/data/news.json` + `src/app/news/` routes) that uses JSON-stored markdown content with a custom regex-based markdown-to-HTML converter. The CONTEXT.md decision requires migrating to **individual `.md` files per article** with frontmatter, replacing the current single JSON file. The existing `remark` dependency (already in `package.json`) plus `gray-matter` for frontmatter parsing is the ideal stack — no need for MDX since articles are pure text content without React components.

The Rules page content has been examined from `seattlewiffleball.com/rules.html` — it's 16 well-structured sections (0.00 through 15.00) totaling ~4,000 words. This can be stored as a single markdown file or hardcoded as a static page. Archives needs standings data from the existing `/api/standings` route (which already returns yearly standings) combined with a static JSON file for season champions and award winners. Hall of Fame requires a curated JSON data file with player metadata, and AI-generated portrait images placed in `public/images/hall-of-fame/`. The Info page is purely static content with a Google Maps embed iframe.

**Primary recommendation:** Use `gray-matter` + `remark` + `remark-html` for the news article system (keeping it simple — no MDX needed). Reuse the existing `PageNavigation` component, stale data banner pattern, and `bg-[#25397B]` brand color throughout all new pages. Store all non-API content as static files (`content/` directory for markdown, `src/data/` for JSON data files).

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.0.3 | App Router, static generation | Already in use |
| React | ^18.2.0 | UI library | Already in use |
| Tailwind CSS | ^3.3.5 | Styling | Already in use throughout |
| remark | ^15.0.1 | Markdown processing | Already in package.json |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gray-matter | latest | Parse YAML frontmatter from `.md` files | News article metadata extraction |
| remark-html | latest | Convert remark AST to HTML string | Rendering markdown article content to HTML |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gray-matter + remark-html | next-mdx-remote | MDX is overkill for pure text articles — adds complexity, bundle size, and requires client-side rendering for no benefit |
| gray-matter + remark-html | Keep current JSON approach | CONTEXT.md explicitly decides on individual `.md` files; JSON approach doesn't scale well for editing long-form content |
| gray-matter + remark-html | Custom regex converter (current) | Current converter in `src/lib/news.ts` is fragile (regex-based), doesn't handle all markdown features, and will break on edge cases |
| Google Maps embed | Mapbox | Google Maps iframe embed is zero-dependency, free for basic embeds, universally recognized; Mapbox requires API key and JS library |
| Custom accordion | Headless UI / Radix | A simple `useState` toggle accordion is trivial in React+Tailwind — no library needed for this simple use case |

**Installation:**
```bash
npm install gray-matter remark-html
```

Note: `remark` is already installed at ^15.0.1.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── news/
│   │   ├── page.tsx                # News list page (EXISTS - refactor to use .md files)
│   │   └── [slug]/page.tsx         # Article detail (EXISTS - refactor)
│   ├── rules/page.tsx              # NEW - rules page
│   ├── archives/page.tsx           # NEW - archives page
│   ├── info/page.tsx               # NEW - info/about page
│   └── hall-of-fame/page.tsx       # NEW - hall of fame page
├── components/
│   ├── PageNavigation.tsx          # EXISTS - no changes needed for phase 4
│   └── SeasonAccordion.tsx         # NEW - expandable season section for archives
├── lib/
│   ├── news.ts                     # EXISTS - refactor to read .md files instead of JSON
│   └── sheets.ts                   # EXISTS - used by archives for standings data
├── data/
│   ├── news.json                   # EXISTS - REMOVE after migration to .md files
│   ├── archives.json               # NEW - season champions, awards per year
│   └── hall-of-fame.json           # NEW - inducted players, bios, stats, awards
content/
├── news/                           # NEW - one .md file per article
│   ├── round-one-playoff-preview.md
│   ├── 2025-season-preview.md
│   └── ...
└── rules.md                        # NEW - full rules content (or inline in page)
public/
└── images/
    ├── news/                       # EXISTS - article images
    │   └── 2025-wild-card-weekend.jpg
    └── hall-of-fame/               # NEW - AI-generated player bust images
        ├── player-name.png
        └── ...
```

### Pattern 1: Markdown News Articles with Frontmatter
**What:** Each news article is a `.md` file in `content/news/` with YAML frontmatter for metadata and markdown body for content.
**When to use:** All news articles.
**File format:**
```markdown
---
title: "Round One Playoff Preview"
date: "2025-08-15"
excerpt: "The playoffs are here! ..."
image: "/images/news/2025-wild-card-weekend.jpg"
tag: "Playoffs"
featured: true
---

The playoffs are here! With that comes a matchup steeped in history...

## Juice: Veteran Presence, Elite Pitching

The Juice have been in this position before...
```

**Lib function to read articles:**
```typescript
// src/lib/news.ts - refactored
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const newsDirectory = path.join(process.cwd(), 'content/news')

export function getNewsArticles(): NewsArticle[] {
  const fileNames = fs.readdirSync(newsDirectory)
  const articles = fileNames
    .filter(f => f.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(newsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      return { slug, ...data } as NewsArticle
    })
  return articles.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export async function getNewsArticleWithHtml(slug: string) {
  const fullPath = path.join(newsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const processed = await remark().use(html).process(content)
  return { slug, ...data, htmlContent: processed.toString() } as NewsArticle & { htmlContent: string }
}
```

### Pattern 2: Static Server Components for Content Pages
**What:** Rules, Info, and Hall of Fame pages should be React Server Components (no `"use client"`) since they render static content that doesn't change at runtime.
**When to use:** Any page that doesn't need client-side state or interactivity beyond basic links.
**Why:** Faster initial load, better SEO, simpler code. Only the Archives page needs `"use client"` for the accordion toggle state and standings data fetching.

### Pattern 3: Archives Page with Mixed Data Sources
**What:** The Archives page combines two data sources: (1) standings from Google Sheets via `/api/standings?scope=yearly` and (2) season metadata (champions, awards) from a static JSON file.
**When to use:** Archives page only.
**Example data flow:**
```
archives.json (static)     +     /api/standings (dynamic)
       ↓                              ↓
  { year, champion,              { team, year,
    awards: [...] }                wins, losses, pct }
       ↓                              ↓
       └──────── merge by year ────────┘
                      ↓
              SeasonAccordion component
```

### Pattern 4: Existing Page Structure to Follow
**What:** All existing pages follow a consistent structure that new pages MUST replicate.
**Structure observed in codebase:**
```tsx
// Every non-home page follows this pattern:
<div className="min-h-screen bg-gray-50">
  <PageNavigation />
  {/* Blue header section */}
  <div className="bg-[#25397B] text-white py-16">
    <div className="container mx-auto px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Page Title</h1>
      <p className="text-xl md:text-2xl text-blue-100">Subtitle</p>
    </div>
  </div>
  {/* Content */}
  <div className="container mx-auto px-4 py-16">
    {/* Page content here */}
  </div>
</div>
```
**Stale data banner (for pages fetching from API):**
```tsx
{stale && (
  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mb-4 text-sm">
    Data may be outdated — showing last known data.
  </div>
)}
```

### Anti-Patterns to Avoid
- **Don't use `"use client"` for static content pages:** Rules, Info, and Hall of Fame have no dynamic data fetching — use server components
- **Don't create new API routes for static data:** Archives awards/champions and Hall of Fame data come from JSON files read at build time, not API routes
- **Don't use the existing custom markdown regex converter:** It's fragile and doesn't handle many markdown features (tables, nested lists, etc.) — use remark + remark-html instead
- **Don't use MDX for news articles:** Articles are pure text content; MDX adds complexity for no benefit
- **Don't build a custom accordion library:** A simple `useState` toggle is sufficient for the archives page

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown to HTML | Custom regex converter (like current `convertMarkdownToHtml`) | remark + remark-html | Current converter breaks on tables, nested lists, code blocks, and many other markdown features |
| Frontmatter parsing | Custom YAML parser | gray-matter | Handles edge cases (multiline strings, arrays, booleans), battle-tested with 8M+ weekly npm downloads |
| Map embed | Custom map component with Mapbox/Leaflet | Google Maps iframe | Zero dependency, zero API key, zero JS for a simple location display |
| Accordion | Headless UI / Radix | Simple useState toggle | ~10 lines of code vs. adding a full component library for one use case |

**Key insight:** These pages are primarily about displaying static content. The complexity is in content migration and data structure design, not in the UI or libraries. Keep dependencies minimal.

## Common Pitfalls

### Pitfall 1: `remark` Async in Server Components
**What goes wrong:** `remark().process()` returns a Promise. If you call it in a Server Component render function without `await`, you get `[object Promise]` instead of HTML.
**Why it happens:** The `remark` pipeline is async by design.
**How to avoid:** Use `async` component functions or call the processing in `generateStaticParams`/data fetching layer. Next.js 14 App Router supports async server components natively.
**Warning signs:** `[object Promise]` appearing in rendered HTML.

### Pitfall 2: News Article Slug Must Match Filename
**What goes wrong:** If the slug in the URL doesn't match the filename, the article won't be found.
**Why it happens:** The `[slug]` dynamic route parameter must correspond to the `.md` filename (minus extension).
**How to avoid:** Use `generateStaticParams()` to enumerate all valid slugs from the filesystem at build time. The existing `[slug]/page.tsx` already does this.
**Warning signs:** 404 errors on article pages.

### Pitfall 3: Home Page News Preview Breaks After Migration
**What goes wrong:** The home page currently imports `getNewsArticles` from `@/lib/news` which reads from `src/data/news.json`. After migrating to `.md` files, this import still works but now reads from the filesystem.
**Why it happens:** The function signature stays the same but the data source changes.
**How to avoid:** Ensure `getNewsArticles()` returns the same `NewsArticle` interface after refactoring. The home page only uses `slug`, `title`, `date`, `excerpt`, `image`, and `featured` fields — all available from frontmatter.
**Warning signs:** Home page news section showing no articles or missing data.

### Pitfall 4: Archives Standings Data Has All Years
**What goes wrong:** The `/api/standings?scope=yearly` endpoint returns standings for ALL years (range `A54:T952`). Without filtering, you'd display a massive unorganized list.
**Why it happens:** The API is designed for the stats page which filters by year on the client.
**How to avoid:** Group standings by year on the client, then merge with archives.json data to create accordion sections per season. The standings API already includes a `year` field per row.
**Warning signs:** All standings showing ungrouped; missing years in accordion.

### Pitfall 5: Content Directory Not in `src/`
**What goes wrong:** Markdown files in `content/` (at project root) are not inside `src/`, so `@/content/news` path alias won't work.
**Why it happens:** `tsconfig.json` maps `@/*` to `./src/*`.
**How to avoid:** Use `path.join(process.cwd(), 'content/news')` to resolve the path, not a path alias. This is the standard pattern for content directories in Next.js projects.
**Warning signs:** Module not found errors.

### Pitfall 6: Google Maps Embed CSP Issues
**What goes wrong:** Google Maps iframe may be blocked by Content Security Policy headers.
**Why it happens:** Next.js may have default CSP headers that block third-party iframes.
**How to avoid:** The current `next.config.js` has no custom headers, so this shouldn't be an issue. If it does occur, add `frame-src 'self' https://www.google.com` to CSP headers.
**Warning signs:** Blank map iframe; console errors about blocked frame.

## Code Examples

### News Article Frontmatter Schema
```typescript
// NewsArticle interface - extended from current
export interface NewsArticle {
  slug: string
  title: string
  date: string        // ISO format: "2025-08-15"
  excerpt: string     // Short preview text (1-2 sentences)
  image?: string      // Path to thumbnail: "/images/news/filename.jpg"
  tag?: string        // Category label: "Recap", "Preview", "Announcement"
  featured?: boolean  // Show in featured position on home page
}
```

### Archives Data Structure
```typescript
// src/data/archives.json structure
interface ArchivesSeason {
  year: number
  champion: string
  runnerUp: string
  mvp?: string
  cyYoung?: string
  battingChamp?: string
  homeRunLeader?: string
  strikeoutLeader?: string
  rookieOfYear?: string
  notes?: string  // any special notes about the season
}

// Example entry:
{
  "year": 2025,
  "champion": "Wiffle House",
  "runnerUp": "Bilabial Stops",
  "mvp": "Sam Thomas",
  "battingChamp": "Eddie Brown",
  "notes": "Fourth consecutive title for Wiffle House"
}
```

### Hall of Fame Data Structure
```typescript
// src/data/hall-of-fame.json structure
interface HallOfFameEntry {
  id: string          // kebab-case: "aaron-hunter"
  name: string
  inductionYear: number
  image: string       // "/images/hall-of-fame/aaron-hunter.png"
  bio: string         // Written paragraph(s) about the player
  seasonsPlayed: number
  teams: string[]     // Teams played for
  awards: string[]    // e.g. ["2017 MVP", "2018 Cy Young", "2025 Batting Champion"]
  careerStats: {
    // Hitting stats
    games?: number
    avg?: number
    homeRuns?: number
    rbis?: number
    ops?: number
    wrcPlus?: number
    // Pitching stats (for two-way players)
    wins?: number
    losses?: number
    era?: number
    strikeouts?: number
    whip?: number
  }
}
```

### Simple Accordion Component for Archives
```tsx
// src/components/SeasonAccordion.tsx
"use client"
import { useState } from 'react'

interface SeasonAccordionProps {
  year: number
  champion: string
  children: React.ReactNode
}

export function SeasonAccordion({ year, champion, children }: SeasonAccordionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <span className="text-lg font-bold text-gray-900">{year} Season</span>
          <span className="ml-3 text-sm text-gray-500">Champion: {champion}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}
```

### Google Maps Embed (Info Page)
```tsx
// Cowen Park, Seattle - zero-dependency iframe embed
<div className="rounded-lg overflow-hidden shadow-md">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2687.1!2d-122.316!3d47.668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCowen+Park!5e0!3m2!1sen!2sus!4v1234567890"
    width="100%"
    height="450"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="Cowen Park - Seattle Wiffleball field location"
  />
</div>
```

## Existing Codebase Inventory

### What Already Exists (reuse or refactor)
| Asset | Location | Status for Phase 4 |
|-------|----------|---------------------|
| News list page | `src/app/news/page.tsx` | EXISTS — refactor to use `.md` file source |
| News article page | `src/app/news/[slug]/page.tsx` | EXISTS — refactor to use async remark processing |
| News lib | `src/lib/news.ts` | EXISTS — refactor from JSON to filesystem reads |
| News JSON data | `src/data/news.json` | EXISTS — migrate content to individual `.md` files, then remove |
| News image | `public/images/news/` | EXISTS — 1 image, add more during content migration |
| Home page news preview | `src/app/page.tsx` lines 157-254 | EXISTS — calls `getNewsArticles()`, will work after refactor |
| PageNavigation | `src/components/PageNavigation.tsx` | EXISTS — 7 nav links, used by all pages |
| Standings API | `src/app/api/standings/route.ts` | EXISTS — returns yearly standings, usable for archives |
| StandingsWidget | `src/components/StandingsWidget.tsx` | EXISTS — reference for standings data shape |
| Sheets lib | `src/lib/sheets.ts` | EXISTS — `fetchSheet` function with cache + stale pattern |
| Layout footer | `src/app/layout.tsx` | EXISTS — already has /rules link, may need /archives, /info links |

### What Needs to Be Created
| Asset | Location | Purpose |
|-------|----------|---------|
| Content directory | `content/news/*.md` | Individual markdown article files |
| Rules page | `src/app/rules/page.tsx` | Display league rules |
| Archives page | `src/app/archives/page.tsx` | Season history with accordion |
| Info page | `src/app/info/page.tsx` | About the league, location, join |
| Hall of Fame page | `src/app/hall-of-fame/page.tsx` | Player busts, stats, bios |
| Archives data | `src/data/archives.json` | Season champions, awards |
| Hall of Fame data | `src/data/hall-of-fame.json` | Inducted player data |
| Accordion component | `src/components/SeasonAccordion.tsx` | Expandable season sections |
| HoF player images | `public/images/hall-of-fame/*.png` | AI-generated player bust images |
| Rules content | `content/rules.md` or inline | Full rules text |

## Content Analysis

### News Articles from Old Site
The old site (seattlewiffleball.com/news.html) contains approximately 30+ articles spanning 2019-2025:
- **2025:** World Series recap, semifinal recaps, wildcard recaps, playoff previews, season preview, tournament announcement, weekly recaps (est. 15+ articles)
- **2019:** Season preview, website launch, weekly recaps weeks 1-11, World Series recap (est. 14 articles)
- **2015-2017:** Content on LeagueLineup pages — league overview, stats, and rulebook overviews (less structured, more tabular data than articles)

The existing `src/data/news.json` has 6 articles (subset of the full content). Full migration would involve creating ~30 `.md` files.

### Rules Content Structure
From `seattlewiffleball.com/rules.html`, the rules are organized into 16 numbered sections:
- 0.00 League Governance (3 rules)
- 1.00 Eligibility (5 rules)
- 2.00 Scheduling (9 rules)
- 3.00 Playoffs (4 rules)
- 4.00 Game Management (11 rules)
- 5.00 Umpiring (5 rules)
- 6.00 Field Setup (7 rules)
- 7.00 Equipment (8 rules)
- 8.00 Pitching (9 rules)
- 9.00 Batting (7 rules)
- 10.00 At-Bats (7 rules)
- 11.00 Base Running (5 rules)
- 12.00 Fielding (9 rules)
- 13.00 Tags and Plugs (4 rules)
- 14.00 Dead Balls (5 rules)
- 15.00 Respiratory Epidemic Exceptions (4 rules)

Total: ~100 individual rules across 16 sections. Content includes strikethrough text for recent revisions (e.g., fence distances changed from 105/115 to 100/110).

### Archives Data Needs
Based on the news content, known seasons include 2015-2025. Key data points per season:
- Champion and runner-up (from World Series recaps)
- MVP, Cy Young, batting champion (mentioned in various articles)
- Number of teams (varies: 4 in early years, up to 8+ later)
- Notable events (rule changes, new teams, etc.)

The existing standings API (`/api/standings?scope=yearly`) returns W-L records grouped by year, which provides the final standings portion. The awards/champions data needs to be manually curated in `archives.json`.

### Hall of Fame Data
From news article content, known Hall of Fame inductees include:
- Aaron Hunter (2024 inductee — mentioned as "former MVP, Cy Young winner, and 2024 Hall of Fame inductee")
- Epo Olivares (described as "Hall of Famer and the league's all time strikeout king")
- Others to be determined by user

The user will provide the full list and AI-generated images. The data structure should accommodate ~12 players with comprehensive career stats pulled from the existing stats infrastructure.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JSON blob for all articles | Individual .md files with frontmatter | Standard since ~2020 | Better DX for editing, git diffs per article, easier to add/remove |
| Custom regex markdown converter | remark + remark-html pipeline | remark has been standard for years | Handles all markdown features correctly, extensible with plugins |
| next-mdx-remote for blog content | Plain gray-matter + remark (for non-MDX content) | Ongoing | MDX only needed if you embed React components in content |

**Deprecated/outdated:**
- Contentlayer: Was popular for Next.js content but is now **unmaintained** — do not use
- next-mdx-remote: Still maintained but unnecessary for pure markdown without React components

## Open Questions

1. **What seasons have archives data?**
   - What we know: League started in 2015, current season is 2025. News content references champions and awards for some years.
   - What's unclear: Complete list of champions, MVPs, and award winners for all seasons 2015-2024.
   - Recommendation: Create `archives.json` with known data; user fills in gaps. The standings data from Google Sheets covers all years.

2. **Full list of Hall of Fame inductees?**
   - What we know: Aaron Hunter (2024) and Epo Olivares are confirmed Hall of Famers. The user said ~12 players.
   - What's unclear: Complete list of inductees with induction years.
   - Recommendation: Create `hall-of-fame.json` as a template; user populates the full list.

3. **How many news articles to migrate?**
   - What we know: ~30 articles exist on the old site (2019-2025). 6 already in `news.json`. LeagueLineup content (2015-2017) is less article-like.
   - What's unclear: Whether to migrate ALL old site articles or just a curated subset.
   - Recommendation: Build the system to handle any number of `.md` files. Migrate articles incrementally — start with the 6 existing ones converted to `.md`, add more over time.

4. **Info page "how to join" link destination?**
   - What we know: Should be an external link (Google Form or signup URL).
   - What's unclear: The exact URL.
   - Recommendation: Use a placeholder URL that the user can easily update. Consider an env variable or config file.

5. **Cross-linking from archives to stats pages by year?**
   - What we know: CONTEXT.md says "Clicking a past season links into the existing stats page filtered by that year."
   - What's unclear: The stats page URL format for year filtering.
   - Recommendation: The existing stats page uses client-side state for year filtering (`selectedYear`). The simplest approach is to link to `/stats/players?year=2024` and have the stats page read the query param. This requires a small enhancement to the existing stats page to read the initial year from URL params.

## Sources

### Primary (HIGH confidence)
- **Codebase examination** — Direct read of all relevant source files (src/app/, src/lib/, src/components/, src/data/, package.json, next.config.js, tsconfig.json)
- **Old site content** — WebFetch of seattlewiffleball.com/rules.html and seattlewiffleball.com/news.html

### Secondary (MEDIUM confidence)
- **WebSearch: "gray-matter next.js 14 markdown blog"** — Confirmed gray-matter + remark as standard pattern, verified remark-html as simpler alternative to MDX for pure markdown
- **WebSearch: "Next.js 14 static markdown blog remark-html vs rehype"** — Confirmed plain remark + remark-html sufficient for non-MDX content

### Tertiary (LOW confidence)
- **LeagueLineup old content** — Content exists but is poorly structured; migration effort for 2015-2017 content may not be worthwhile

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — remark already installed, gray-matter is the universal frontmatter parser, pattern is well-documented
- Architecture: HIGH — follows existing codebase patterns exactly, all data sources identified and verified
- Content structure: HIGH — old site content examined, rules fully captured, news article format understood
- Data structures: MEDIUM — archives.json and hall-of-fame.json schemas are designed but actual data needs user input
- Pitfalls: HIGH — identified from actual codebase analysis (async remark, path resolution, data source migration)

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable — no fast-moving dependencies)
