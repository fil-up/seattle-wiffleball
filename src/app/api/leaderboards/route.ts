import { NextRequest, NextResponse } from 'next/server'
import {
  fetchSheet,
  cellString,
  cellNumber,
  cellFloat,
  GvizRow,
} from '@/lib/sheets'

const ASCENDING_STATS = new Set(['era', 'whip'])

function transformYearlyHitting(rows: GvizRow[]) {
  return rows
    .map((row, index) => {
      const first = cellString(row, 2)
      const last = cellString(row, 3)
      const nameId = cellString(row, 1)
      if (!first && !last) return null

      return {
        id: `hitting-${index}`,
        playerId: nameId,
        player: { id: nameId, name: `${first} ${last}`.trim() },
        year: cellNumber(row, 0),
        team: cellString(row, 4),
        games: cellNumber(row, 7),
        plateAppearances: cellNumber(row, 8),
        atBats: cellNumber(row, 9),
        runs: cellNumber(row, 10),
        hits: cellNumber(row, 11),
        doubles: cellNumber(row, 12),
        triples: cellNumber(row, 13),
        homeRuns: cellNumber(row, 14),
        rbis: cellNumber(row, 15),
        walks: cellNumber(row, 16),
        strikeouts: cellNumber(row, 17),
        avg: cellFloat(row, 6),
        obp: cellFloat(row, 21),
        slg: cellFloat(row, 22),
        ops: cellFloat(row, 23),
        opsPlus: cellNumber(row, 28),
        wrcPlus: cellNumber(row, 34),
        teamLogo: `/images/teams/${cellString(row, 4) || 'default'}-logo.png`,
      }
    })
    .filter(
      (r): r is NonNullable<typeof r> =>
        r !== null && r.player.name.trim() !== '' && r.year > 0
    )
}

function transformTotalsHitting(rows: GvizRow[]) {
  return rows
    .map((row, index) => {
      const first = cellString(row, 0)
      const last = cellString(row, 1)
      if (!first && !last) return null
      const pid = `${first}-${last}`

      return {
        id: `hitting-totals-${index}`,
        playerId: pid,
        player: { id: pid, name: `${first} ${last}`.trim() },
        seasons: cellNumber(row, 2),
        games: cellNumber(row, 4),
        plateAppearances: cellNumber(row, 5),
        atBats: cellNumber(row, 6),
        runs: cellNumber(row, 7),
        hits: cellNumber(row, 8),
        doubles: cellNumber(row, 9),
        triples: cellNumber(row, 10),
        homeRuns: cellNumber(row, 11),
        rbis: cellNumber(row, 12),
        walks: cellNumber(row, 13),
        strikeouts: cellNumber(row, 14),
        avg: cellFloat(row, 15),
        obp: cellFloat(row, 18),
        slg: cellFloat(row, 19),
        ops: cellFloat(row, 20),
        wrcPlus: cellNumber(row, 33),
        teamLogo: '/images/teams/default-logo.png',
      }
    })
    .filter(
      (r): r is NonNullable<typeof r> =>
        r !== null && r.player.name.trim() !== '' && (r.seasons ?? 0) > 0
    )
}

function transformYearlyPitching(rows: GvizRow[]) {
  return rows
    .map((row, index) => {
      const first = cellString(row, 2)
      const last = cellString(row, 3)
      const nameId = cellString(row, 1)
      if (!first && !last) return null

      return {
        id: `pitching-${index}`,
        playerId: nameId,
        player: { id: nameId, name: `${first} ${last}`.trim() },
        year: cellNumber(row, 0),
        team: cellString(row, 4),
        games: cellNumber(row, 6),
        inningsPitched: cellFloat(row, 8, 1),
        wins: cellNumber(row, 11),
        losses: cellNumber(row, 12),
        saves: cellNumber(row, 13),
        strikeouts: cellNumber(row, 14),
        walks: cellNumber(row, 15),
        hits: cellNumber(row, 16),
        runs: cellNumber(row, 17),
        earnedRuns: cellNumber(row, 18),
        era: cellFloat(row, 19, 2),
        whip: cellFloat(row, 20, 2),
        oppAvg: cellFloat(row, 24, 3),
        teamLogo: `/images/teams/${cellString(row, 4) || 'default'}-logo.png`,
      }
    })
    .filter(
      (r): r is NonNullable<typeof r> =>
        r !== null && r.player.name.trim() !== '' && r.year > 0
    )
}

function transformTotalsPitching(rows: GvizRow[]) {
  return rows
    .map((row, index) => {
      const first = cellString(row, 0)
      const last = cellString(row, 1)
      if (!first && !last) return null
      const pid = `${first}-${last}`

      return {
        id: `pitching-totals-${index}`,
        playerId: pid,
        player: { id: pid, name: `${first} ${last}`.trim() },
        seasons: cellNumber(row, 2),
        games: cellNumber(row, 4),
        inningsPitched: cellFloat(row, 6, 1),
        wins: cellNumber(row, 11),
        losses: cellNumber(row, 12),
        saves: cellNumber(row, 13),
        strikeouts: cellNumber(row, 14),
        walks: cellNumber(row, 15),
        hits: cellNumber(row, 16),
        runs: cellNumber(row, 17),
        earnedRuns: cellNumber(row, 18),
        era: cellFloat(row, 19, 2),
        whip: cellFloat(row, 20, 2),
        oppAvg: cellFloat(row, 24, 3),
        teamLogo: '/images/teams/default-logo.png',
      }
    })
    .filter(
      (r): r is NonNullable<typeof r> =>
        r !== null && r.player.name.trim() !== '' && (r.seasons ?? 0) > 0
    )
}

function getSortValue(row: Record<string, any>, stat: string): number {
  return typeof row[stat] === 'number' ? row[stat] : 0
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'hitting'
    const year = searchParams.get('year')
    const stat =
      searchParams.get('stat') || (category === 'hitting' ? 'ops' : 'era')
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const minSeasons = parseInt(searchParams.get('minSeasons') || '0', 10)

    const isHitting = category === 'hitting'
    const isAllTime = !year || year === 'all'

    let data: Record<string, any>[]
    let stale: boolean

    if (isAllTime) {
      const sheet = isHitting ? 'IH' : 'IP'
      const range = isHitting ? 'A1:AP600' : 'A1:AA270'
      const transform = isHitting ? transformTotalsHitting : transformTotalsPitching
      const result = await fetchSheet(sheet, range, (rows) => transform(rows))
      data = result.data
      stale = result.stale

      if (minSeasons > 0) {
        data = data.filter((r) => (r.seasons ?? 0) >= minSeasons)
      }
    } else {
      const sheet = isHitting ? 'IH' : 'IP'
      const range = isHitting ? 'A700:AP2000' : 'A300:AA999'
      const transform = isHitting ? transformYearlyHitting : transformYearlyPitching
      const result = await fetchSheet(sheet, range, (rows) => transform(rows))
      data = result.data
      stale = result.stale

      data = data.filter((r) => String(r.year) === year)
    }

    const ascending = ASCENDING_STATS.has(stat)
    data.sort((a, b) => {
      const aVal = getSortValue(a, stat)
      const bVal = getSortValue(b, stat)
      return ascending ? aVal - bVal : bVal - aVal
    })

    if (limit > 0) {
      data = data.slice(0, limit)
    }

    return NextResponse.json({ data, stale })
  } catch (error) {
    console.error('Error fetching leaderboards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    )
  }
}
