#!/usr/bin/env node
/**
 * Import news articles from current site (seattlewiffleball.com/news.html) and
 * LeagueLineup archive (2015–2018) into content/news/*.md
 *
 * Usage:
 *   node scripts/import-news.mjs --file=path/to/news.html
 *   node scripts/import-news.mjs --file=path/to/archive-2015.html --archive --year=2015
 *   node scripts/import-news.mjs --url=https://... (fetch; may timeout)
 *   node scripts/import-news.mjs --stdin  (read HTML or text from stdin; paste then Ctrl+D)
 *
 * When fetch fails, save the page HTML (e.g. "Save as" in browser) and use --file, or paste and use --stdin.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const NEWS_DIR = path.join(__dirname, '..', 'content', 'news')

const EXCERPT_LEN = 200
const SLUG_MAX = 80

function slugify(title, year = null) {
  let s = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  if (s.length > SLUG_MAX) s = s.slice(0, SLUG_MAX)
  if (year) s = `${year}-${s}`
  return s || 'untitled'
}

function excerpt(body) {
  const one = body.replace(/\s+/g, ' ').trim()
  if (one.length <= EXCERPT_LEN) return one
  const cut = one.slice(0, EXCERPT_LEN).trim()
  const last = cut.lastIndexOf(' ')
  return (last > EXCERPT_LEN / 2 ? cut.slice(0, last) : cut) + '…'
}

function parseDate(line) {
  const m = line.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})/)
  if (m) {
    const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
    const mi = months.indexOf(m[1].slice(0, 3))
    if (mi >= 0) {
      const month = String(mi + 1).padStart(2, '0')
      const day = String(parseInt(m[2], 10)).padStart(2, '0')
      return `${m[3]}-${month}-${day}`
    }
  }
  const iso = line.match(/(\d{4})-(\d{2})-(\d{2})/)
  return iso ? iso[0] : null
}

/**
 * Normalize HTML to markdown-like text for parsing
 */
function htmlToText(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<h2[^>]*>/gi, '\n## ')
    .replace(/<h6[^>]*>/gi, '\n###### ')
    .replace(/<h[1-5][^>]*>/gi, '\n### ')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&#xa0;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return s
}

/**
 * Parse current site format: ## TITLE, ###### Date, ###### Author, body
 */
