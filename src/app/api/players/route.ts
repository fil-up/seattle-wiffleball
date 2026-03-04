import { NextRequest, NextResponse } from 'next/server'
import {
  fetchSheet,
  cellString,
  cellNumber,
  cellFloat,
  GvizRow,
} from '@/lib/sheets'

const SHEET_MAP: Record<string, { sheet: string; range: string }> = {
  'hitting-yearly': { sheet: 'IH', range: 'A700:AP2000' },
  'hitting-totals': { sheet: 'IH', range: 'A1:AP600' },
  'pitching-yearly': { sheet: 'IP', range: 'A300:AA999' },
  'pitching-totals': { sheet: 'IP', range: 'A1:AA270' },
}

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
      const id = `${first}-${last}`

      return {
        id: `hitting-totals-${index}`,
        playerId: id,
        player: { id, name: `${first} ${last}`.trim() },
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
      const id = `${first}-${last}`

      return {
        id: `pitching-totals-${index}`,
        playerId: id,
        player: { id, name: `${first} ${last}`.trim() },
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'hitting'
    const scope = searchParams.get('scope') || 'yearly'

    const key = `${type}-${scope}` as keyof typeof SHEET_MAP
    const mapping = SHEET_MAP[key]
    if (!mapping) {
      return NextResponse.json(
        { error: `Invalid type/scope: ${type}/${scope}` },
        { status: 400 }
      )
    }

    const transform =
      type === 'hitting'
        ? scope === 'yearly'
          ? transformYearlyHitting
          : transformTotalsHitting
        : scope === 'yearly'
          ? transformYearlyPitching
          : transformTotalsPitching

    const { data, stale } = await fetchSheet(
      mapping.sheet,
      mapping.range,
      (rows) => transform(rows)
    )

    return NextResponse.json({ data, stale })
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    )
  }
}
