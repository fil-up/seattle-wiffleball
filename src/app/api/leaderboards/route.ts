import { NextRequest, NextResponse } from 'next/server'
import {
  fetchSheet,
  transformYearlyHitting,
  transformTotalsHitting,
  transformYearlyPitching,
  transformTotalsPitching,
} from '@/lib/sheets'

const ASCENDING_STATS = new Set(['era', 'whip', 'oppAvg'])

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
      const result = isHitting
        ? await fetchSheet('IH', 'A1:AP600', transformTotalsHitting)
        : await fetchSheet('IP', 'A1:AA270', transformTotalsPitching)
      data = result.data
      stale = result.stale

      if (minSeasons > 0) {
        data = data.filter((r) => (r.seasons ?? 0) >= minSeasons)
      }
    } else {
      const result = isHitting
        ? await fetchSheet('IH', 'A700:AP2000', transformYearlyHitting)
        : await fetchSheet('IP', 'A300:AA999', transformYearlyPitching)
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
