import { NextResponse } from 'next/server'
import { fetchSheet, cellString, GvizRow } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

function transformTeams(rows: GvizRow[]) {
  return rows
    .map((row) => {
      const uniqueTeamName = cellString(row, 0)
      const teamCode = cellString(row, 1)
      const franchiseName = cellString(row, 2)
      const franchiseCode = cellString(row, 3)
      const logoImageName = cellString(row, 4)

      if (!uniqueTeamName || !franchiseName) return null

      return {
        id: franchiseCode.toLowerCase(),
        name: franchiseName,
        abbreviation: franchiseCode,
        uniqueTeamName,
        teamCode,
        logoUrl: logoImageName
          ? `/images/teams/${logoImageName}`
          : '/images/teams/default-team-logo.png',
      }
    })
    .filter(Boolean)
}

export async function GET() {
  try {
    const { data, stale } = await fetchSheet(
      'Player/Team Adj',
      'O4:S100',
      (rows) => transformTeams(rows)
    )
    return NextResponse.json({ data, stale })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}
