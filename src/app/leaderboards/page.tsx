"use client"

import { useEffect, useState } from "react"
import PageNavigation from "@/components/PageNavigation"
import LeaderboardPodium from "@/components/LeaderboardPodium"

type Row = any

const HITTING_STATS = [
  { key: "avg", label: "AVG" },
  { key: "homeRuns", label: "HR" },
  { key: "rbis", label: "RBI" },
  { key: "wrcPlus", label: "wRC+" },
]

const PITCHING_STATS = [
  { key: "era", label: "ERA" },
  { key: "strikeouts", label: "K" },
  { key: "wins", label: "W" },
  { key: "whip", label: "WHIP" },
  { key: "inningsPitched", label: "IP" },
  { key: "k9", label: "K/9" },
  { key: "oppAvg", label: "OPP AVG" },
]

const FORMATTERS: Record<string, (v: number) => string> = {
  avg: v => v.toFixed(3),
  obp: v => v.toFixed(3),
  slg: v => v.toFixed(3),
  ops: v => v.toFixed(3),
  oppAvg: v => v.toFixed(3),
  era: v => v.toFixed(2),
  whip: v => v.toFixed(2),
  k9: v => v.toFixed(2),
  inningsPitched: v => v.toFixed(1),
  wrcPlus: v => v.toFixed(0),
}

function formatStat(key: string, value: unknown): string {
  if (typeof value !== 'number') return String(value ?? '')
  const formatter = FORMATTERS[key]
  return formatter ? formatter(value) : String(value)
}

function mapToPlayers(rows: Row[], statKey: string) {
  return rows.map((r: Row, idx: number) => ({
    rank: idx + 1,
    name: r.player?.name || '',
    playerId: r.playerId || '',
    value: formatStat(statKey, r[statKey]),
    team: r.team,
  }))
}

export default function LeaderboardsPage() {
  const [year, setYear] = useState<string>('')
  const [years, setYears] = useState<number[]>([])
  const [hitData, setHitData] = useState<Record<string, Row[]>>({})
  const [pitData, setPitData] = useState<Record<string, Row[]>>({})
  const [loading, setLoading] = useState(true)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    fetch('/api/stats?category=hitting&limit=50000')
      .then(r => r.json())
      .then(result => {
        const { data, stale: isStale } = result
        setStale((prev) => prev || isStale)
        const ys = Array.from(new Set((data as any[]).map((s: any) => s.year).filter(Boolean))).sort((a: number, b: number) => b - a)
        setYears(ys)
        if (ys.length > 0) setYear(String(ys[0]))
        else setYear('all')
      })
  }, [])

  useEffect(() => {
    if (!year) return
    setLoading(true)
    const fetchStat = async (category: 'hitting' | 'pitching', statKey: string) => {
      const params = new URLSearchParams()
      params.append('category', category)
      params.append('year', year)
      params.append('stat', statKey)
      params.append('limit', '10')
      if (year === 'all') params.append('minSeasons', '3')
      const res = await fetch(`/api/leaderboards?${params}`)
      const result = await res.json()
      const { data, stale: isStale } = result
      setStale((prev) => prev || isStale)
      return data
    }

    Promise.all([
      ...HITTING_STATS.map(s => fetchStat('hitting', s.key)),
      ...PITCHING_STATS.map(s => fetchStat('pitching', s.key)),
    ]).then(values => {
      const h: Record<string, Row[]> = {}
      const p: Record<string, Row[]> = {}
      HITTING_STATS.forEach((s, i) => h[s.key] = values[i] || [])
      PITCHING_STATS.forEach((s, j) => p[s.key] = values[HITTING_STATS.length + j] || [])
      setHitData(h)
      setPitData(p)
      setLoading(false)
    })
  }, [year])

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboards</h1>

        {stale && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mb-4 text-sm">
            Data may be outdated — showing last known data while we reconnect.
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm">Season</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="all">All-Time (min 3 seasons)</option>
            {years.map(y => (<option key={y} value={String(y)}>{y}</option>))}
          </select>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hitting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {HITTING_STATS.map(s => (
                <div key={s.key} className="bg-white rounded-lg shadow p-4 md:p-6">
                  <LeaderboardPodium
                    title={s.label}
                    players={mapToPlayers(hitData[s.key] || [], s.key)}
                  />
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pitching</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PITCHING_STATS.map(s => (
                <div key={s.key} className="bg-white rounded-lg shadow p-4 md:p-6">
                  <LeaderboardPodium
                    title={s.label}
                    players={mapToPlayers(pitData[s.key] || [], s.key)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
