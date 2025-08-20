import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        hittingStats: {
          orderBy: { year: 'desc' }
        },
        pitchingStats: {
          orderBy: { year: 'desc' }
        },
        teams: {
          include: {
            team: true
          },
          orderBy: { year: 'desc' }
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Calculate career totals
    const careerHitting = {
      games: player.hittingStats.reduce((sum, stat) => sum + stat.games, 0),
      atBats: player.hittingStats.reduce((sum, stat) => sum + stat.atBats, 0),
      runs: player.hittingStats.reduce((sum, stat) => sum + stat.runs, 0),
      hits: player.hittingStats.reduce((sum, stat) => sum + stat.hits, 0),
      doubles: player.hittingStats.reduce((sum, stat) => sum + stat.doubles, 0),
      triples: player.hittingStats.reduce((sum, stat) => sum + stat.triples, 0),
      homeRuns: player.hittingStats.reduce((sum, stat) => sum + stat.homeRuns, 0),
      rbis: player.hittingStats.reduce((sum, stat) => sum + stat.rbis, 0),
      walks: player.hittingStats.reduce((sum, stat) => sum + stat.walks, 0),
      strikeouts: player.hittingStats.reduce((sum, stat) => sum + stat.strikeouts, 0),
      avg: player.hittingStats.length ? player.hittingStats.reduce((sum, stat) => sum + (stat.hits / stat.atBats), 0) / player.hittingStats.length : 0,
      obp: player.hittingStats.length ? player.hittingStats.reduce((sum, stat) => sum + stat.obp, 0) / player.hittingStats.length : 0,
      slg: player.hittingStats.length ? player.hittingStats.reduce((sum, stat) => sum + stat.slg, 0) / player.hittingStats.length : 0,
      ops: player.hittingStats.length ? player.hittingStats.reduce((sum, stat) => sum + stat.ops, 0) / player.hittingStats.length : 0,
    }

    const careerPitching = {
      games: player.pitchingStats.reduce((sum, stat) => sum + stat.games, 0),
      inningsPitched: player.pitchingStats.reduce((sum, stat) => sum + stat.inningsPitched, 0),
      wins: player.pitchingStats.reduce((sum, stat) => sum + stat.wins, 0),
      losses: player.pitchingStats.reduce((sum, stat) => sum + stat.losses, 0),
      saves: player.pitchingStats.reduce((sum, stat) => sum + stat.saves, 0),
      strikeouts: player.pitchingStats.reduce((sum, stat) => sum + stat.strikeouts, 0),
      walks: player.pitchingStats.reduce((sum, stat) => sum + stat.walks, 0),
      hits: player.pitchingStats.reduce((sum, stat) => sum + stat.hits, 0),
      runs: player.pitchingStats.reduce((sum, stat) => sum + stat.runs, 0),
      earnedRuns: player.pitchingStats.reduce((sum, stat) => sum + stat.earnedRuns, 0),
      era: player.pitchingStats.length ? player.pitchingStats.reduce((sum, stat) => sum + stat.era, 0) / player.pitchingStats.length : 0,
      whip: player.pitchingStats.length ? player.pitchingStats.reduce((sum, stat) => sum + stat.whip, 0) / player.pitchingStats.length : 0,
    }

    return NextResponse.json({
      ...player,
      careerHitting,
      careerPitching
    })
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 })
  }
}
