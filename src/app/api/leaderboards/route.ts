import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calcHittingRates(acc: any) {
  const ab = acc.atBats || 0
  const hits = acc.hits || 0
  const obpDen = (acc.atBats || 0) + (acc.walks || 0)
  acc.avg = ab ? hits / ab : 0
  acc.obp = obpDen ? (hits + (acc.walks || 0)) / obpDen : 0
  acc.slg = ab ? ((acc.doubles || 0) + 2 * (acc.triples || 0) + 3 * (acc.homeRuns || 0) + (hits - (acc.doubles || 0) - (acc.triples || 0) - (acc.homeRuns || 0))) / ab : 0
  acc.ops = (acc.obp || 0) + (acc.slg || 0)
  return acc
}

function calcPitchingRates(acc: any) {
  const ip = acc.inningsPitched || 0
  acc.era = ip ? (acc.earnedRuns || 0) * 9 / ip : 0
  acc.whip = ip ? ((acc.walks || 0) + (acc.hits || 0)) / ip : 0
  return acc
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'hitting'
  const yearParam = searchParams.get('year')
  const stat = searchParams.get('stat') || (category === 'hitting' ? 'ops' : 'era')
  const limit = parseInt(searchParams.get('limit') || '10')
  const minSeasons = parseInt(searchParams.get('minSeasons') || '3')

  try {
    if (category === 'hitting') {
      if (yearParam && yearParam !== 'all') {
        const year = parseInt(yearParam)
        const rows = await prisma.playerHittingStats.findMany({
          where: { year, isQualified: true },
          include: { player: true },
        })
        rows.sort((a: any, b: any) => {
          const aVal = (a as any)[stat] ?? 0
          const bVal = (b as any)[stat] ?? 0
          return bVal - aVal
        })
        return NextResponse.json(rows.slice(0, limit))
      } else {
        const rows = await prisma.playerHittingStats.findMany({
          where: { isQualified: true },
          include: { player: true },
        })
        const byPlayer = new Map<string, any>()
        const seasonsByPlayer = new Map<string, Set<number>>()
        const paByPlayer: Record<string, number> = {}
        const wrcPaSum: Record<string, number> = {}
        for (const r of rows) {
          const key = r.playerId
          seasonsByPlayer.set(key, (seasonsByPlayer.get(key) || new Set<number>()).add(r.year))
          const acc = byPlayer.get(key) || { ...r, player: r.player }
          for (const k of Object.keys(r)) {
            const v = (r as any)[k]
            if (typeof v === 'number') (acc as any)[k] = ((acc as any)[k] || 0) + v
          }
          byPlayer.set(key, acc)
          const pa = (r as any).plateAppearances || 0
          paByPlayer[key] = (paByPlayer[key] || 0) + pa
          if (typeof (r as any).wrcPlus === 'number') {
            wrcPaSum[key] = (wrcPaSum[key] || 0) + ((r as any).wrcPlus * pa)
          }
        }
        let totals = Array.from(byPlayer.values()).map(calcHittingRates)
        // PA-weighted wRC+
        totals = totals.map((p: any) => {
          const pa = paByPlayer[p.playerId] || 0
          if (pa > 0 && wrcPaSum[p.playerId] !== undefined) {
            p.wrcPlus = wrcPaSum[p.playerId] / pa
          }
          return p
        })
        totals = totals.filter((p) => (seasonsByPlayer.get(p.playerId)?.size || 0) >= minSeasons)
        totals.sort((a: any, b: any) => {
          const aVal = a[stat] ?? 0
          const bVal = b[stat] ?? 0
          return bVal - aVal
        })
        return NextResponse.json(totals.slice(0, limit))
      }
    }

    if (category === 'pitching') {
      if (yearParam && yearParam !== 'all') {
        const year = parseInt(yearParam)
        const rows = await prisma.playerPitchingStats.findMany({
          where: { year, isQualified: true },
          include: { player: true },
        })
        rows.sort((a: any, b: any) => {
          const asc = stat === 'era' || stat === 'whip'
          const aVal = (a as any)[stat] ?? 0
          const bVal = (b as any)[stat] ?? 0
          return asc ? aVal - bVal : bVal - aVal
        })
        return NextResponse.json(rows.slice(0, limit))
      } else {
        const rows = await prisma.playerPitchingStats.findMany({
          where: { isQualified: true },
          include: { player: true },
        })
        const byPlayer = new Map<string, any>()
        const seasonsByPlayer = new Map<string, Set<number>>()
        for (const r of rows) {
          const key = r.playerId
          seasonsByPlayer.set(key, (seasonsByPlayer.get(key) || new Set<number>()).add(r.year))
          const acc = byPlayer.get(key) || { ...r, player: r.player }
          for (const k of Object.keys(r)) {
            const v = (r as any)[k]
            if (typeof v === 'number') (acc as any)[k] = ((acc as any)[k] || 0) + v
          }
          byPlayer.set(key, acc)
        }
        let totals = Array.from(byPlayer.values()).map(calcPitchingRates)
        totals = totals.filter((p) => (seasonsByPlayer.get(p.playerId)?.size || 0) >= minSeasons)
        totals.sort((a: any, b: any) => {
          const asc = stat === 'era' || stat === 'whip'
          const aVal = a[stat] ?? 0
          const bVal = b[stat] ?? 0
          return asc ? aVal - bVal : bVal - aVal
        })
        return NextResponse.json(totals.slice(0, limit))
      }
    }

    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  } catch (error) {
    console.error('Error building leaderboards:', error)
    return NextResponse.json({ error: 'Failed to build leaderboards' }, { status: 500 })
  }
}
