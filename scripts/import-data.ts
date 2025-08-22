import { PrismaClient } from '@prisma/client'
import { google } from 'googleapis'
import axios from 'axios'
import fs from 'node:fs/promises'

const prisma = new PrismaClient()

const SPREADSHEET_ID = '1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek'
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

const clean = (v: any) => String(v ?? '')
  .replace(/\ufeff/g, '')
  .trim()
  .replace(/^"(.*)"$/s, '$1')

function toInt(value: any, fallback = 0): number {
  const n = parseInt(clean(value), 10)
  return Number.isFinite(n) ? n : fallback
}

function toFloat(value: any, fallback = 0): number {
  const n = parseFloat(clean(value))
  return Number.isFinite(n) ? n : fallback
}

function parseQualifier(cell: any): { qualified: boolean; percentile: number | null } {
  const text = clean(cell)
  if (!text) return { qualified: true, percentile: null }
  if (/non-?qualifier|not enough data/i.test(text)) return { qualified: false, percentile: null }
  const num = parseFloat(text)
  return { qualified: true, percentile: Number.isFinite(num) ? num : null }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

async function getGoogleSheetsClient() {
  // Check if environment variables are available
  if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY || !process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    throw new Error('Google Cloud credentials not found in environment variables. Please check your .env.local file.')
  }

  const credentials = {
    type: process.env.GOOGLE_CLOUD_TYPE || 'service_account',
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
    private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
    auth_uri: process.env.GOOGLE_CLOUD_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.GOOGLE_CLOUD_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLOUD_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_CLOUD_UNIVERSE_DOMAIN || 'googleapis.com'
  }

  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    credentials,
  })

  return google.sheets({ version: 'v4', auth })
}

async function fetchCsv(sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
  const res = await axios.get(url, { responseType: 'text' })
  const text = res.data as string
  const rows = text.split(/\r?\n/).map((line) => line.split(','))
  return rows
}

async function loadSheet(name: string): Promise<string[][]> {
  if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    try {
    const sheets = await getGoogleSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${name}!A:ZZ`,
    })
    return (response.data.values || []) as string[][]
    } catch (error) {
      console.warn('Failed to load sheet via API, falling back to CSV:', error)
      return fetchCsv(name)
    }
  }
  return fetchCsv(name)
}

async function loadSheetRange(name: string, a1: string): Promise<string[][]> {
  if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    try {
    const sheets = await getGoogleSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${name}!${a1}`,
    })
    return (response.data.values || []) as string[][]
    } catch (error) {
      console.warn('Failed to load sheet range via API, falling back to CSV:', error)
      const m = a1.match(/^[A-Za-z]+(\d+):[A-Za-z]+(\d+)$/)
      const startRow = m ? parseInt(m[1], 10) : 1
      const endRow = m ? parseInt(m[2], 10) : Number.MAX_SAFE_INTEGER
      const rows = await fetchCsv(name)
      return rows.slice(Math.max(0, startRow - 1), Math.min(rows.length, endRow))
    }
  }
  const m = a1.match(/^[A-Za-z]+(\d+):[A-Za-z]+(\d+)$/)
  const startRow = m ? parseInt(m[1], 10) : 1
  const endRow = m ? parseInt(m[2], 10) : Number.MAX_SAFE_INTEGER
  const rows = await fetchCsv(name)
  return rows.slice(Math.max(0, startRow - 1), Math.min(rows.length, endRow))
}

function headerIndex(header: string[], exact: string): number {
  return header.findIndex((h) => clean(h).toLowerCase() === exact.toLowerCase())
}

function headerIndexFlexible(header: string[], patterns: string[]): number {
  for (const pattern of patterns) {
    const idx = header.findIndex((h) => {
      const cleaned = clean(h).toLowerCase()
      return cleaned === pattern.toLowerCase() || 
             cleaned.includes(pattern.toLowerCase()) ||
             pattern.toLowerCase().includes(cleaned)
    })
    if (idx >= 0) return idx
  }
  return -1
}

