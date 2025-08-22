import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch team mapping data from Google Sheets
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=Player/Team%20Adj&range=O4:S100`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch team data')
    }

    const text = await response.text()
    const jsonText = text.substring(47).slice(0, -2)
    const data = JSON.parse(jsonText)

    const rows = data.table.rows || []
    const teams = rows
      .map((row: any) => {
        const cells = row.c || []
        const uniqueTeams = cells[0]?.v || ''
        const teamCodes = cells[1]?.v || ''
        const franchiseCurrentName = cells[2]?.v || ''
        const franchiseCurrentCode = cells[3]?.v || ''
        const logoImageName = cells[4]?.v || ''
        
        // Only return teams with valid data
        if (!uniqueTeams || !franchiseCurrentName) return null

      return {
          id: franchiseCurrentCode.toLowerCase(),
          name: franchiseCurrentName,
          abbreviation: franchiseCurrentCode,
          uniqueTeamName: uniqueTeams,
          teamCode: teamCodes,
          logoUrl: logoImageName ? `/images/teams/${logoImageName}` : '/images/teams/default-team-logo.png'
        }
      })
      .filter(Boolean) // Remove null entries

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}
