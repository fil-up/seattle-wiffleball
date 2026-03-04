import { NextResponse } from 'next/server'
import {
  fetchSheet,
  transformYearlyHitting,
  transformYearlyPitching,
} from '@/lib/sheets'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [hittingResult, pitchingResult] = await Promise.all([
      fetchSheet('IH', 'A700:AP2000', transformYearlyHitting),
      fetchSheet('IP', 'A300:AA999', transformYearlyPitching),
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