async function loadTeamMappingByCode(): Promise<Record<string, { name?: string; logo?: string }>> {
  const rows = await loadSheetRange('Player/Team Adj', 'O3:S100')
  if (!rows || rows.length === 0) return {}

  const header = rows[0].map((h) => clean(h).toLowerCase())
  const idx = {
    uniqueName: header.findIndex((h) => (h.includes('unique') && h.includes('teams'))),
    teamCodes: header.findIndex((h) => h.includes('team') && h.includes('code') && !h.includes('current')),
    franchiseName: header.findIndex((h) => (h.includes('franchise') || h.includes('fanchise')) && h.includes('current') && h.includes('name')),
    logo: header.findIndex((h) => h.includes('logo') && h.includes('image')),
  }

  const byCode: Record<string, { name?: string; logo?: string }> = {}

  for (const row of rows.slice(1)) {
    if (!row || row.length === 0) continue
    const teamCodesRaw = clean(row[idx.teamCodes])
    const franchiseName = clean(row[idx.franchiseName])
    const logoRaw = clean(row[idx.logo])
    const logo = logoRaw ? logoRaw.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, '.png') : undefined

    if (!teamCodesRaw) continue
    const codes = teamCodesRaw
      .split(/[,+/;\s]+/)
      .map((c) => clean(c).toUpperCase())
      .filter(Boolean)

    for (const code of codes) {
      byCode[code] = { name: franchiseName || undefined, logo }
    }
  }

  return byCode
}

async function ensureTeam(teamCode: string, displayName?: string, logo?: string) {
  const logoUrl = logo ? `/images/teams/${logo}` : undefined
  // 1) Prefer match on abbr
  const byAbbr = await prisma.team.findUnique({ where: { abbr: teamCode } }).catch(() => null)
  if (byAbbr) {
    // Do NOT change name here to avoid unique name conflicts; only update logoUrl
    return prisma.team.update({
      where: { id: byAbbr.id },
      data: { logoUrl },
    })
  }
  // 2) Fallback to match on name
  if (displayName) {
    const byName = await prisma.team.findUnique({ where: { name: displayName } }).catch(() => null)
    if (byName) {
      return prisma.team.update({
        where: { id: byName.id },
        data: { abbr: teamCode, logoUrl },
      })
    }
  }
  // 3) Create new
  return prisma.team.create({ data: { name: displayName || teamCode, abbr: teamCode, logoUrl } })
}

