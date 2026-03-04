"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

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

export default function TeamPage() {
  const params = useParams() as { id: string }
  const [team, setTeam] = useState<TeamInfo | null>(null)
  const [standings, setStandings] = useState<StandingsRecord[]>([])
  const [year, setYear] = useState<string | null>(null)
  const [years, setYears] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
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

  if (loading || !team) return (
    <div className="container mx-auto px-4 py-8">Loading...</div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {stale && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mb-4 text-sm">
          Data may be outdated — showing last known data while we reconnect.
        </div>
      )}
      <div className="flex items-center gap-4 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={team.logoUrl || DEFAULT_LOGO} alt={`${team.name} logo`} className="w-16 h-16 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO }} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
          <div className="text-gray-500">{team.abbreviation}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm">Season</label>
        <select value={year || ''} onChange={(e) => setYear(e.target.value)} className="border rounded px-2 py-1 text-sm">
          {years.map(y => (<option key={y} value={y}>{y}</option>))}
        </select>
      </div>

      {seasonSummary && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Season Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div><div className="text-xs text-gray-500">Record</div><div className="text-lg font-semibold">{seasonSummary.wins}-{seasonSummary.losses}</div></div>
            <div><div className="text-xs text-gray-500">Win %</div><div className="text-lg font-semibold">{(seasonSummary.winningPercentage || 0).toFixed(3)}</div></div>
            <div><div className="text-xs text-gray-500">Runs Scored</div><div className="text-lg font-semibold">{seasonSummary.runsScored}</div></div>
            <div><div className="text-xs text-gray-500">Runs Allowed</div><div className="text-lg font-semibold">{seasonSummary.runsAllowed}</div></div>
            <div><div className="text-xs text-gray-500">Run Diff</div><div className="text-lg font-semibold">{seasonSummary.runDifferential}</div></div>
          </div>
        </div>
      )}
    </div>
  )
}
