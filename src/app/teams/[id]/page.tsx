"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

const DEFAULT_LOGO = "/images/teams/default-team-logo.png"

type Team = { id: string; name: string; logoUrl?: string; teamStats?: any[]; players?: any[] }

type TeamSeason = { year: number; wins: number; losses: number; winningPercentage: number; runsScored: number; runsAllowed: number; runDifferential: number }

type PlayerRow = any

export default function TeamPage() {
  const params = useParams() as { id: string }
  const [team, setTeam] = useState<Team | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [years, setYears] = useState<number[]>([])
  const [roster, setRoster] = useState<PlayerRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    setLoading(true)
    fetch(`/api/teams/${params.id}`)
      .then(r => r.json())
      .then((data) => {
        setTeam(data)
        const ys = (data.teamStats || []).map((s: TeamSeason) => s.year).sort((a: number, b: number) => b - a)
        setYears(ys)
        setYear(ys[0] || null)
        setLoading(false)
      })
  }, [params?.id])

  useEffect(() => {
    if (!year || !team?.players) return
    // Build roster with that year's player stats (hitting + pitching condensed)
    const rows: PlayerRow[] = []
    for (const pt of team.players) {
      const p = pt.player
      const hit = (p.hittingStats || []).find((s: any) => s.year === year)
      const pit = (p.pitchingStats || []).find((s: any) => s.year === year)
      if (hit || pit) rows.push({ player: p, hit, pit })
    }
    setRoster(rows)
  }, [year, team])

  const seasonSummary = useMemo(() => {
    if (!team || !year) return null
    const s = (team.teamStats || []).find((x: TeamSeason) => x.year === year)
    return s || null
  }, [team, year])

  if (loading || !team) return (
    <div className="container mx-auto px-4 py-8">Loading...</div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={team.logoUrl || DEFAULT_LOGO} alt={`${team.name} logo`} className="w-16 h-16 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO }} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
          <div className="text-gray-500">Team Page</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm">Season</label>
        <select value={year || ''} onChange={(e) => setYear(parseInt(e.target.value))} className="border rounded px-2 py-1 text-sm">
          {years.map(y => (<option key={y} value={String(y)}>{y}</option>))}
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

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Roster</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="text-left py-1 pr-4">Player</th>
                <th className="text-right py-1 pr-4">G (H)</th>
                <th className="text-right py-1 pr-4">OPS</th>
                <th className="text-right py-1 pr-4">G (P)</th>
                <th className="text-right py-1 pr-4">ERA</th>
                <th className="text-right py-1 pr-4">WHIP</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r, idx) => (
                <tr key={r.player.id} className={idx % 2 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="text-left py-1 pr-4 text-blue-700">{r.player.name}</td>
                  <td className="text-right py-1 pr-4">{r.hit?.games ?? '-'}</td>
                  <td className="text-right py-1 pr-4">{typeof r.hit?.ops === 'number' ? r.hit.ops.toFixed(3) : '-'}</td>
                  <td className="text-right py-1 pr-4">{r.pit?.games ?? '-'}</td>
                  <td className="text-right py-1 pr-4">{typeof r.pit?.era === 'number' ? r.pit.era.toFixed(2) : '-'}</td>
                  <td className="text-right py-1 pr-4">{typeof r.pit?.whip === 'number' ? r.pit.whip.toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
