'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TableSkeleton } from '@/components/Skeleton'
import ErrorState from '@/components/ErrorState'
import { resolveTeamByCode } from '@/config/teamCodeLogos'

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

// --- Award config ---

const AWARD_DISPLAY: Record<string, string> = {
  'All Star': 'All-Star',
  'Karl Koch Most Improved Batter': 'Most Improved Batter',
  'Dan Rish Most Improved Pitcher': 'Most Improved Pitcher',
  'IST Champ': 'IST Champion',
  'Commish': 'Commissioner',
}

const AWARD_PRIORITY: Record<string, number> = {
  'Hall of Fame': 0,
  'MVP': 1,
  'Cy Young': 2,
  'Silver Slugger': 3,
  'Platinum Palm': 4,
  'All Star': 5,
  'Rookie of the Year': 6,
  'Captain of the Year': 7,
  'Baserunner of the Year': 8,
  'Comeback Player': 9,
  'Heart and Hustle': 10,
  'Most Improved': 11,
  'Most Improved Batter': 12,
  'Most Improved Pitcher': 13,
  'Sportsman of the Year': 14,
  'Golden Palm': 15,
  'Defensive Play of Year': 16,
  'Iron Giant': 17,
  'IST Champ': 18,
  'League Honors': 19,
  'Commish': 99,
}

function getAwardDisplayName(raw: string): string {
  return AWARD_DISPLAY[raw] ?? raw
}

function getAwardPriority(raw: string): number {
  return AWARD_PRIORITY[raw] ?? 50
}

function TrophyIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 15.5a5.5 5.5 0 005.5-5.5V4h2a1 1 0 011 1v2a3 3 0 01-3 3h-.17A6.52 6.52 0 0112 15.5zm0 0a5.5 5.5 0 01-5.5-5.5V4h-2a1 1 0 00-1 1v2a3 3 0 003 3h.17A6.52 6.52 0 0012 15.5zM9 18h6v2H9v-2zm-1 3h8v1H8v-1zM7.5 4h9V10a4.5 4.5 0 11-9 0V4z" />
    </svg>
  )
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

const AWARD_ICONS: Record<string, typeof TrophyIcon> = {
  'MVP': TrophyIcon,
  'Hall of Fame': TrophyIcon,
  'Cy Young': StarIcon,
  'Silver Slugger': StarIcon,
  'All Star': StarIcon,
  'Platinum Palm': StarIcon,
  'Rookie of the Year': StarIcon,
  'Captain of the Year': TrophyIcon,
}

function AwardPill({ awardKey, years }: { awardKey: string; years: number[] }) {
  const displayName = getAwardDisplayName(awardKey)
  const Icon = AWARD_ICONS[awardKey]
  const yearsStr = years.join(', ')

  return (
    <span
      className="inline-flex items-center gap-1.5 bg-brand-navy/10 dark:bg-brand-gold/20 text-brand-navy dark:text-brand-gold px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
      title={`${displayName}: ${yearsStr}`}
    >
      {Icon && <Icon className="fill-brand-gold flex-shrink-0" />}
      <span>{displayName}</span>
      {years.length > 1 && (
        <span className="text-xs font-bold opacity-80">×{years.length}</span>
      )}
      <span className="text-xs opacity-70">({yearsStr})</span>
    </span>
  )
}

// --- Team cell ---

function TeamCell({ code }: { code: string }) {
  const { name, logoUrl } = resolveTeamByCode(code)
  return (
    <div className="flex items-center gap-2">
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={name ?? code}
          width={20}
          height={20}
          className="object-contain flex-shrink-0"
          unoptimized
        />
      )}
      <span>{code}</span>
    </div>
  )
}

// --- Sticky column widths ---
const YEAR_W = 72   // px — "2025" + px-4 padding
const TEAM_W = 130  // px — logo + abbreviation + px-4 padding