async function importHittingStats() {
  console.log('Importing Individual Hitting (IH) ...')
  const byCode = await loadTeamMappingByCode()
  const rows = await loadSheetRange('IH', 'A700:AP2001')
  if (!rows || rows.length === 0) return

  const header = rows[0]
  const idx = {
    year: headerIndexFlexible(header, ['Year', 'YEAR', 'year']),
    first: headerIndexFlexible(header, ['FIRST', 'First', 'first']),
    last: headerIndexFlexible(header, ['LAST', 'Last', 'last']),
    team: headerIndexFlexible(header, ['TEAM', 'Team', 'team']),
    gp: headerIndexFlexible(header, ['GP', 'G', 'Games', 'games']),
    pa: headerIndexFlexible(header, ['PA', 'Plate Appearances', 'plate appearances']),
    ab: headerIndexFlexible(header, ['AB', 'At Bats', 'at bats']),
    r: headerIndexFlexible(header, ['R', 'Runs', 'runs']),
    h: headerIndexFlexible(header, ['H', 'Hits', 'hits']),
    doub: headerIndexFlexible(header, ['2B', 'Doubles', 'doubles']),
    trip: headerIndexFlexible(header, ['3B', 'Triples', 'triples']),
    hr: headerIndexFlexible(header, ['HR', 'Home Runs', 'home runs']),
    rbi: headerIndexFlexible(header, ['RBI', 'Runs Batted In', 'runs batted in']),
    bb: headerIndexFlexible(header, ['BB', 'Walks', 'walks']),
    k: headerIndexFlexible(header, ['K', 'Strikeouts', 'strikeouts']),
    ibb: headerIndexFlexible(header, ['IBB', 'Intentional Walks', 'intentional walks']),
    sf: headerIndexFlexible(header, ['SF', 'Sacrifice Flies', 'sacrifice flies']),
    avg: headerIndexFlexible(header, ['AVG', 'Average', 'average']),
    obp: headerIndexFlexible(header, ['OBP', 'On Base Percentage', 'on base percentage']),
    slg: headerIndexFlexible(header, ['SLG', 'Slugging', 'slugging']),
    ops: headerIndexFlexible(header, ['OPS', 'On Base Plus Slugging', 'on base plus slugging']),
    opsPlus: headerIndexFlexible(header, ['OPS+', 'OPS Plus', 'ops plus']),
    woba: headerIndexFlexible(header, ['wOBA', 'woba', 'WOBA']),
    wobaNum: headerIndexFlexible(header, ['wOBA (Num)', 'woba num', 'WOBA NUM']),
    wobaDen: headerIndexFlexible(header, ['wOBA (Den)', 'woba den', 'WOBA DEN']),
    wrcPlus: headerIndexFlexible(header, ['wRC+', 'wrc plus', 'WRC PLUS']),
    wrcPct: headerIndexFlexible(header, ['wRC+ Percentile', 'wrc percentile', 'WRC PERCENTILE']),
  }

  if (idx.year < 0 || idx.first < 0 || idx.last < 0) {
    console.warn('IH: Missing required header indices. Got header:', header)
    return
  }

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length === 0) continue

    const year = toInt(row[idx.year], NaN)
    const first = clean(row[idx.first])
    const last = clean(row[idx.last])
    const teamCode = idx.team >= 0 ? clean(row[idx.team]) : ''
    if (!Number.isFinite(year) || (!first && !last)) continue

    let teamId: string | undefined
    if (teamCode) {
      const meta = byCode[teamCode]
      if (meta) {
        const team = await ensureTeam(teamCode, meta.name, meta.logo)
        teamId = team.id
      }
    }

    const name = `${first} ${last}`.trim()
    const player = await prisma.player.upsert({ where: { name }, create: { name }, update: {} })

    const games = toInt(row[idx.gp])
    const pa = idx.pa >= 0 ? toInt(row[idx.pa]) : 0
    const atBats = toInt(row[idx.ab])
    const runs = toInt(row[idx.r])
    const hits = toInt(row[idx.h])
    const doubles = toInt(row[idx.doub])
    const triples = toInt(row[idx.trip])
    const homeRuns = toInt(row[idx.hr])
    const rbis = toInt(row[idx.rbi])
    const walks = toInt(row[idx.bb])
    const strikeouts = toInt(row[idx.k])
    const sacFlies = idx.sf >= 0 ? toInt(row[idx.sf]) : 0
    const avg = toFloat(row[idx.avg])
    const obp = toFloat(row[idx.obp])
    const slg = toFloat(row[idx.slg])
    const ops = toFloat(row[idx.ops])
    const opsPlus = idx.opsPlus >= 0 ? toFloat(row[idx.opsPlus]) : undefined
    const woba = idx.woba >= 0 ? toFloat(row[idx.woba]) : undefined
    const wobaNum = idx.wobaNum >= 0 ? toFloat(row[idx.wobaNum]) : undefined
    const wobaDen = idx.wobaDen >= 0 ? toFloat(row[idx.wobaDen]) : undefined
    const wrcPlus = idx.wrcPlus >= 0 ? toFloat(row[idx.wrcPlus]) : undefined

    const q = parseQualifier(row[idx.wrcPct])

    await prisma.playerHittingStats.upsert({
      where: { playerId_year: { playerId: player.id, year } },
      create: { playerId: player.id, year, games, plateAppearances: pa, atBats, runs, hits, doubles, triples, homeRuns, rbis, walks, strikeouts, sacFlies, avg, obp, slg, ops, opsPlus, woba, wobaNum, wobaDen, wrcPlus, isQualified: q.qualified, wrcPlusPercentile: q.percentile ?? undefined },
      update: { games, plateAppearances: pa, atBats, runs, hits, doubles, triples, homeRuns, rbis, walks, strikeouts, sacFlies, avg, obp, slg, ops, opsPlus, woba, wobaNum, wobaDen, wrcPlus, isQualified: q.qualified, wrcPlusPercentile: q.percentile ?? undefined },
    })

    if (teamId) {
      await prisma.playerTeam.upsert({
        where: { playerId_teamId_year: { playerId: player.id, teamId, year } },
        create: { playerId: player.id, teamId, year },
        update: {},
      })
    }
  }
}

