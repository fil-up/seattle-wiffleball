import { NextRequest, NextResponse } from 'next/server'
import {
  fetchSheet,
  cellString,
  cellNumber,
  cellFloat,
  GvizRow,
} from '@/lib/sheets'

function transformYearlyStandings(rows: GvizRow[]) {
  return rows
    .map((row) => {
      const team = cellString(row, 0)
      if (!team || team.trim() === '' || team === '-' || team === '~')
        return null

      const year = cellString(row, 1)
      if (!year) return null

      return {
        team,
        year,
        wins: cellNumber(row, 2),
        losses: cellNumber(row, 3),
        pct: cellFloat(row, 4, 3),
        rf: cellNumber(row, 14),
        ra: cellNumber(row, 15),
      }
    })
    .filter(Boolean)
}

function transformAllTimeStandings(rows: GvizRow[]) {
  return rows
    .map((row) => {
      const team = cellString(row, 0)
      if (!team || team.trim() === '' || team === '-' || team === '~')
        return null

      return {
        team,
        wins: Math.round(cellNumber(row, 1)),
        losses: Math.round(cellNumber(row, 2)),
        pct: cellFloat(row, 3, 3),
        rf: Math.round(cellNumber(row, 4)),
        ra: Math.round(cellNumber(row, 5)),
        runsPerGame: cellFloat(row, 6, 2),
        raPerGame: cellFloat(row, 7, 2),
        playoffsW: Math.round(cellNumber(row, 8)),
        playoffsL: Math.round(cellNumber(row, 9)),
        playoffPct: cellFloat(row, 10, 3),
        seriesW: Math.round(cellNumber(row, 11)),
        seriesL: Math.round(cellNumber(row, 12)),
        seriesPct: cellFloat(row, 13, 3),
        wsApp: Math.round(cellNumber(row, 14)),
        wsWin: Math.round(cellNumber(row, 15)),
        rfPlayoffs: Math.round(cellNumber(row, 16)),
        raPlayoffs: Math.round(cellNumber(row, 17)),
        berth: Math.round(cellNumber(row, 18)),
      }
    })
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'yearly'

    if (scope === 'alltime') {
      const { data, stale } = await fetchSheet(
        'Standings',
        'B1:T49',
        (rows) => transformAllTimeStandings(rows)
      )
      return NextResponse.json({ data, stale })
    }

    const { data, stale } = await fetchSheet(
      'Standings',
      'A54:T952',
      (rows) => transformYearlyStandings(rows)
    )
    return NextResponse.json({ data, stale })
  } catch (error) {
    console.error('Error fetching standings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}
