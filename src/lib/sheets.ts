const SPREADSHEET_ID = process.env.SPREADSHEET_ID
if (!SPREADSHEET_ID) {
  throw new Error(
    'SPREADSHEET_ID environment variable is not set. Add it to .env.local'
  )
}

// --- Types ---

export interface GvizCol {
  id: string
  label: string
  type: string
}

export interface GvizCell {
  v: any
  f?: string
}

export interface GvizRow {
  c: Array<GvizCell | null>
}

interface GvizTable {
  table: {
    cols: GvizCol[]
    rows: GvizRow[]
  }
}

interface CacheEntry<T> {
  data: T
  fetchedAt: number
}

// --- Configuration ---

const CACHE_TTL_MS = 30_000

// --- Cache ---

const cache = new Map<string, CacheEntry<any>>()

// --- URL Construction ---

function buildGvizUrl(sheet: string, range: string): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}&range=${range}`
}

// --- Response Parsing ---

export function parseGvizResponse(text: string): GvizTable {
  const match = text.match(
    /google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/
  )
  if (!match) {
    throw new Error('Failed to parse gviz response — unexpected format')
  }
  return JSON.parse(match[1]) as GvizTable
}

// --- Cell Helpers ---

export function cellValue(row: GvizRow, index: number): any {
  return row.c?.[index]?.v ?? null
}

export function cellString(row: GvizRow, index: number): string {
  const v = row.c?.[index]?.v
  return v != null ? String(v) : ''
}

export function cellNumber(row: GvizRow, index: number): number {
  const v = row.c?.[index]?.v
  if (v == null) return 0
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

export function cellFloat(
  row: GvizRow,
  index: number,
  decimals?: number
): number {
  const n = cellNumber(row, index)
  if (decimals != null) {
    return parseFloat(n.toFixed(decimals))
  }
  return n
}

// --- Column Mapping ---

export function buildColumnMap(cols: GvizCol[]): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = 0; i < cols.length; i++) {
    const label = cols[i].label?.trim().toLowerCase()
    if (label) map.set(label, i)
  }
  return map
}

export function colIdx(
  cm: Map<string, number>,
  header: string,
  fallback: number
): number {
  return cm.get(header.toLowerCase()) ?? fallback
}

// --- Row Interfaces ---

export interface YearlyHittingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  year: number
  team: string
  games: number
  plateAppearances: number
  atBats: number
  runs: number
  hits: number
  doubles: number
  triples: number
  homeRuns: number
  rbis: number
  walks: number
  strikeouts: number
  avg: number
  obp: number
  slg: number
  ops: number
  opsPlus: number
  wrcPlus: number
  teamLogo: string
}

export interface TotalsHittingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  seasons: number
  games: number
  plateAppearances: number
  atBats: number
  runs: number
  hits: number
  doubles: number
  triples: number
  homeRuns: number
  rbis: number
  walks: number
  strikeouts: number
  avg: number
  obp: number
  slg: number
  ops: number
  wrcPlus: number
  teamLogo: string
}

export interface YearlyPitchingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  year: number
  team: string
  games: number
  inningsPitched: number
  wins: number
  losses: number
  saves: number
  strikeouts: number
  walks: number
  hits: number
  runs: number
  earnedRuns: number
  era: number
  whip: number
  k9: number
  oppAvg: number
  teamLogo: string
}

export interface TotalsPitchingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  seasons: number
  games: number
  inningsPitched: number
  wins: number
  losses: number
  saves: number
  strikeouts: number
  walks: number
  hits: number
  runs: number
  earnedRuns: number
  era: number
  whip: number
  k9: number
  oppAvg: number
  teamLogo: string
}

// --- Centralized Transforms ---

export function transformYearlyHitting(
  rows: GvizRow[],
  cols: GvizCol[]
): YearlyHittingRow[] {
  const cm = buildColumnMap(cols)
  return rows
    .map((row, index) => {
      const first = cellString(row, colIdx(cm, 'first', 2))
      const last = cellString(row, colIdx(cm, 'last', 3))
      const nameId = cellString(row, colIdx(cm, 'name id', 1))
      if (!first && !last) return null

      const team = cellString(row, colIdx(cm, 'team', 4))
      return {
        id: `hitting-${index}`,
        playerId: nameId,
        player: { id: nameId, name: `${first} ${last}`.trim() },
        year: cellNumber(row, colIdx(cm, 'year', 0)),
        team,
        games: cellNumber(row, colIdx(cm, 'g', 7)),
        plateAppearances: cellNumber(row, colIdx(cm, 'pa', 8)),
        atBats: cellNumber(row, colIdx(cm, 'ab', 9)),
        runs: cellNumber(row, colIdx(cm, 'r', 10)),
        hits: cellNumber(row, colIdx(cm, 'h', 11)),
        doubles: cellNumber(row, colIdx(cm, '2b', 12)),
        triples: cellNumber(row, colIdx(cm, '3b', 13)),
        homeRuns: cellNumber(row, colIdx(cm, 'hr', 14)),
        rbis: cellNumber(row, colIdx(cm, 'rbi', 15)),
        walks: cellNumber(row, colIdx(cm, 'bb', 16)),
        strikeouts: cellNumber(row, colIdx(cm, 'so', 17)),
        avg: cellFloat(row, colIdx(cm, 'avg', 6)),
        obp: cellFloat(row, colIdx(cm, 'obp', 21)),
        slg: cellFloat(row, colIdx(cm, 'slg', 22)),
        ops: cellFloat(row, colIdx(cm, 'ops', 23)),
        opsPlus: cellNumber(row, colIdx(cm, 'ops+', 28)),
        wrcPlus: cellNumber(row, colIdx(cm, 'wrc+', 34)),
        teamLogo: `/images/teams/${team || 'default'}-logo.png`,
      }
    })
    .filter(
      (r): r is YearlyHittingRow =>
        r !== null && r.player.name.trim() !== '' && r.year > 0
    )
}

export function transformTotalsHitting(
  rows: GvizRow[],
  cols: GvizCol[]
): TotalsHittingRow[] {
  const cm = buildColumnMap(cols)
  return rows
    .map((row, index) => {
      const first = cellString(row, colIdx(cm, 'first', 0))
      const last = cellString(row, colIdx(cm, 'last', 1))
      if (!first && !last) return null
      const id = `${first}-${last}`

      return {
        id: `hitting-totals-${index}`,
        playerId: id,
        player: { id, name: `${first} ${last}`.trim() },
        seasons: cellNumber(row, colIdx(cm, 'seasons', 2)),
        games: cellNumber(row, colIdx(cm, 'g', 4)),
        plateAppearances: cellNumber(row, colIdx(cm, 'pa', 5)),
        atBats: cellNumber(row, colIdx(cm, 'ab', 6)),
        runs: cellNumber(row, colIdx(cm, 'r', 7)),
        hits: cellNumber(row, colIdx(cm, 'h', 8)),
        doubles: cellNumber(row, colIdx(cm, '2b', 9)),
        triples: cellNumber(row, colIdx(cm, '3b', 10)),
        homeRuns: cellNumber(row, colIdx(cm, 'hr', 11)),
        rbis: cellNumber(row, colIdx(cm, 'rbi', 12)),
        walks: cellNumber(row, colIdx(cm, 'bb', 13)),
        strikeouts: cellNumber(row, colIdx(cm, 'so', 14)),
        avg: cellFloat(row, colIdx(cm, 'avg', 15)),
        obp: cellFloat(row, colIdx(cm, 'obp', 18)),
        slg: cellFloat(row, colIdx(cm, 'slg', 19)),
        ops: cellFloat(row, colIdx(cm, 'ops', 20)),
        wrcPlus: cellNumber(row, colIdx(cm, 'wrc+', 33)),
        teamLogo: '/images/teams/default-logo.png',
      }
    })
    .filter(
      (r): r is TotalsHittingRow =>
        r !== null && r.player.name.trim() !== '' && (r.seasons ?? 0) > 0
    )
}

export function transformYearlyPitching(
  rows: GvizRow[],
  cols: GvizCol[]
): YearlyPitchingRow[] {
  const cm = buildColumnMap(cols)
  return rows
    .map((row, index) => {
      const first = cellString(row, colIdx(cm, 'first', 2))
      const last = cellString(row, colIdx(cm, 'last', 3))
      const nameId = cellString(row, colIdx(cm, 'name id', 1))
      if (!first && !last) return null

      const team = cellString(row, colIdx(cm, 'team', 4))
      const inningsPitched = cellFloat(row, colIdx(cm, 'ip', 8), 1)
      const strikeouts = cellNumber(row, colIdx(cm, 'k', 14))
      return {
        id: `pitching-${index}`,
        playerId: nameId,
        player: { id: nameId, name: `${first} ${last}`.trim() },
        year: cellNumber(row, colIdx(cm, 'year', 0)),
        team,
        games: cellNumber(row, colIdx(cm, 'g', 6)),
        inningsPitched,
        wins: cellNumber(row, colIdx(cm, 'w', 11)),
        losses: cellNumber(row, colIdx(cm, 'l', 12)),
        saves: cellNumber(row, colIdx(cm, 'sv', 13)),
        strikeouts,
        walks: cellNumber(row, colIdx(cm, 'bb', 15)),
        hits: cellNumber(row, colIdx(cm, 'h', 16)),
        runs: cellNumber(row, colIdx(cm, 'r', 17)),
        earnedRuns: cellNumber(row, colIdx(cm, 'er', 18)),
        era: cellFloat(row, colIdx(cm, 'era', 19), 2),
        whip: cellFloat(row, colIdx(cm, 'whip', 20), 2),
        k9: inningsPitched > 0 ? parseFloat(((strikeouts / inningsPitched) * 9).toFixed(2)) : 0,
        oppAvg: cellFloat(row, colIdx(cm, 'opp avg', 24), 3),
        teamLogo: `/images/teams/${team || 'default'}-logo.png`,
      }
    })
    .filter(
      (r): r is YearlyPitchingRow =>
        r !== null && r.player.name.trim() !== '' && r.year > 0
    )
}

export function transformTotalsPitching(
  rows: GvizRow[],
  cols: GvizCol[]
): TotalsPitchingRow[] {
  const cm = buildColumnMap(cols)
  return rows
    .map((row, index) => {
      const first = cellString(row, colIdx(cm, 'first', 0))
      const last = cellString(row, colIdx(cm, 'last', 1))
      if (!first && !last) return null
      const id = `${first}-${last}`
      const inningsPitched = cellFloat(row, colIdx(cm, 'ip', 6), 1)
      const strikeouts = cellNumber(row, colIdx(cm, 'k', 14))

      return {
        id: `pitching-totals-${index}`,
        playerId: id,
        player: { id, name: `${first} ${last}`.trim() },
        seasons: cellNumber(row, colIdx(cm, 'seasons', 2)),
        games: cellNumber(row, colIdx(cm, 'g', 4)),
        inningsPitched,
        wins: cellNumber(row, colIdx(cm, 'w', 11)),
        losses: cellNumber(row, colIdx(cm, 'l', 12)),
        saves: cellNumber(row, colIdx(cm, 'sv', 13)),
        strikeouts,
        walks: cellNumber(row, colIdx(cm, 'bb', 15)),
        hits: cellNumber(row, colIdx(cm, 'h', 16)),
        runs: cellNumber(row, colIdx(cm, 'r', 17)),
        earnedRuns: cellNumber(row, colIdx(cm, 'er', 18)),
        era: cellFloat(row, colIdx(cm, 'era', 19), 2),
        whip: cellFloat(row, colIdx(cm, 'whip', 20), 2),
        k9: inningsPitched > 0 ? parseFloat(((strikeouts / inningsPitched) * 9).toFixed(2)) : 0,
        oppAvg: cellFloat(row, colIdx(cm, 'opp avg', 24), 3),
        teamLogo: '/images/teams/default-logo.png',
      }
    })
    .filter(
      (r): r is TotalsPitchingRow =>
        r !== null && r.player.name.trim() !== '' && (r.seasons ?? 0) > 0
    )
}

// --- Main Export ---

export async function fetchSheet<T>(
  sheet: string,
  range: string,
  transform: (rows: GvizRow[], cols: GvizCol[]) => T
): Promise<{ data: T; stale: boolean }> {
  const cacheKey = `${sheet}!${range}`
  const now = Date.now()
  const cached = cache.get(cacheKey) as CacheEntry<T> | undefined

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { data: cached.data, stale: false }
  }

  try {
    const url = buildGvizUrl(sheet, range)
    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`Google Sheets returned ${response.status}`)
    }

    const text = await response.text()
    const parsed = parseGvizResponse(text)
    const rows = parsed.table.rows || []
    const cols = parsed.table.cols || []
    const data = transform(rows, cols)

    cache.set(cacheKey, { data, fetchedAt: now })

    return { data, stale: false }
  } catch (error) {
    if (cached) {
      return { data: cached.data, stale: true }
    }
    throw error
  }
}