async function importPitchingStats() {
  console.log('Importing Individual Pitching (IP) ...')
  const byCode = await loadTeamMappingByCode()
  const rows = await loadSheetRange('IP', 'A300:AA999')
  if (!rows || rows.length === 0) return

  const header = rows[0]
  const idx = {
    year: headerIndexFlexible(header, ['Year', 'YEAR', 'year']),
    first: headerIndexFlexible(header, ['FIRST', 'First', 'first']),
    last: headerIndexFlexible(header, ['LAST', 'Last', 'last']),
    team: headerIndexFlexible(header, ['TEAM', 'Team', 'team']),
    gp: headerIndexFlexible(header, ['GP', 'G', 'Games', 'games']),
    gs: headerIndexFlexible(header, ['GS', 'Games Started', 'games started']),
    ip: headerIndexFlexible(header, ['IP', 'Innings Pitched', 'innings pitched']),
    r: headerIndexFlexible(header, ['R', 'Runs', 'runs']),
    er: headerIndexFlexible(header, ['ER', 'Earned Runs', 'earned runs']),
    h: headerIndexFlexible(header, ['H', 'Hits', 'hits']),
    bb: headerIndexFlexible(header, ['BB', 'Walks', 'walks']),
    ibb: headerIndexFlexible(header, ['IBB', 'Intentional Walks', 'intentional walks']),
    k: headerIndexFlexible(header, ['K', 'Strikeouts', 'strikeouts']),
    cg: headerIndexFlexible(header, ['CG', 'Complete Games', 'complete games']),
    w: headerIndexFlexible(header, ['W', 'Wins', 'wins']),
    l: headerIndexFlexible(header, ['L', 'Losses', 'losses']),
    s: headerIndexFlexible(header, ['S', 'Saves', 'saves']),
    hld: headerIndexFlexible(header, ['HLD', 'Holds', 'holds']),
    era: headerIndexFlexible(header, ['ERA', 'Earned Run Average', 'earned run average']),
    whip: headerIndexFlexible(header, ['WHIP', 'Walks and Hits per Inning', 'walks and hits per inning']),
    kPct: headerIndexFlexible(header, ['K PCT', 'K PCT', 'k pct']),
    bbPct: headerIndexFlexible(header, ['BB PCT', 'BB PCT', 'bb pct']),
    kbb: headerIndexFlexible(header, ['K/BB', 'K/BB', 'k/bb']),
    oppAvg: headerIndexFlexible(header, ['OPP AVG', 'Opponent Average', 'opponent average']),
    eraPct: headerIndexFlexible(header, ['ERA Percentile', 'ERA Percentile', 'era percentile']),
  }

  if (idx.year < 0 || idx.first < 0 || idx.last < 0) {
    console.warn('IP: Missing required header indices. Got header:', header)
    return
  }

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length === 0) continue

    const year = toInt(row[idx.year], NaN)
    const first = clean(row[idx.first])
    const last = clean(row[idx.last])
    const teamCode = idx.team >= 0 ? clean(row[idx.team]) : ''
    if (!Number.isFinite(year) || (!first && !last)) continue

    let teamId: string | undefined
    if (teamCode) {
      const meta = byCode[teamCode]
      if (meta) {
        const team = await ensureTeam(teamCode, meta.name, meta.logo)
        teamId = team.id
      }
    }

    const name = `${first} ${last}`.trim()
    const player = await prisma.player.upsert({ where: { name }, create: { name }, update: {} })

    const games = toInt(row[idx.gp])
    const inningsPitched = toFloat(row[idx.ip])
    const wins = toInt(row[idx.w])
    const losses = toInt(row[idx.l])
    const saves = toInt(row[idx.s])
    const strikeouts = toInt(row[idx.k])
    const walks = toInt(row[idx.bb])
    const hits = toInt(row[idx.h])
    const runs = toInt(row[idx.r])
    const earnedRuns = toInt(row[idx.er])
    const era = toFloat(row[idx.era])
    const whip = toFloat(row[idx.whip])
    const oppAvg = idx.oppAvg >= 0 ? toFloat(row[idx.oppAvg]) : undefined

    const q = parseQualifier(row[idx.eraPct])

    await prisma.playerPitchingStats.upsert({
      where: { playerId_year: { playerId: player.id, year } },
      create: { playerId: player.id, year, games, inningsPitched, wins, losses, saves, strikeouts, walks, hits, runs, earnedRuns, era, whip, oppAvg, isQualified: q.qualified, eraPercentile: q.percentile ?? undefined },
      update: { games, inningsPitched, wins, losses, saves, strikeouts, walks, hits, runs, earnedRuns, era, whip, oppAvg, isQualified: q.qualified, eraPercentile: q.percentile ?? undefined },
    })

    if (teamId) {
      await prisma.playerTeam.upsert({
        where: { playerId_teamId_year: { playerId: player.id, teamId, year } },
        create: { playerId: player.id, teamId, year },
        update: {},
      })
    }
  }
}

