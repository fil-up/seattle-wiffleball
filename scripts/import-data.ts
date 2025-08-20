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
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    keyFile: 'credentials.json',
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
  if (await fileExists('credentials.json')) {
    const sheets = await getGoogleSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${name}!A:ZZ`,
    })
    return (response.data.values || []) as string[][]
  }
  return fetchCsv(name)
}

async function loadSheetRange(name: string, a1: string): Promise<string[][]> {
  if (await fileExists('credentials.json')) {
    const sheets = await getGoogleSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${name}!${a1}`,
    })
    return (response.data.values || []) as string[][]
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
    year: headerIndex(header, 'Year'),
    first: headerIndex(header, 'FIRST'),
    last: headerIndex(header, 'LAST'),
    team: headerIndex(header, 'TEAM'),
    gp: headerIndex(header, 'GP'),
    pa: headerIndex(header, 'PA'),
    ab: headerIndex(header, 'AB'),
    r: headerIndex(header, 'R'),
    h: headerIndex(header, 'H'),
    doub: headerIndex(header, '2B'),
    trip: headerIndex(header, '3B'),
    hr: headerIndex(header, 'HR'),
    rbi: headerIndex(header, 'RBI'),
    bb: headerIndex(header, 'BB'),
    k: headerIndex(header, 'K'),
    ibb: headerIndex(header, 'IBB'),
    sf: headerIndex(header, 'SF'),
    avg: headerIndex(header, 'AVG'),
    obp: headerIndex(header, 'OBP'),
    slg: headerIndex(header, 'SLG'),
    ops: headerIndex(header, 'OPS'),
    opsPlus: headerIndex(header, 'OPS+'),
    woba: headerIndex(header, 'wOBA'),
    wobaNum: headerIndex(header, 'wOBA (Num)'),
    wobaDen: headerIndex(header, 'wOBA (Den)'),
    wrcPlus: headerIndex(header, 'wRC+'),
    wrcPct: headerIndex(header, 'wRC+ Percentile'),
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
    year: headerIndex(header, 'Year'),
    first: headerIndex(header, 'FIRST'),
    last: headerIndex(header, 'LAST'),
    team: headerIndex(header, 'TEAM'),
    gp: headerIndex(header, 'GP'),
    gs: headerIndex(header, 'GS'),
    ip: headerIndex(header, 'IP'),
    r: headerIndex(header, 'R'),
    er: headerIndex(header, 'ER'),
    h: headerIndex(header, 'H'),
    bb: headerIndex(header, 'BB'),
    ibb: headerIndex(header, 'IBB'),
    k: headerIndex(header, 'K'),
    cg: headerIndex(header, 'CG'),
    w: headerIndex(header, 'W'),
    l: headerIndex(header, 'L'),
    s: headerIndex(header, 'S'),
    hld: headerIndex(header, 'HLD'),
    era: headerIndex(header, 'ERA'),
    whip: headerIndex(header, 'WHIP'),
    kPct: headerIndex(header, 'K PCT'),
    bbPct: headerIndex(header, 'BB PCT'),
    kbb: headerIndex(header, 'K/BB'),
    oppAvg: headerIndex(header, 'OPP AVG'),
    eraPct: headerIndex(header, 'ERA Percentile'),
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
  const rows = await loadSheet('Standings')
  if (rows.length <= 1) return

  const headerIdx = rows.findIndex((row) => row.some((c) => clean(c).toLowerCase() === 'year'))
  const start = headerIdx >= 0 ? headerIdx + 1 : 1

  for (let r = start; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length === 0) continue
    const year = toInt(row[0], NaN)
    const teamName = clean(row[1] ?? row[0])
    if (!teamName || !Number.isFinite(year)) continue

    const wins = toInt(row[3] ?? row[2] ?? 0)
    const losses = toInt(row[4] ?? row[3] ?? 0)
    const pct = toFloat(row[5] ?? row[4] ?? 0)
    const runsScored = toInt(row[6] ?? row[5] ?? 0)
    const runsAllowed = toInt(row[7] ?? row[6] ?? 0)
    const runDiff = toInt(row[8] ?? row[7] ?? (runsScored - runsAllowed))

    const team = await prisma.team.upsert({ where: { name: teamName }, create: { name: teamName, logoUrl: `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.png` }, update: {} })

    await prisma.teamStats.upsert({
      where: { teamId_year: { teamId: team.id, year } },
      create: { teamId: team.id, year, wins, losses, winningPercentage: pct, runsScored, runsAllowed, runDifferential: runDiff },
      update: { wins, losses, winningPercentage: pct, runsScored, runsAllowed, runDifferential: runDiff },
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
