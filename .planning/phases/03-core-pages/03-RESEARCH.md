# Phase 3: Core Pages - Research

**Researched:** 2026-03-04
**Domain:** Next.js page construction, GameChanger widget integration, YouTube embedding, leaderboard UI
**Confidence:** MEDIUM (HIGH for stack/architecture, MEDIUM for GameChanger SDK due to limited public docs)

## Summary

Phase 3 builds the site's primary pages (Home, Teams, Leaderboards) and integrates GameChanger and YouTube widgets. The codebase already has functional but basic versions of all three core pages, existing API routes for all needed data, and a working GameChanger scoreboard widget. The work is primarily UI transformation and enhancement rather than greenfield construction.

GameChanger's public widget ecosystem is **limited to scoreboard/schedule embeds only** — there are no embeddable widgets for stats, box scores, rosters, or leaderboards. The site already has its own stats infrastructure via Google Sheets, which is more comprehensive than what GameChanger would offer anyway. YouTube embedding should use `react-lite-youtube-embed` for performance, with YouTube RSS feeds for dynamic video discovery (no API key required). The leaderboard podium UI is best built with pure Tailwind CSS — no external component library needed.

**Primary recommendation:** Enhance existing pages with the decided UI patterns (podium leaderboards, logo-grid teams, hero home), add `react-lite-youtube-embed` for video embeds, and create dedicated Schedule and Media pages. Do NOT attempt to extract additional data from GameChanger beyond the existing scoreboard widget.

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.0.3 | App Router framework | Already in use, no change needed |
| React | ^18.2.0 | UI library | Already in use |
| Tailwind CSS | ^3.3.5 | Styling | Already in use, sufficient for all UI patterns including podium |
| @tanstack/react-table | ^8.10.7 | Data tables | Already used in stats pages |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-lite-youtube-embed | ^3.5.1 | YouTube video embeds | All YouTube embeds (home, media page) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-lite-youtube-embed | Raw iframe | Raw iframe loads 500KB+ upfront; lite version loads <5KB, defers iframe until click |
| react-lite-youtube-embed | react-lite-yt-embed | Lower npm downloads, less maintained; react-lite-youtube-embed has 120K weekly downloads |
| YouTube Data API v3 | YouTube RSS feed | API requires key + has quota limits; RSS is free, no key, no limits |
| Framer Motion for podium | Pure CSS/Tailwind | Animations are Phase 5 polish; Tailwind transitions sufficient for now |

**Installation:**
```bash
npm install react-lite-youtube-embed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Home page (EXISTING - enhance)
│   ├── teams/
│   │   ├── page.tsx                # Teams index (EXISTING - enhance)
│   │   └── [id]/page.tsx           # Team detail (EXISTING - enhance)
│   ├── leaderboards/page.tsx       # Leaderboards (EXISTING - transform to podium)
│   ├── schedule/page.tsx           # NEW - dedicated schedule page
│   └── media/page.tsx              # NEW - dedicated media/videos page
├── components/
│   ├── PageNavigation.tsx          # EXISTING - add Schedule + Media links, fix mobile
│   ├── GameChangerWidget.tsx       # EXTRACT from page.tsx into reusable component
│   ├── YouTubeEmbed.tsx            # NEW - wrapper around react-lite-youtube-embed
│   ├── StandingsWidget.tsx         # NEW - compact standings for home sidebar
│   └── LeaderboardPodium.tsx       # NEW - podium display component
├── lib/
│   ├── sheets.ts                   # EXISTING - may need K/9 stat addition
│   └── youtube.ts                  # NEW - RSS feed fetcher for channel videos
└── config/
    └── teams.ts                    # EXISTING - team metadata
```

### Pattern 1: Extract GameChanger Widget to Reusable Component
**What:** The GameChanger widget code currently lives inline in `page.tsx` as a local component. Extract it to a shared component so it can be used on both the home page (compact) and the dedicated schedule page (full).
**When to use:** Any page that needs the GC scoreboard widget.
**Example:**
```typescript
// src/components/GameChangerWidget.tsx
"use client"
import { useEffect } from 'react'

interface GameChangerWidgetProps {
  maxGames?: number  // compact (home) vs full (schedule page)
}

export function GameChangerWidget({ maxGames = 4 }: GameChangerWidgetProps) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://widgets.gc.com/static/js/sdk.v1.js'
    script.onload = () => {
      setTimeout(() => {
        const gc = (window as any).GC
        if (gc?.scoreboard) {
          gc.scoreboard.init({
            target: "#gc-scoreboard-widget",
            widgetId: "e2cc3143-0338-4eda-a65b-34a2b2db9a97",
            maxVerticalGamesVisible: maxGames,
          })
        }
      }, 1000)
    }
    document.head.appendChild(script)
    return () => { script.parentNode?.removeChild(script) }
  }, [])

  return <div id="gc-scoreboard-widget" />
}
```

