import { NextRequest, NextResponse } from 'next/server'
import {
  fetchSheet,
  transformYearlyHitting,
  transformTotalsHitting,
  transformYearlyPitching,
  transformTotalsPitching,
} from '@/lib/sheets'

const SHEET_MAP: Record<string, { sheet: string; range: string }> = {
  'hitting-yearly': { sheet: 'IH', range: 'A700:AP2000' },
  'hitting-totals': { sheet: 'IH', range: 'A1:AP600' },
  'pitching-yearly': { sheet: 'IP', range: 'A300:AA999' },
  'pitching-totals': { sheet: 'IP', range: 'A1:AA270' },
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

    const { data, stale } =
      type === 'hitting'
        ? scope === 'yearly'
          ? await fetchSheet(mapping.sheet, mapping.range, transformYearlyHitting)
          : await fetchSheet(mapping.sheet, mapping.range, transformTotalsHitting)
        : scope === 'yearly'
          ? await fetchSheet(mapping.sheet, mapping.range, transformYearlyPitching)
          : await fetchSheet(mapping.sheet, mapping.range, transformTotalsPitching)

    return NextResponse.json({ data, stale })
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    )
  }
}
