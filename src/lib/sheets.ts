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
