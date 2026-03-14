import { NextResponse } from 'next/server'
import { fetchSheet, transformAwards } from '@/lib/sheets'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await fetchSheet('Awards (Tidy)', 'A1:D5000', transformAwards)

    const playerEntries = result.data.filter((r) => r.playerId === id)

    // Group by award name and deduplicate years
    const grouped: Record<string, number[]> = {}
    for (const entry of playerEntries) {
      if (!grouped[entry.award]) grouped[entry.award] = []
      if (!grouped[entry.award].includes(entry.year)) {
        grouped[entry.award].push(entry.year)
      }
    }

    // Sort years ascending within each award
    for (const award of Object.keys(grouped)) {
      grouped[award].sort((a, b) => a - b)
    }

    return NextResponse.json({ data: grouped, stale: result.stale })
  } catch (error) {
    console.error('Error fetching awards:', error)
    return NextResponse.json({ data: {}, stale: false })
  }
}