### Pattern 2: YouTube RSS Feed Fetcher (Server-Side)
**What:** Fetch latest videos from the league's YouTube channel via RSS feed. No API key required.
**When to use:** Home page (latest video) and Media page (video gallery).
**Example:**
```typescript
// src/lib/youtube.ts
const CHANNEL_ID = 'YOUR_CHANNEL_ID' // Seattle Wiffle YouTube channel
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`

export interface YouTubeVideo {
  id: string
  title: string
  published: string
  thumbnail: string
}

export async function fetchLatestVideos(limit = 10): Promise<YouTubeVideo[]> {
  const res = await fetch(RSS_URL, { next: { revalidate: 3600 } }) // cache 1hr
  const xml = await res.text()
  // Parse XML to extract video entries
  // Each <entry> has <yt:videoId>, <title>, <published>, <media:thumbnail>
  // Return parsed array
}
```

### Pattern 3: Lite YouTube Embed Usage
**What:** Use react-lite-youtube-embed for all video embeds. Only loads thumbnail + play button; iframe loads on click.
**When to use:** Every YouTube video display.
**Example:**
```typescript
// src/components/YouTubeEmbed.tsx
"use client"
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

interface Props {
  videoId: string
  title: string
}

export function YouTubeEmbed({ videoId, title }: Props) {
  return (
    <LiteYouTubeEmbed
      id={videoId}
      title={title}
      poster="hqdefault"
      webp
      lazyLoad
    />
  )
}
```

### Pattern 4: Leaderboard Podium Component
**What:** Top 3 players displayed as large cards with gold/silver/bronze accents. Ranks 4-10 in a compact list below.
**When to use:** Each stat category on the leaderboards page.
**Example:**
```typescript
// Podium card structure (conceptual)
<div className="flex items-end justify-center gap-4 mb-6">
  {/* 2nd place - shorter */}
  <div className="bg-gray-100 border-t-4 border-gray-400 rounded-lg p-4 w-1/3">
    <div className="text-2xl font-bold text-gray-400">2</div>
    <div className="font-semibold">{players[1].name}</div>
    <div className="text-xl font-bold">{players[1].stat}</div>
  </div>
  {/* 1st place - tallest */}
  <div className="bg-yellow-50 border-t-4 border-yellow-500 rounded-lg p-4 w-1/3 -mt-4">
    <div className="text-2xl font-bold text-yellow-500">1</div>
    <div className="font-semibold">{players[0].name}</div>
    <div className="text-xl font-bold">{players[0].stat}</div>
  </div>
  {/* 3rd place - shortest */}
  <div className="bg-orange-50 border-t-4 border-amber-700 rounded-lg p-4 w-1/3">
    <div className="text-2xl font-bold text-amber-700">3</div>
    <div className="font-semibold">{players[2].name}</div>
    <div className="text-xl font-bold">{players[2].stat}</div>
  </div>
</div>
{/* 4-10 compact list */}
<div className="space-y-1">
  {players.slice(3, 10).map((p, i) => (
    <div key={p.id} className="flex justify-between py-1 border-b">
      <span>{i + 4}. {p.name}</span>
      <span className="font-semibold">{p.stat}</span>
    </div>
  ))}