async function importTeamStats() {
  console.log('Importing Standings ...')
  // Load from the correct range: A54:T952 with headers in row 54
  const rows = await loadSheetRange('IH', 'A54:T952')
  if (!rows || rows.length <= 1) return

  // First row contains headers
  const header = rows[0]
  const idx = {
    team: headerIndexFlexible(header, ['Teams', 'Team', 'team']),
    year: headerIndexFlexible(header, ['Year', 'YEAR', 'year']),
    wins: headerIndexFlexible(header, ['W', 'Wins', 'wins']),
    losses: headerIndexFlexible(header, ['L', 'Losses', 'losses']),
    pct: headerIndexFlexible(header, ['PCT', 'Percentage', 'percentage']),
    berth: headerIndexFlexible(header, ['Berth', 'berth']),
    playoffWins: headerIndexFlexible(header, ['Playoffs W', 'Playoff W', 'playoffs w']),
    playoffLosses: headerIndexFlexible(header, ['Playoff L', 'Playoff L', 'playoff l']),
    playoffPct: headerIndexFlexible(header, ['Playoff PCT', 'Playoff PCT', 'playoff pct']),
    seriesWins: headerIndexFlexible(header, ['Series W', 'Series W', 'series w']),
    seriesLosses: headerIndexFlexible(header, ['Series L', 'Series L', 'series l']),
    seriesPct: headerIndexFlexible(header, ['Series PCT', 'Series PCT', 'series pct']),
    wsApp: headerIndexFlexible(header, ['WS APP', 'World Series Appearances', 'ws app']),
    wsWin: headerIndexFlexible(header, ['WS Win', 'World Series Wins', 'ws win']),
    runsFor: headerIndexFlexible(header, ['RF', 'Runs For', 'runs for']),
    runsAgainst: headerIndexFlexible(header, ['RA', 'Runs Against', 'runs against']),
    runsForPlayoffs: headerIndexFlexible(header, ['RF Playoffs', 'Playoff Runs For', 'rf playoffs']),
    runsAgainstPlayoffs: headerIndexFlexible(header, ['RA Playoffs', 'Playoff Runs Against', 'ra playoffs']),
    runsPerGame: headerIndexFlexible(header, ['Runs/Game', 'Runs Per Game', 'runs/game']),
    runsAgainstPerGame: headerIndexFlexible(header, ['RA/Game', 'Runs Against Per Game', 'ra/game']),
  }

  if (idx.team < 0 || idx.year < 0 || idx.wins < 0 || idx.losses < 0) {
    console.warn('Standings: Missing required header indices. Got header:', header)
    return
  }

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length === 0) continue

    const year = toInt(row[idx.year], NaN)
    const teamName = clean(row[idx.team])
    if (!teamName || !Number.isFinite(year)) continue

    const wins = toInt(row[idx.wins], 0)
    const losses = toInt(row[idx.losses], 0)
    const pct = idx.pct >= 0 ? toFloat(row[idx.pct], 0) : (wins / (wins + losses))
    const runsScored = idx.runsFor >= 0 ? toInt(row[idx.runsFor], 0) : 0
    const runsAllowed = idx.runsAgainst >= 0 ? toInt(row[idx.runsAgainst], 0) : 0
    const runDiff = runsScored - runsAllowed

    // Try to find team by name first, then create if not found
    let team = await prisma.team.findFirst({ 
      where: { 
        OR: [
          { name: teamName },
          { name: { contains: teamName } }
        ]
      }
    })

    if (!team) {
      team = await prisma.team.create({ 
        data: { 
          name: teamName, 
          logoUrl: `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.png` 
        } 
      })
    }

    await prisma.teamStats.upsert({
      where: { teamId_year: { teamId: team.id, year } },
      create: { 
        teamId: team.id, 
        year, 
        wins, 
        losses, 
        winningPercentage: pct, 
        runsScored, 
        runsAllowed, 
        runDifferential: runDiff 
      },
      update: { 
        wins, 
        losses, 
        winningPercentage: pct, 
        runsScored, 
        runsAllowed, 
        runDifferential: runDiff 
      },
    })
  }
}

async function main() {
  try {
    await importHittingStats()
    await importPitchingStats()
    await importTeamStats()
    console.log('Data import completed successfully')
  } catch (error) {
    console.error('Error importing data:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
