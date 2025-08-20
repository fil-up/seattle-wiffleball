import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')

  try {
    const teams = await prisma.team.findMany({
      include: {
        teamStats: year ? {
          where: { year: parseInt(year) }
        } : true,
        players: {
          include: {
            player: {
              include: {
                hittingStats: true,
                pitchingStats: true
              }
            }
          },
          where: year ? {
            year: parseInt(year)
          } : undefined
        }
      }
    })

    // Calculate team totals and sort by winning percentage
    const teamsWithStats = teams.map(team => {
      const yearStats = year 
        ? team.teamStats.find(stat => stat.year === parseInt(year))
        : team.teamStats.reduce((acc, stat) => ({
            wins: acc.wins + stat.wins,
            losses: acc.losses + stat.losses,
            runsScored: acc.runsScored + stat.runsScored,
            runsAllowed: acc.runsAllowed + stat.runsAllowed,
            runDifferential: acc.runDifferential + stat.runDifferential,
            winningPercentage: (acc.wins + stat.wins) / (acc.wins + stat.wins + acc.losses + stat.losses)
          }), { wins: 0, losses: 0, runsScored: 0, runsAllowed: 0, runDifferential: 0, winningPercentage: 0 })

      return {
        ...team,
        currentStats: yearStats
      }
    }).sort((a, b) => {
      const aWP = a.currentStats?.winningPercentage || 0
      const bWP = b.currentStats?.winningPercentage || 0
      return bWP - aWP
    })

    return NextResponse.json(teamsWithStats)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}