function parseCurrentSite(text) {
  const articles = []
  const blocks = text.split(/\n## /).filter(Boolean)
  for (let i = 0; i < blocks.length; i++) {
    const raw = (i === 0 && !blocks[0].startsWith('#')) ? `## ${blocks[0]}` : `## ${blocks[i]}`
    const lines = raw.split(/\n/)
    const titleLine = lines[0].replace(/^#+\s*/, '').trim()
    if (!titleLine) continue
    let date = null
    let author = null
    let bodyStart = 1
    for (let j = 1; j < Math.min(lines.length, 6); j++) {
      const line = lines[j].trim()
      if (line.startsWith('###### ')) {
        const content = line.replace(/^#+\s*/, '').trim()
        if (!date && parseDate(content)) {
          date = parseDate(content)
          bodyStart = j + 1
        } else if (date && !author && content) {
          author = content
          bodyStart = j + 1
        }
      }
    }
    const body = lines.slice(bodyStart).join('\n').trim()
    if (!body && !titleLine) continue
    articles.push({
      title: titleLine,
      date: date || null,
      author: author || null,
      body,
    })
  }
  return articles
}

// LeagueLineup nav/site headings to skip when splitting archive into articles
const ARCHIVE_SKIP_TITLES = new Set([
  'OUR SERVICES', 'LOCAL SPORTS', 'ELITE', 'Create your own site', 'Close Panel',
  'Seattle Wiffleball', '2015 Articles', '2016 Articles', '2017 Articles', '2018 Articles',
  'Subscribe to our Newsletter', 'Find a Web Site', 'Tournaments', 'Team Tryouts',
  'Sports Photographers', 'LeagueLineup Elite', 'Powered by LeagueLineup.com',
])

/**
 * Parse LeagueLineup archive: split by ## or ### (h2/h3) sections; each section = one article.
 * htmlToText turns h2 -> \n## , h1/h3/h4/h5 -> \n### , so we split on both to get all sections.
 */
function parseArchive(text, year) {
  const articles = []
  // Split on newline followed by ## or ### so each block is one section (main or sub)
  const sections = text.split(/\n(?:##|###)\s+/)
  const defaultDate = year ? `${year}-06-01` : null
  for (let i = 0; i < sections.length; i++) {
    let block = sections[i].trim()
    if (!block) continue
    const lines = block.split('\n')
    // First line is the title (strip any remaining # or markdown)
    let title = lines[0].replace(/^#+\s*/, '').replace(/\*+/g, '').trim()
    title = title.replace(/\s*160\s*$/g, '').replace(/\s*160\s*/g, ' ').trim() // stray &nbsp; often becomes "160"
    if (!title || title.length > 150) continue
    if (/^\d+$/.test(title.trim())) continue // skip section headers that are just a number (e.g. 160 from &nbsp;)
    const titleUpper = title.toUpperCase()
    if (ARCHIVE_SKIP_TITLES.has(title) || ARCHIVE_SKIP_TITLES.has(titleUpper) ||
        titleUpper.includes('POWERED BY LEAGUELINEUP') || titleUpper === 'SEATTLE WIFFLEBALL') continue
    let date = null
    let bodyStart = 1
    // Optional: first line of body might be "### Subtitle" (e.g. "Week 10"); optional date in first few lines
    for (let j = 1; j < Math.min(lines.length, 12); j++) {
      const t = lines[j].trim()
      const d = parseDate(t)
      if (d) {
        date = d
        bodyStart = j + 1
        break
      }
      if (t.startsWith('###### ') && parseDate(t.replace(/^#+\s*/, ''))) {
        date = parseDate(t.replace(/^#+\s*/, ''))
        bodyStart = j + 1
        break
      }
    }
    const body = lines.slice(bodyStart).join('\n').trim()
    // Try to find a date in body (e.g. "before play on 7/19/2015", "May 17, 2015")
    if (!date && body) {
      const iso = body.match(/(\d{4})-(\d{2})-(\d{2})/)
      if (iso) date = iso[0]
      else {
        const m = body.match(/(\w+\s+\d{1,2},?\s+\d{4})/)
        if (m) date = parseDate(m[0])
        if (!date) {
          const slash = body.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
          if (slash) date = `${slash[3]}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}`
        }
      }
    }
    if (!date && year) date = defaultDate
    articles.push({
      title,
      date,
      author: null,
      body: body || '',
    })
  }
  if (articles.length > 0) return articles
  // Fallback: split by "Month DD, YYYY" at start of line
  const alt = text.split(/\n(?=\w+\s+\d{1,2},?\s+\d{4}\b)/)
  for (const block of alt) {
    const lines = block.split('\n')
    const dateLine = lines[0].trim()
    const date = parseDate(dateLine)
    const rest = lines.slice(1).join('\n').trim()
    const titleMatch = rest.match(/^([^\n]+)/)
    const title = titleMatch ? titleMatch[1].replace(/^#+\s*/, '').trim() : dateLine
    const body = titleMatch ? rest.slice(titleMatch[0].length).trim() : rest
    if (title && title.length <= 120 && (body || date)) {
      articles.push({
        title,
        date,
        author: null,
        body: body || '',
      })
    }
  }
  return articles
}

function toFrontmatter(article, slug) {
  const lines = [
    '---',
    `title: "${article.title.replace(/"/g, '\\"')}"`,
    `date: "${article.date || '1970-01-01'}"`,
    `excerpt: "${excerpt(article.body).replace(/"/g, '\\"')}"`,
  ]
  if (article.author) lines.push(`author: "${article.author.replace(/"/g, '\\"')}"`)
  lines.push('---')
  return lines.join('\n')
}

function writeArticle(article, slug, year = null) {
  const filename = `${slug}.md`
  const filepath = path.join(NEWS_DIR, filename)
  const front = toFrontmatter(article, slug)
  const content = `${front}\n\n${article.body}\n`
  fs.writeFileSync(filepath, content, 'utf8')
  console.log('  wrote', filename)
}

async function fetchUrl(url, timeoutMs = 15000) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: c.signal })
    clearTimeout(t)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (e) {
    clearTimeout(t)
    throw e
  }
}

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = []
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (c) => chunks.push(c))
    process.stdin.on('end', () => resolve(chunks.join('')))
    process.stdin.on('error', reject)
  })
}

async function main() {
  const args = process.argv.slice(2)
  let file = null
  let url = null
  let useStdin = false
  let archive = false
  let year = null
  for (const a of args) {
    if (a.startsWith('--file=')) file = a.slice(7)
    else if (a.startsWith('--url=')) url = a.slice(6)
    else if (a === '--stdin') useStdin = true
    else if (a === '--archive') archive = true
    else if (a.startsWith('--year=')) year = a.slice(7)
  }

  let raw
  if (useStdin) {
    raw = await readStdin()
    console.log('Read from stdin')
  } else if (file) {
    raw = fs.readFileSync(path.resolve(file), 'utf8')
    console.log('Read', file)
  } else if (url) {
    try {
      raw = await fetchUrl(url)
      console.log('Fetched', url)
    } catch (e) {
      console.error('Fetch failed:', e.message)
      console.error('Save the page as HTML and run with --file=path/to/page.html')
      process.exit(1)
    }
  } else {
    console.error('Usage: node scripts/import-news.mjs --file=path/to/page.html [--archive] [--year=2015]')
    console.error('   or: node scripts/import-news.mjs --url=https://... [--archive] [--year=2015]')
    console.error('   or: node scripts/import-news.mjs --stdin  (paste HTML/text, then Ctrl+D)')
    process.exit(1)
  }

  const isHtml = raw.includes('<')
  const text = isHtml ? htmlToText(raw) : raw
  const articles = archive ? parseArchive(text, year) : parseCurrentSite(text)
  const yearPrefix = archive && year ? year : null

  if (!fs.existsSync(NEWS_DIR)) fs.mkdirSync(NEWS_DIR, { recursive: true })

  const seen = new Set()
  for (const article of articles) {
    if (!article.title && !article.body) continue
    const baseSlug = slugify(article.title || 'untitled')
    let slug = yearPrefix ? `${yearPrefix}-${baseSlug}` : baseSlug
    if (seen.has(slug)) {
      let n = 1
      while (seen.has(`${slug}-${n}`)) n++
      slug = `${slug}-${n}`
    }
    seen.add(slug)
    if (!article.date && year) article.date = `${year}-01-01`
    writeArticle(article, slug, yearPrefix)
  }
  console.log('Total:', articles.length)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