</div>
```

### Anti-Patterns to Avoid
- **Don't duplicate the GC SDK script on multiple pages:** Extract to a shared component; the SDK initializes globally, so loading it twice causes conflicts. Use a single widget div ID per page, or make it configurable.
- **Don't use raw YouTube iframes:** They load 500KB+ before user interaction. Always use the lite embed.
- **Don't fetch YouTube via API for simple listing:** The RSS feed is free, keyless, and has no quota. The API adds unnecessary complexity for a video gallery.
- **Don't hand-roll XML parsing for YouTube RSS:** Use a regex or DOMParser approach; the RSS feed structure is simple and stable.
- **Don't build the home page as a monolithic "use client" component:** The current page.tsx is entirely client-side. Split server-renderable sections (hero, news, quick links) from client-only sections (GameChanger widget, YouTube embed).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YouTube embed performance | Custom lazy-loading iframe wrapper | react-lite-youtube-embed | Handles preconnect, WebP thumbnails, privacy mode, a11y; under 5KB |
| YouTube video discovery | Hardcoded video ID arrays | YouTube RSS feed parser | Videos update automatically; no API key or quota |
| Podium/leaderboard ranking UI | Install a component library | Tailwind CSS with flexbox | Simple enough with pure CSS; no dependency needed |
| GameChanger schedule display | Custom API calls to GC | GC SDK scoreboard widget | No public API; the widget is the only supported integration |

**Key insight:** This phase is mostly UI enhancement of existing pages and data. The data infrastructure (API routes, sheets.ts transforms) is already built. Resist the urge to rebuild data fetching — focus on presentation.

## Common Pitfalls

### Pitfall 1: GameChanger SDK Script Duplication
**What goes wrong:** Loading the GC SDK script multiple times (e.g., on page navigate in SPA) causes widget initialization failures or duplicate widgets.
**Why it happens:** The current implementation creates a new `<script>` tag in useEffect. If the component remounts (React strict mode, route change), the SDK loads again.
**How to avoid:** Check if `window.GC` already exists before loading script. Add the script once globally or use a ref to track loading state. The cleanup function should also call any SDK cleanup if available.
**Warning signs:** Console errors about GC SDK, duplicate scoreboard renders, widgets not appearing after navigation.

### Pitfall 2: YouTube RSS Feed Parsing on Client
**What goes wrong:** Trying to fetch the YouTube RSS feed from the client hits CORS restrictions.
**Why it happens:** YouTube doesn't set CORS headers on their RSS feeds.
**How to avoid:** Fetch the RSS feed in a Next.js API route or server component, NOT from the client. Parse XML server-side and pass video data as JSON to client components.
**Warning signs:** CORS errors in browser console when fetching youtube.com/feeds/*.

### Pitfall 3: Missing K/9 and OPP AVG Stats in Leaderboard
**What goes wrong:** The leaderboards page needs K/9 (strikeouts per 9 innings) as a category, but the pitching transform doesn't calculate it. OPP AVG (`oppAvg`) exists in the transform but isn't in the current leaderboard stat list.
**Why it happens:** The original leaderboard only needed ERA, WHIP, K. The expanded requirements add K/9, W, IP, OPP AVG.
**How to avoid:** Either add `k9` to the pitching transform in sheets.ts (calculated as `(strikeouts / inningsPitched) * 9`), or calculate it in the API route/client. W, IP, and OPP AVG are already available in the transform data but need to be added to the leaderboard stat configuration.
**Warning signs:** K/9 column showing 0 or NaN; sort not working correctly for calculated stats.

### Pitfall 4: Image Assets Don't Exist Yet
**What goes wrong:** Pages reference images at `/images/teams/*-logo.png`, `/images/game-highlights.gif`, etc., but the `public/images/` directory doesn't exist in the repo.
**Why it happens:** The codebase references these paths but the actual image files haven't been committed or created yet.
**How to avoid:** Pages must handle missing images gracefully with fallbacks. The team pages already have `onError` handlers with a default logo, but the hero section and other areas should also degrade gracefully. Consider adding placeholder assets or an explicit "asset creation" task.
**Warning signs:** Broken images, 404 errors in Network tab, hero section showing no background.

### Pitfall 5: Client-Only Home Page Hurting SEO
**What goes wrong:** The entire home page is `"use client"`, so nothing is server-rendered. Search engines may not index the content.
**Why it happens:** GameChanger widget requires `useEffect`, so the whole page was marked client.
**How to avoid:** Split the home page into server-rendered sections (hero, news, standings, quick links) and client-rendered widget islands (GameChanger, YouTube). Use React Server Components for the outer layout and `"use client"` only for interactive widgets.
**Warning signs:** View Source shows empty `<div>` with no content; Lighthouse SEO score is low.

### Pitfall 6: Multiple GC Widget Instances on Same Page
**What goes wrong:** If both a compact and full GameChanger widget try to render on the same page (or across navigations), the SDK may target the wrong DOM element.
**Why it happens:** The widget uses a fixed DOM target ID (`#gc-scoreboard-widget-trvs`). Two widgets with the same ID conflict.
**How to avoid:** Use unique target IDs per widget instance. Ensure only one widget initializes per page.
**Warning signs:** Widget renders in wrong location; widget doesn't appear; console errors from GC SDK.

## Code Examples

### YouTube RSS Feed API Route
```typescript
// src/app/api/youtube/route.ts
import { NextResponse } from 'next/server'

const CHANNEL_ID = 'REPLACE_WITH_CHANNEL_ID'
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`

export async function GET() {
  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 3600 } })
    const xml = await res.text()

    const videos: Array<{ id: string; title: string; published: string }> = []
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []

    for (const entry of entries) {
      const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1]
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1]
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1]
      if (id && title) {
        videos.push({ id, title, published: published || '' })
      }
    }

    return NextResponse.json({ data: videos.slice(0, 12), stale: false })
  } catch (error) {
    return NextResponse.json({ data: [], stale: true })
  }
}
```

### Standings Widget for Home Page Sidebar
```typescript
// Fetch from existing /api/standings endpoint
// Filter to current year, sort by pct descending
// Display as compact table: Rank | Team | W-L | PCT
```

### K/9 Calculation Pattern
```typescript
// Add to pitching transform or calculate in leaderboard API
const k9 = inningsPitched > 0
  ? parseFloat(((strikeouts / inningsPitched) * 9).toFixed(2))
  : 0
```

### Lite YouTube in Media Gallery Grid
```typescript
"use client"
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

function VideoGallery({ videos }: { videos: Array<{ id: string; title: string }> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map(video => (
        <div key={video.id} className="rounded-lg overflow-hidden shadow-md">
          <LiteYouTubeEmbed
            id={video.id}
            title={video.title}
            poster="hqdefault"
            webp
            lazyLoad
          />
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## GameChanger SDK Research — Detailed Findings

### What the SDK Provides (HIGH confidence)
The GameChanger SDK at `https://widgets.gc.com/static/js/sdk.v1.js` exposes a single widget type:

- **`GC.scoreboard.init(config)`** — Initializes a scoreboard/schedule widget
  - `config.target`: CSS selector for the container element
  - `config.widgetId`: Organization or team widget ID (UUID format)
  - `config.maxVerticalGamesVisible`: Number of games to show (integer)

The existing codebase uses widget ID `e2cc3143-0338-4eda-a65b-34a2b2db9a97`.

### What the SDK Does NOT Provide (MEDIUM confidence)
Based on extensive search of GameChanger documentation, help articles, blog posts, and SDK references:

- **No standings widget via SDK** — Standings are available only as a standalone iframe embed at `https://widgets.gc.com/standings/{ORG_ID}/embed/v1`. This is an iframe URL, not an SDK method.
- **No stats/leaderboard widget** — GC has internal leaderboards for leagues (17 batting/pitching/fielding stats) but these are NOT embeddable as widgets. They're only accessible in the GC app/web interface.
- **No box score widget** — Box scores can be edited by staff in the app but are not embeddable.
- **No roster widget** — Rosters are managed in-app only.
- **No public API for data** — GC does NOT provide a public REST API for accessing team stats, player stats, game results, or box scores. The only external integration is through widgets.

### Standalone Standings Iframe (MEDIUM confidence)
GameChanger also offers a standalone standings embed at:
```
https://widgets.gc.com/standings/{ORG_ID}/embed/v1
```
This is an iframe-based embed (not SDK-based). It shows W-L-T records for all teams in the organization. The org ID can be obtained from the Tools tab in web.gc.com. **However**, the site already has its own standings data from Google Sheets with richer data (runs scored, runs allowed, winning %, etc.), so using the GC standings iframe would be a downgrade.

### Recommendation
- **Keep using the GC scoreboard widget** for schedule/scores on home (compact) and schedule page (full)
- **Do NOT attempt** to extract additional data from GameChanger — the site's Google Sheets data is more comprehensive
- **Do NOT use the GC standings iframe** — the site's own standings API provides richer data
- The GC widget is essentially a "set and forget" embed with limited customization

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Raw YouTube `<iframe>` | Lite embed (thumbnail-first) | 2021+ | 500KB → <5KB initial load; major perf improvement |
| YouTube Data API for video listing | RSS feed (`/feeds/videos.xml`) | Always available | No API key, no quota, simpler implementation |
| GameChanger Classic API | GC SDK widgets | ~2023 | Classic deprecated; SDK is only supported embed method |
| Custom leaderboard components | Tailwind-only podium | Current | No library needed; flexbox + accent colors |

**Deprecated/outdated:**
- GameChanger Classic: The old GC app/API is deprecated. The current GC (owned by DICK'S Sporting Goods) uses the SDK widget system.
- `react-lite-youtube-embed` v2.x: v3.x is current (3.5.1); v2 had different API for events. The v3 API uses `onPlay`/`onPause`/`onEnd` callbacks.

## Open Questions

1. **YouTube Channel ID**
   - What we know: The site needs to embed YouTube videos from the league's channel
   - What's unclear: The actual YouTube channel ID for Seattle Wiffle is not in the codebase
   - Recommendation: User needs to provide the channel ID, OR hardcode a few video IDs initially and add dynamic RSS fetching once the channel ID is known. The RSS feed URL format is `https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}`

2. **GameChanger Widget ID Source**
   - What we know: Widget ID `e2cc3143-0338-4eda-a65b-34a2b2db9a97` exists in page.tsx
   - What's unclear: Whether this is a team widget or organization widget, and if it's still active
   - Recommendation: Test the existing widget ID. If it works, keep using it. The compact vs full display is controlled by `maxVerticalGamesVisible`.

3. **Image Asset Strategy**
   - What we know: Code references images at `/images/teams/*-logo.png` and `/images/game-highlights.gif` but NO image files exist in the `public/` directory
   - What's unclear: Whether these assets exist elsewhere and need to be committed, or need to be created
   - Recommendation: The planner should include an explicit task for verifying/creating image assets. All image references should have fallback handling.

4. **K/9 Stat Calculation Location**
   - What we know: K/9 is needed for pitching leaderboards but isn't in the current pitching transform
   - What's unclear: Whether to add it to `transformYearlyPitching`/`transformTotalsPitching` in sheets.ts or calculate it in the leaderboard API route
   - Recommendation: Add it to the transform functions in sheets.ts so it's available everywhere (leaderboards, team stats, player stats). Formula: `(strikeouts / inningsPitched) * 9`, handle division by zero.

## Sources

### Primary (HIGH confidence)
- GameChanger Help Center: https://help.gc.com/hc/en-us/articles/19675153305869 — Scoreboard Widget documentation
- react-lite-youtube-embed npm: https://www.npmjs.com/package/react-lite-youtube-embed — v3.5.1, 120K weekly downloads
- react-lite-youtube-embed API Reference: https://ibrahimcesar.github.io/react-lite-youtube-embed/docs/api-reference/ — Complete props documentation
- YouTube RSS feed format: `https://www.youtube.com/feeds/videos.xml?channel_id={ID}` — Verified format, no API key needed
- Existing codebase analysis — Direct reading of page.tsx, sheets.ts, API routes, teams config

### Secondary (MEDIUM confidence)
- GameChanger blog posts: https://gc.com/post/scoreboard-widgets-for-teams — Confirms widget is scoreboard-only
- GameChanger fan experience post: https://gc.com/post/leagues-tournaments-fan-experience-for-baseball-and-softball — Confirms standings iframe exists
- GameChanger leaderboards post: https://gc.com/post/all-players-leaderboards — Confirms leaderboards are in-app only, not embeddable
- YouTube Data API docs: https://developers.google.com/youtube/v3/docs/videos/list — Alternative to RSS if needed

### Tertiary (LOW confidence)
- shadcn.io podium blocks: https://www.shadcn.io/blocks/awards-podium — Design inspiration only
- purecode.ai leaderboard component: https://purecode.ai/community/leaderboarduicomponent-tailwind-leaderboard — Design patterns reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries verified via npm, official docs, and codebase analysis
- Architecture: HIGH — Based on direct reading of existing codebase and established Next.js patterns
- GameChanger SDK: MEDIUM — Official docs confirm scoreboard-only; could not load SDK JS source to verify method list exhaustively
- YouTube integration: HIGH — react-lite-youtube-embed verified on npm (120K downloads, v3.5.1); RSS feed format is well-documented
- Podium UI: HIGH — Pure Tailwind approach, no external dependency, verified against multiple design references
- Pitfalls: MEDIUM — Based on codebase analysis and common Next.js patterns; some are project-specific observations

**Research date:** 2026-03-04
**Valid until:** 2026-04-03 (30 days — stable technologies, no fast-moving components)
