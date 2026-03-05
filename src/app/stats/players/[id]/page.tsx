'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface HittingRow {
  year: number
  team: string
  games: number
  plateAppearances: number
  atBats: number
  runs: number
  hits: number
  doubles: number
  triples: number
  homeRuns: number
  rbis: number
  walks: number
  strikeouts: number
  avg: number
  obp: number
  slg: number
  ops: number
  wrcPlus: number
  player: { id: string; name: string }
}

interface PitchingRow {
  year: number
  team: string
  games: number
  inningsPitched: number
  wins: number
  losses: number
  saves: number
  strikeouts: number
  walks: number
  hits: number
  runs: number
  earnedRuns: number
  era: number
  whip: number
  k9: number
  oppAvg: number
  player: { id: string; name: string }
}

export default function PlayerDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [hitting, setHitting] = useState<HittingRow[]>([])
  const [pitching, setPitching] = useState<PitchingRow[]>([])
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchPlayer = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await fetch(`/api/players/${id}`)
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        if (!res.ok) throw new Error('Failed to fetch player data')
        const result = await res.json()
        const h: HittingRow[] = result.data.hitting || []
        const p: PitchingRow[] = result.data.pitching || []
        setHitting(h.sort((a, b) => b.year - a.year))
        setPitching(p.sort((a, b) => b.year - a.year))
        setPlayerName(h[0]?.player?.name || p[0]?.player?.name || 'Unknown Player')
        setStale(result.stale)
      } catch (err) {
        console.error('Error fetching player:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayer()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="text-center py-8 text-content-secondary">Loading...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/stats/players" className="text-brand-navy hover:text-brand-navy/80 text-sm mb-4 inline-block">&larr; Back to Players</Link>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-content-primary mb-2">Player Not Found</h1>
            <p className="text-content-secondary">No player exists with this ID.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/stats/players" className="text-brand-navy hover:text-brand-navy/80 text-sm mb-4 inline-block">&larr; Back to Players</Link>

        {stale && (
          <div className="bg-brand-gold/10 border border-brand-gold/30 text-content-primary px-4 py-2 rounded mb-4 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Data may be outdated — showing last known data while we reconnect.
          </div>
        )}

        <h1 className="text-3xl font-bold text-content-primary mb-8">{playerName}</h1>

        {hitting.length > 0 && (
          <div className="bg-surface-card rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-content-primary">Career Hitting Stats</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-secondary">
                  <tr>
                    {['Year', 'Team', 'G', 'PA', 'AB', 'R', 'H', '2B', '3B', 'HR', 'RBI', 'BB', 'SO', 'AVG', 'OBP', 'SLG', 'OPS', 'wRC+'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-surface-card divide-y divide-border">
                  {hitting.map((row, i) => (
                    <tr key={row.year} className={i % 2 === 0 ? '' : 'bg-table-stripe'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-content-primary">{row.year}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.team}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.games}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.plateAppearances}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.atBats}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.runs}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.hits}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.doubles}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.triples}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.homeRuns}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.rbis}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.walks}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.strikeouts}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.avg ?? 0).toFixed(3)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.obp ?? 0).toFixed(3)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.slg ?? 0).toFixed(3)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.ops ?? 0).toFixed(3)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.wrcPlus ?? 0).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pitching.length > 0 && (
          <div className="bg-surface-card rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-content-primary">Career Pitching Stats</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-secondary">
                  <tr>
                    {['Year', 'Team', 'G', 'IP', 'W', 'L', 'SV', 'K', 'BB', 'H', 'R', 'ER', 'ERA', 'WHIP', 'OPP AVG', 'K/9'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-surface-card divide-y divide-border">
                  {pitching.map((row, i) => (
                    <tr key={row.year} className={i % 2 === 0 ? '' : 'bg-table-stripe'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-content-primary">{row.year}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.team}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.games}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.inningsPitched ?? 0).toFixed(1)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.wins}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.losses}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.saves}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.strikeouts}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.walks}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.hits}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.runs}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{row.earnedRuns}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.era ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.whip ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.oppAvg ?? 0).toFixed(3)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary">{(row.k9 ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