export default function PlayerDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [hitting, setHitting] = useState<HittingRow[]>([])
  const [pitching, setPitching] = useState<PitchingRow[]>([])
  const [playerName, setPlayerName] = useState('')
  const [awards, setAwards] = useState<Record<string, number[]>>({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchPlayer = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const [statsRes, awardsRes] = await Promise.all([
          fetch(`/api/players/${id}`),
          fetch(`/api/awards/${id}`),
        ])

        if (statsRes.status === 404) {
          setNotFound(true)
          return
        }
        if (!statsRes.ok) throw new Error('Failed to fetch player data')

        const statsResult = await statsRes.json()
        const h: HittingRow[] = statsResult.data.hitting || []
        const p: PitchingRow[] = statsResult.data.pitching || []
        setHitting(h.sort((a, b) => b.year - a.year))
        setPitching(p.sort((a, b) => b.year - a.year))
        setPlayerName(h[0]?.player?.name || p[0]?.player?.name || 'Unknown Player')
        setStale(statsResult.stale)

        if (awardsRes.ok) {
          const awardsResult = await awardsRes.json()
          setAwards(awardsResult.data || {})
        }
      } catch (err) {
        console.error('Error fetching player:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayer()
  }, [id, retryCount])

  const sortedAwards = Object.entries(awards).sort(
    ([a], [b]) => getAwardPriority(a) - getAwardPriority(b)
  )

  if (error) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message="Couldn't load player data." onRetry={() => { setError(false); setRetryCount(c => c + 1) }} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TableSkeleton rows={6} cols={5} />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/stats/players" className="text-brand-navy dark:text-brand-gold hover:text-brand-navy/80 dark:hover:text-brand-gold/80 text-sm mb-4 inline-block">&larr; Back to Players</Link>
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
        <Link href="/stats/players" className="text-brand-navy dark:text-brand-gold hover:text-brand-navy/80 dark:hover:text-brand-gold/80 text-sm mb-4 inline-block">&larr; Back to Players</Link>

        {stale && (
          <div className="bg-brand-gold/10 border border-brand-gold/30 text-content-primary px-4 py-2 rounded mb-4 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Data may be outdated — showing last known data while we reconnect.
          </div>
        )}

        {/* Player header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-surface-secondary rounded-full p-2 flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-content-secondary">
                <circle cx="24" cy="18" r="8" fill="currentColor" opacity="0.6" />
                <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="currentColor" opacity="0.4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-content-primary">{playerName}</h1>
          </div>

          {sortedAwards.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:justify-end sm:max-w-lg">
              {sortedAwards.map(([awardKey, years]) => (
                <AwardPill key={awardKey} awardKey={awardKey} years={years} />
              ))}
            </div>
          )}
        </div>

        {/* Hitting table */}
        {hitting.length > 0 && (
          <div className="bg-surface-card rounded-lg border border-border shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-content-primary">Career Hitting Stats</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="sticky top-0 z-30">
                  <tr className="bg-brand-navy">
                    {/* Sticky: Year */}
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky left-0 z-40 bg-brand-navy"
                      style={{ minWidth: YEAR_W }}
                    >
                      Year
                    </th>
                    {/* Sticky: Team */}
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky z-40 bg-brand-navy"
                      style={{ left: YEAR_W, minWidth: TEAM_W }}
                    >
                      Team
                    </th>
                    {['G', 'PA', 'AB', 'R', 'H', '2B', '3B', 'HR', 'RBI', 'BB', 'SO', 'AVG', 'OBP', 'SLG', 'OPS', 'wRC+'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {hitting.map((row, i) => {
                    const rowBg = i % 2 === 0 ? 'bg-surface-card' : 'bg-table-stripe'
                    return (
                      <tr key={row.year} className={`group ${rowBg} hover:bg-table-hover transition-colors`}>
                        {/* Sticky: Year */}
                        <td
                          className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-content-primary sticky left-0 z-20 ${rowBg} group-hover:bg-table-hover transition-colors`}
                          style={{ minWidth: YEAR_W }}
                        >
                          {row.year}
                        </td>
                        {/* Sticky: Team */}
                        <td
                          className={`px-4 py-3 whitespace-nowrap text-sm text-content-primary sticky z-20 ${rowBg} group-hover:bg-table-hover transition-colors`}
                          style={{ left: YEAR_W, minWidth: TEAM_W }}
                        >
                          <TeamCell code={row.team} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.games)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.plateAppearances)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.atBats)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.runs)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.hits)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.doubles)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.triples)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.homeRuns)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.rbis)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.walks)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.strikeouts)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.avg ?? 0).toFixed(3)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.obp ?? 0).toFixed(3)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.slg ?? 0).toFixed(3)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.ops ?? 0).toFixed(3)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.wrcPlus ?? 0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pitching table */}
        {pitching.length > 0 && (
          <div className="bg-surface-card rounded-lg border border-border shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-content-primary">Career Pitching Stats</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="sticky top-0 z-30">
                  <tr className="bg-brand-navy">
                    {/* Sticky: Year */}
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky left-0 z-40 bg-brand-navy"
                      style={{ minWidth: YEAR_W }}
                    >
                      Year
                    </th>
                    {/* Sticky: Team */}
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky z-40 bg-brand-navy"
                      style={{ left: YEAR_W, minWidth: TEAM_W }}
                    >
                      Team
                    </th>
                    {['G', 'IP', 'W', 'L', 'SV', 'K', 'BB', 'H', 'R', 'ER', 'ERA', 'WHIP', 'OPP AVG', 'K/9'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pitching.map((row, i) => {
                    const rowBg = i % 2 === 0 ? 'bg-surface-card' : 'bg-table-stripe'
                    return (
                      <tr key={row.year} className={`group ${rowBg} hover:bg-table-hover transition-colors`}>
                        {/* Sticky: Year */}
                        <td
                          className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-content-primary sticky left-0 z-20 ${rowBg} group-hover:bg-table-hover transition-colors`}
                          style={{ minWidth: YEAR_W }}
                        >
                          {row.year}
                        </td>
                        {/* Sticky: Team */}
                        <td
                          className={`px-4 py-3 whitespace-nowrap text-sm text-content-primary sticky z-20 ${rowBg} group-hover:bg-table-hover transition-colors`}
                          style={{ left: YEAR_W, minWidth: TEAM_W }}
                        >
                          <TeamCell code={row.team} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.games)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.inningsPitched ?? 0).toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.wins)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.losses)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.saves)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.strikeouts)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.walks)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.hits)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.runs)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{Math.round(row.earnedRuns)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.era ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.whip ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.oppAvg ?? 0).toFixed(3)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums">{(row.k9 ?? 0).toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
