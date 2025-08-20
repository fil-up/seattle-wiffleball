import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const qualified = searchParams.get('qualified') === 'true'

  try {
    const players = await prisma.player.findMany({
      include: {
        hittingStats: year ? {
          where: { year: parseInt(year) }
        } : true,
        pitchingStats: year ? {
          where: { year: parseInt(year) }
        } : true,
        teams: {
          include: {
            team: true
          }
        }
      }
    })

    // If qualified is true, filter for players meeting minimum requirements
    let filteredPlayers = players
    if (qualified) {
      filteredPlayers = players.filter(player => {
        const relevantStats = year 
          ? player.hittingStats.filter(stat => stat.year === parseInt(year))
          : player.hittingStats

        // Minimum 2.7 plate appearances per team game (using 20 games as season length)
        return relevantStats.some(stat => stat.atBats + stat.walks >= 54)
      })
    }

    return NextResponse.json(filteredPlayers)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}
