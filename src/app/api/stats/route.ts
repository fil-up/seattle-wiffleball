import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const category = searchParams.get('category') // 'hitting' or 'pitching'
  const stat = searchParams.get('stat') // specific stat to sort by
  const qualified = searchParams.get('qualified') === 'true'
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    if (category === 'hitting') {
      const stats = await prisma.playerHittingStats.findMany({
        where: {
          ...(year ? { year: parseInt(year) } : {}),
          ...(qualified ? { isQualified: true } : {}),
        },
        include: { 
          player: { include: { teams: { include: { team: true } } } },
        },
      })

      const sortKey = (stat || 'avg') as keyof typeof stats[number]
      stats.sort((a: any, b: any) => {
        const aVal = typeof a[sortKey] === 'number' ? a[sortKey] : 0
        const bVal = typeof b[sortKey] === 'number' ? b[sortKey] : 0
        return (bVal as number) - (aVal as number)
      })

      return NextResponse.json(stats.slice(0, limit))
    }

    if (category === 'pitching') {
      const stats = await prisma.playerPitchingStats.findMany({
        where: {
          ...(year ? { year: parseInt(year) } : {}),
          ...(qualified ? { isQualified: true } : {}),
        },
        include: { 
          player: { include: { teams: { include: { team: true } } } },
        },
      })

      const sortField = (stat || 'era') as keyof typeof stats[number]
      const asc = sortField === 'era' || sortField === 'whip'
      stats.sort((a: any, b: any) => {
        const aVal = typeof a[sortField] === 'number' ? a[sortField] : Number.MAX_SAFE_INTEGER
        const bVal = typeof b[sortField] === 'number' ? b[sortField] : Number.MAX_SAFE_INTEGER
        return asc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
      })

      return NextResponse.json(stats.slice(0, limit))
    }

    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
