"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

const DEFAULT_LOGO = "/images/teams/default-team-logo.png"

type TeamInfo = {
  id: string
  name: string
  abbreviation: string
  uniqueTeamName: string
  teamCode: string
  logoUrl: string
}

type StandingsRecord = {
  team: string
  year: string
  wins: number
  losses: number
  pct: number
  rf: number
  ra: number
}

type HittingPlayer = {
  playerId: string
  player: { id: string; name: string }
  year: number
  team: string
  games: number
  plateAppearances: number
  atBats: number
  hits: number
  homeRuns: number
  rbis: number
  avg: number
  obp: number
  slg: number
  ops: number
  wrcPlus: number
}

type PitchingPlayer = {
  playerId: string
  player: { id: string; name: string }
  year: number
  team: string
  games: number
  inningsPitched: number
  wins: number
  losses: number
  strikeouts: number
  walks: number
  hits: number
  earnedRuns: number
  era: number
  whip: number
}

type RosterPlayer = {
  playerId: string
  name: string
  role: "Hitter" | "Pitcher" | "Both"
  statLine: string
}

export default function TeamPage() {
  const params = useParams() as { id: string }
  const [team, setTeam] = useState<TeamInfo | null>(null)
  const [standings, setStandings] = useState<StandingsRecord[]>([])
  const [year, setYear] = useState<string | null>(null)
  const [years, setYears] = useState<string[]>([])
  const [hitters, setHitters] = useState<HittingPlayer[]>([])
  const [pitchers, setPitchers] = useState<PitchingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    if (!params?.id) return
    setLoading(true)
    fetch(`/api/teams/${params.id}`)
      .then(r => r.json())
      .then((result) => {
        const { data, stale: isStale } = result
        setStale(isStale)
        setTeam(data.team)
        setStandings(data.standings || [])

        const ys = (data.standings || []).map((s: StandingsRecord) => s.year).sort((a: string, b: string) => parseInt(b) - parseInt(a))
        const uniqueYears = [...new Set(ys)] as string[]
        setYears(uniqueYears)
        setYear(uniqueYears[0] || null)
        setLoading(false)
      })
  }, [params?.id])

  useEffect(() => {
    if (!year || !team) return
    setStatsLoading(true)
    Promise.all([
      fetch(`/api/stats?category=hitting&year=${year}&qualified=false`).then(r => r.json()),
      fetch(`/api/stats?category=pitching&year=${year}&qualified=false`).then(r => r.json()),
    ]).then(([hittingResult, pitchingResult]) => {
      const teamNames = [team.name, team.uniqueTeamName].map(n => n.toLowerCase())
      const teamHitters = (hittingResult.data as HittingPlayer[]).filter(
        p => teamNames.includes(p.team.toLowerCase())
      )
      const teamPitchers = (pitchingResult.data as PitchingPlayer[]).filter(
        p => teamNames.includes(p.team.toLowerCase())
      )
      setHitters(teamHitters)
      setPitchers(teamPitchers)
      setStale(prev => prev || hittingResult.stale || pitchingResult.stale)
      setStatsLoading(false)
    })
  }, [year, team])

  const seasonSummary = useMemo(() => {
    if (!year || standings.length === 0) return null
    const s = standings.find((x) => x.year === year)
    if (!s) return null
    return {
      wins: s.wins,
      losses: s.losses,
      winningPercentage: s.pct,
      runsScored: s.rf,
      runsAllowed: s.ra,
      runDifferential: s.rf - s.ra,
    }
  }, [standings, year])

  const roster = useMemo((): RosterPlayer[] => {
    const playerMap = new Map<string, RosterPlayer>()

    for (const h of hitters) {
      playerMap.set(h.playerId, {
        playerId: h.playerId,
        name: h.player.name,
        role: "Hitter",
        statLine: `${h.avg.toFixed(3)} AVG, ${h.homeRuns} HR`,
      })
    }

    for (const p of pitchers) {
      const existing = playerMap.get(p.playerId)
      if (existing) {
        existing.role = "Both"
        existing.statLine += ` | ${p.era.toFixed(2)} ERA, ${p.strikeouts} K`
      } else {
        playerMap.set(p.playerId, {
          playerId: p.playerId,
          name: p.player.name,
          role: "Pitcher",
          statLine: `${p.era.toFixed(2)} ERA, ${p.strikeouts} K`,
        })
      }
    }

    return Array.from(playerMap.values())
  }, [hitters, pitchers])

  const teamBatting = useMemo(() => {
    if (hitters.length === 0) return null
    const totalAB = hitters.reduce((s, h) => s + h.atBats, 0)
    const totalH = hitters.reduce((s, h) => s + h.hits, 0)
    const totalHR = hitters.reduce((s, h) => s + h.homeRuns, 0)
    const totalRBI = hitters.reduce((s, h) => s + h.rbis, 0)
    const maxGames = Math.max(...hitters.map(h => h.games))
    const avgOPS = hitters.reduce((s, h) => s + h.ops, 0) / hitters.length
    const qualifiedHitters = hitters.filter(h => h.wrcPlus > 0)
    const avgWRC = qualifiedHitters.length > 0
      ? qualifiedHitters.reduce((s, h) => s + h.wrcPlus, 0) / qualifiedHitters.length
      : 0
    return {
      games: maxGames,
      avg: totalAB > 0 ? totalH / totalAB : 0,
      hr: totalHR,
      rbi: totalRBI,
      ops: avgOPS,
      wrcPlus: avgWRC,
    }
  }, [hitters])

  const teamPitching = useMemo(() => {
    if (pitchers.length === 0) return null
    const totalIP = pitchers.reduce((s, p) => s + p.inningsPitched, 0)
    const totalER = pitchers.reduce((s, p) => s + p.earnedRuns, 0)
    const totalH = pitchers.reduce((s, p) => s + p.hits, 0)
    const totalBB = pitchers.reduce((s, p) => s + p.walks, 0)
    const totalK = pitchers.reduce((s, p) => s + p.strikeouts, 0)
    const totalW = pitchers.reduce((s, p) => s + p.wins, 0)
    const totalL = pitchers.reduce((s, p) => s + p.losses, 0)
    return {
      era: totalIP > 0 ? (totalER / totalIP) * 9 : 0,
      whip: totalIP > 0 ? (totalH + totalBB) / totalIP : 0,
      k: totalK,
      record: `${totalW}-${totalL}`,
    }
  }, [pitchers])

  const sortedHitters = useMemo(
    () => [...hitters].sort((a, b) => b.plateAppearances - a.plateAppearances),
    [hitters]
  )

  const sortedPitchers = useMemo(
    () => [...pitchers].sort((a, b) => b.inningsPitched - a.inningsPitched),
    [pitchers]
  )

  if (loading || !team) return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="container mx-auto px-4 py-8 text-content-secondary">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-secondary">

      <div className="container mx-auto px-4 py-8">
        {stale && (
          <div className="bg-brand-gold/10 border border-brand-gold/30 text-content-primary px-4 py-2 rounded mb-4 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Data may be outdated — showing last known data while we reconnect.
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={team.logoUrl || DEFAULT_LOGO} alt={`${team.name} logo`} className="w-16 h-16 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO }} />
          <div>
            <h1 className="text-3xl font-bold text-content-primary">{team.name}</h1>
            <div className="text-content-secondary">{team.abbreviation}</div>
          </div>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-content-secondary">Season</label>
          <select value={year || ''} onChange={(e) => setYear(e.target.value)} className="border border-border rounded px-2 py-1 text-sm bg-surface-card text-content-primary">
            {years.map(y => (<option key={y} value={y}>{y}</option>))}
          </select>
        </div>

        {/* Season Summary */}
        {seasonSummary && (
          <div className="bg-surface-card rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-semibold text-content-primary mb-3">Season Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Record" value={`${seasonSummary.wins}-${seasonSummary.losses}`} />
              <StatCard label="Win %" value={(seasonSummary.winningPercentage || 0).toFixed(3)} />
              <StatCard label="Runs Scored" value={seasonSummary.runsScored} />
              <StatCard label="Runs Allowed" value={seasonSummary.runsAllowed} />
              <StatCard label="Run Diff" value={seasonSummary.runDifferential} />
            </div>
          </div>
        )}

        {statsLoading ? (
          <div className="py-8 text-center text-content-secondary">Loading roster and stats...</div>
        ) : (
          <>
            {/* Roster */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-content-primary mb-4">Roster</h2>
              {roster.length === 0 ? (
                <div className="text-content-secondary text-sm">No roster data available for this season.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {roster.map((p) => (
                    <Link key={p.playerId} href={`/stats/players/${p.playerId}`}>
                      <div className="bg-surface-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow">
                        <div className="font-medium text-content-primary">{p.name}</div>
                        <div className="text-xs text-brand-navy font-medium mt-1">{p.role}</div>
                        <div className="text-sm text-content-secondary mt-2">{p.statLine}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Team Stats */}
            {(teamBatting || teamPitching) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-content-primary mb-4">Team Stats</h2>

                {/* Team Batting */}
                {teamBatting && (
                  <div className="bg-surface-card rounded-lg shadow p-4 mb-6">
                    <h3 className="text-lg font-semibold text-content-primary mb-3">Team Batting</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                      <StatCard label="G" value={teamBatting.games} />
                      <StatCard label="AVG" value={teamBatting.avg.toFixed(3)} />
                      <StatCard label="HR" value={teamBatting.hr} />
                      <StatCard label="RBI" value={teamBatting.rbi} />
                      <StatCard label="OPS" value={teamBatting.ops.toFixed(3)} />
                      <StatCard label="wRC+" value={Math.round(teamBatting.wrcPlus)} />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-content-secondary">
                            <th className="py-2 pr-4">Player</th>
                            <th className="py-2 px-2 text-right">G</th>
                            <th className="py-2 px-2 text-right">AVG</th>
                            <th className="py-2 px-2 text-right">HR</th>
                            <th className="py-2 px-2 text-right">RBI</th>
                            <th className="py-2 px-2 text-right">OPS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedHitters.map((h) => (
                            <tr key={h.playerId} className="border-b border-border last:border-0">
                              <td className="py-2 pr-4">
                                <Link href={`/stats/players/${h.playerId}`} className="text-brand-navy hover:underline">
                                  {h.player.name}
                                </Link>
                              </td>
                              <td className="py-2 px-2 text-right">{h.games}</td>
                              <td className="py-2 px-2 text-right">{h.avg.toFixed(3)}</td>
                              <td className="py-2 px-2 text-right">{h.homeRuns}</td>
                              <td className="py-2 px-2 text-right">{h.rbis}</td>
                              <td className="py-2 px-2 text-right">{h.ops.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Team Pitching */}
                {teamPitching && (
                  <div className="bg-surface-card rounded-lg shadow p-4 mb-6">
                    <h3 className="text-lg font-semibold text-content-primary mb-3">Team Pitching</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                      <StatCard label="ERA" value={teamPitching.era.toFixed(2)} />
                      <StatCard label="WHIP" value={teamPitching.whip.toFixed(2)} />
                      <StatCard label="K" value={teamPitching.k} />
                      <StatCard label="W-L" value={teamPitching.record} />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-content-secondary">
                            <th className="py-2 pr-4">Player</th>
                            <th className="py-2 px-2 text-right">G</th>
                            <th className="py-2 px-2 text-right">IP</th>
                            <th className="py-2 px-2 text-right">ERA</th>
                            <th className="py-2 px-2 text-right">K</th>
                            <th className="py-2 px-2 text-right">W-L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedPitchers.map((p) => (
                            <tr key={p.playerId} className="border-b border-border last:border-0">
                              <td className="py-2 pr-4">
                                <Link href={`/stats/players/${p.playerId}`} className="text-brand-navy hover:underline">
                                  {p.player.name}
                                </Link>
                              </td>
                              <td className="py-2 px-2 text-right">{p.games}</td>
                              <td className="py-2 px-2 text-right">{p.inningsPitched.toFixed(1)}</td>
                              <td className="py-2 px-2 text-right">{p.era.toFixed(2)}</td>
                              <td className="py-2 px-2 text-right">{p.strikeouts}</td>
                              <td className="py-2 px-2 text-right">{p.wins}-{p.losses}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-content-secondary">{label}</div>
      <div className="text-lg font-semibold text-content-primary">{value}</div>
    </div>
  )
}
