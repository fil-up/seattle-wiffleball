import { NextResponse } from 'next/server'
import {
  fetchSheet,
  cellString,
  cellNumber,
  cellFloat,
  GvizRow,
} from '@/lib/sheets'

function transformHitting(rows: GvizRow[]) {
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

function transformPitching(rows: GvizRow[]) {
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [hittingResult, pitchingResult] = await Promise.all([
      fetchSheet('IH', 'A700:AP2000', (rows) => transformHitting(rows)),
      fetchSheet('IP', 'A300:AA999', (rows) => transformPitching(rows)),
    ])

    const hitting = hittingResult.data.filter((r) => r.playerId === id)
    const pitching = pitchingResult.data.filter((r) => r.playerId === id)

    if (hitting.length === 0 && pitching.length === 0) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: { hitting, pitching },
      stale: hittingResult.stale || pitchingResult.stale,
    })
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    )
  }
}
