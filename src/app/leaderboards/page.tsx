"use client"

import { useEffect, useState } from "react"

type Row = any

const HITTING_STATS = [
  { key: "ops", label: "OPS" },
  { key: "wrcPlus", label: "wRC+" },
  { key: "avg", label: "AVG" },
  { key: "obp", label: "OBP" },
  { key: "slg", label: "SLG" },
  { key: "homeRuns", label: "HR" },
  { key: "rbis", label: "RBI" },
]

const PITCHING_STATS = [
  { key: "era", label: "ERA" },
  { key: "whip", label: "WHIP" },
  { key: "strikeouts", label: "K" },
]

function SmallTable({ title, rows, statKey, category }: { title: string; rows: Row[]; statKey: string; category: 'hitting' | 'pitching' }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 min-w-[320px]">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500">Top 10</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="text-left py-1 pr-4">#</th>
              <th className="text-left py-1 pr-4">Player</th>
              {category === 'hitting' ? (
                <>
                  <th className="text-right py-1 pr-4">G</th>
                  <th className="text-right py-1 pr-4">PA</th>
                  <th className="text-right py-1 pr-4">{title}</th>
                </>
              ) : (
                <>
                  <th className="text-right py-1 pr-4">G</th>
                  <th className="text-right py-1 pr-4">IP</th>
                  <th className="text-right py-1 pr-4">{title}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id || r.playerId || idx} className={idx % 2 ? 'bg-gray-50' : 'bg-white'}>
                <td className="text-left py-1 pr-4 text-sm text-gray-700">{idx + 1}</td>
                <td className="text-left py-1 pr-4 text-sm text-blue-700">{r.player?.name || ''}</td>
                {category === 'hitting' ? (
                  <>
                    <td className="text-right py-1 pr-4 text-sm text-gray-700">{r.games ?? ''}</td>
                    <td className="text-right py-1 pr-4 text-sm text-gray-700">{r.plateAppearances ?? ''}</td>
                    <td className="text-right py-1 pr-4 text-sm font-semibold">{typeof r[statKey] === 'number' ? (['avg','obp','slg','ops'].includes(statKey) ? (r[statKey] ?? 0).toFixed(3) : (statKey === 'wrcPlus' ? (r[statKey] ?? 0).toFixed(0) : r[statKey])) : r[statKey]}</td>
                  </>
                ) : (
                  <>
                    <td className="text-right py-1 pr-4 text-sm text-gray-700">{r.games ?? ''}</td>
                    <td className="text-right py-1 pr-4 text-sm text-gray-700">{typeof r.inningsPitched === 'number' ? r.inningsPitched.toFixed(1) : r.inningsPitched ?? ''}</td>
                    <td className="text-right py-1 pr-4 text-sm font-semibold">{typeof r[statKey] === 'number' ? ((statKey === 'era' || statKey === 'whip') ? (r[statKey] ?? 0).toFixed(2) : r[statKey]) : r[statKey]}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function LeaderboardsPage() {
  const [year, setYear] = useState<string>('all')
  const [years, setYears] = useState<number[]>([])
  const [hitData, setHitData] = useState<Record<string, Row[]>>({})
  const [pitData, setPitData] = useState<Record<string, Row[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats?category=hitting&limit=50000')
      .then(r => r.json())
      .then(data => {
        const ys = Array.from(new Set((data as any[]).map((s: any) => s.year).filter(Boolean))).sort((a, b) => b - a)
        setYears(ys)
      })
  }, [])

  useEffect(() => {
    setLoading(true)
    const fetchStat = async (category: 'hitting' | 'pitching', statKey: string) => {
      const params = new URLSearchParams()
      params.append('category', category)
      params.append('year', year)
      params.append('stat', statKey)
      params.append('limit', '10')
      if (year === 'all') params.append('minSeasons', '3')
      const res = await fetch(`/api/leaderboards?${params}`)
      return res.json()
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboards</h1>

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
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Hitting</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 mb-8">
            {HITTING_STATS.map(s => (
              <SmallTable key={s.key} title={s.label} rows={hitData[s.key] || []} statKey={s.key} category="hitting" />
            ))}
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-3">Pitching</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {PITCHING_STATS.map(s => (
              <SmallTable key={s.key} title={s.label} rows={pitData[s.key] || []} statKey={s.key} category="pitching" />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
