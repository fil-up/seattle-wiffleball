import { NextResponse } from 'next/server'
import {
  fetchSheet,
  cellString,
  cellNumber,
  cellFloat,
  GvizRow,
} from '@/lib/sheets'

function transformTeamList(rows: GvizRow[]) {
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

function transformStandings(rows: GvizRow[]) {
  return rows
    .map((row) => {
      const team = cellString(row, 0)
      if (!team || team.trim() === '') return null

      return {
        team,
        year: cellString(row, 1),
        wins: cellNumber(row, 2),
        losses: cellNumber(row, 3),
        pct: cellFloat(row, 4, 3),
        rf: cellNumber(row, 14),
        ra: cellNumber(row, 15),
      }
    })
    .filter(Boolean)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [teamsResult, standingsResult] = await Promise.all([
      fetchSheet('Player/Team Adj', 'O4:S100', (rows) =>
        transformTeamList(rows)
      ),
      fetchSheet('Standings', 'A54:T952', (rows) => transformStandings(rows)),
    ])

    const team = teamsResult.data.find(
      (t) => t && (t.id === id || t.abbreviation.toLowerCase() === id)
    )

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const standings = standingsResult.data.filter(
      (s) =>
        s &&
        (s.team === team.name ||
          s.team === team.uniqueTeamName ||
          s.team.toLowerCase() === team.name.toLowerCase())
    )

    return NextResponse.json({
      data: { team, standings },
      stale: teamsResult.stale || standingsResult.stale,
    })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}
