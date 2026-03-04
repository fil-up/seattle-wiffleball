import { NextRequest, NextResponse } from 'next/server'
import {
  fetchSheet,
  transformYearlyHitting,
  transformYearlyPitching,
} from '@/lib/sheets'

const ASCENDING_STATS = new Set(['era', 'whip'])

function getSortValue(row: Record<string, any>, stat: string): number {
  return typeof row[stat] === 'number' ? row[stat] : 0
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'hitting'
    const year = searchParams.get('year')
    const stat = searchParams.get('stat') || (category === 'hitting' ? 'ops' : 'era')
    const qualifiedParam = searchParams.get('qualified')
    const qualified = qualifiedParam !== 'false'
    const limit = parseInt(searchParams.get('limit') || '0', 10)

    const isHitting = category === 'hitting'
    const sheet = isHitting ? 'IH' : 'IP'
    const range = isHitting ? 'A700:AP2000' : 'A300:AA999'

    const { data, stale } = isHitting
      ? await fetchSheet(sheet, range, transformYearlyHitting)
      : await fetchSheet(sheet, range, transformYearlyPitching)

    let filtered = data as Record<string, any>[]

    if (year) {
      filtered = filtered.filter((r) => String(r.year) === year)
    }

    if (qualified) {
      if (isHitting) {
        filtered = filtered.filter((r) => r.wrcPlus && r.wrcPlus > 0)
      } else {
        filtered = filtered.filter((r) => r.era && r.era > 0)
      }
    }

    const ascending = ASCENDING_STATS.has(stat)
    filtered.sort((a, b) => {
      const aVal = getSortValue(a, stat)
      const bVal = getSortValue(b, stat)
      return ascending ? aVal - bVal : bVal - aVal
    })

    if (limit > 0) {
      filtered = filtered.slice(0, limit)
    }

    return NextResponse.json({ data: filtered, stale })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
