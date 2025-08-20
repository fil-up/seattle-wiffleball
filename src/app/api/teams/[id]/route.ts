import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        teamStats: {
          orderBy: { year: 'desc' }
        },
        players: {
          include: {
            player: {
              include: {
                hittingStats: true,
                pitchingStats: true
              }
            }
          },
          orderBy: { year: 'desc' }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Calculate franchise totals
    const franchiseTotals = team.teamStats.reduce((acc, stat) => ({
      games: acc.games + stat.wins + stat.losses,
      wins: acc.wins + stat.wins,
      losses: acc.losses + stat.losses,
      winningPercentage: (acc.wins + stat.wins) / (acc.wins + acc.losses + stat.wins + stat.losses),
      runsScored: acc.runsScored + stat.runsScored,
      runsAllowed: acc.runsAllowed + stat.runsAllowed,
      runDifferential: acc.runDifferential + stat.runDifferential
    }), {
      games: 0,
      wins: 0,
      losses: 0,
      winningPercentage: 0,
      runsScored: 0,
      runsAllowed: 0,
      runDifferential: 0
    })

    return NextResponse.json({
      ...team,
      franchiseTotals
    })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}
