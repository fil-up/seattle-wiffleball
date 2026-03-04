"use client"

import { useState, useEffect, useMemo } from "react"
import StatsTable from "@/components/StatsTable"
import StatsFilter from "@/components/StatsFilter"
import PageNavigation from "@/components/PageNavigation"

interface HittingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  year?: number
  seasons?: number
  games: number
  plateAppearances?: number
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
  opsPlus?: number
  wrcPlus?: number
  team?: string
  teamLogo?: string
}

interface PitchingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  year?: number
  seasons?: number
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
  oppAvg?: number
  team?: string
  teamLogo?: string
}

export default function PlayersStats() {
  const [tab, setTab] = useState<"hitting" | "pitching">("hitting")
  const [scope, setScope] = useState<"yearly" | "totals">("yearly")
  const [stats, setStats] = useState<any[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [qualified, setQualified] = useState(true)
  const [loading, setLoading] = useState(true)
  const [stale, setStale] = useState(false)
  const [totalsPaQual, setTotalsPaQual] = useState(100)
  const [totalsIpQual, setTotalsIpQual] = useState(75)
  const [search, setSearch] = useState('')

  const fetchData = async (category: 'hitting' | 'pitching', isYearly: boolean) => {
    try {
      setLoading(true)

      const scopeParam = isYearly ? 'yearly' : 'totals'
      const response = await fetch(`/api/players?type=${category}&scope=${scopeParam}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const result = await response.json()
      const { data, stale: isStale } = result
      setStale(isStale)

      let processed: any[] = data || []

      if (isYearly && selectedYear) {
        processed = processed.filter((row: any) => row.year === selectedYear)
      }

      if (qualified && isYearly) {
        if (category === 'hitting') {
          processed = processed.filter((row: any) => row.wrcPlus && row.wrcPlus > 0)
        } else {
          processed = processed.filter((row: any) => row.era && row.era > 0)
        }
      }

      if (!isYearly) {
        if (category === 'hitting') {
          processed = processed.filter((row: any) => (row.plateAppearances || 0) >= totalsPaQual)
        } else {
          processed = processed.filter((row: any) => (row.inningsPitched || 0) >= totalsIpQual)
        }
      }

      setStats(processed)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === "hitting") {
      fetchData('hitting', true)
    } else {
      fetchData('pitching', true)
    }
  }, [tab])

  useEffect(() => {
    const isYearly = scope === "yearly"
    fetchData(tab, isYearly)
  }, [tab, scope, selectedYear, qualified, totalsPaQual, totalsIpQual])

  useEffect(() => {
    if (scope === "yearly" && stats.length > 0) {
      const uniqueYears = Array.from(new Set(stats.map(s => s.year).filter(Boolean))).sort((a, b) => b - a)
      setYears(uniqueYears)
      if (uniqueYears.length > 0 && !selectedYear) {
        setSelectedYear(uniqueYears[0])
      }
    }
  }, [stats, scope, selectedYear])

  const visibleStats = useMemo(() => {
    if (!search.trim()) return stats
    const q = search.toLowerCase()
    return stats.filter((row: any) => (row.player?.name || '').toLowerCase().includes(q))
  }, [stats, search])

  const columns = useMemo(() => {
    if (tab === "hitting") {
      const base = [
        { header: "Player", accessorKey: "player.name", cell: ({ getValue }: any) => getValue() || '' },
        { header: "Team", accessorKey: "team", cell: ({ getValue }: any) => getValue() || '' },
  { header: "G", accessorKey: "games" },
  { header: "PA", accessorKey: "plateAppearances" },
  { header: "AB", accessorKey: "atBats" },
  { header: "R", accessorKey: "runs" },
  { header: "H", accessorKey: "hits" },
  { header: "2B", accessorKey: "doubles" },
  { header: "3B", accessorKey: "triples" },
  { header: "HR", accessorKey: "homeRuns" },
  { header: "RBI", accessorKey: "rbis" },
  { header: "BB", accessorKey: "walks" },
  { header: "SO", accessorKey: "strikeouts" },
  { header: "AVG", accessorKey: "avg", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
  { header: "OBP", accessorKey: "obp", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
  { header: "SLG", accessorKey: "slg", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
  { header: "OPS", accessorKey: "ops", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "wRC+", accessorKey: "wrcPlus", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(0) }
      ]
      
      if (scope === "totals") {
        base.splice(1, 0, { header: "Seasons", accessorKey: "seasons" })
      }
      
      return base
    } else {
      const base = [
        { header: "Player", accessorKey: "player.name", cell: ({ getValue }: any) => getValue() || '' },
        { header: "Team", accessorKey: "team", cell: ({ getValue }: any) => getValue() || '' },
  { header: "G", accessorKey: "games" },
  { header: "IP", accessorKey: "inningsPitched", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(1) },
  { header: "W", accessorKey: "wins" },
  { header: "L", accessorKey: "losses" },
  { header: "SV", accessorKey: "saves" },
  { header: "K", accessorKey: "strikeouts" },
  { header: "BB", accessorKey: "walks" },
  { header: "H", accessorKey: "hits" },
  { header: "R", accessorKey: "runs" },
  { header: "ER", accessorKey: "earnedRuns" },
  { header: "ERA", accessorKey: "era", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(2) },
  { header: "WHIP", accessorKey: "whip", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(2) },
        { header: "OPP AVG", accessorKey: "oppAvg", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) }
      ]

        if (scope === "totals") {
        base.splice(1, 0, { header: "Seasons", accessorKey: "seasons" })
      }
      
      return base
    }
  }, [tab, scope])

  const initialSort = tab === "hitting" ? "ops" : "era"
  const initialSortDesc = tab === "pitching" ? false : true

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation />
    <div className="container mx-auto px-4 py-8">
      {stale && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mb-4 text-sm">
          Data may be outdated — we&apos;re having trouble reaching the latest stats. Showing last known data.
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Player Statistics</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <div className="inline-flex rounded-md shadow-sm" role="group">
              <button className={`px-4 py-2 text-sm font-medium border ${tab === "hitting" ? "bg-[#25397B] text-white" : "bg-white text-gray-700"}`} onClick={() => setTab("hitting")}>Hitting</button>
              <button className={`px-4 py-2 text-sm font-medium border ${tab === "pitching" ? "bg-[#25397B] text-white" : "bg-white text-gray-700"}`} onClick={() => setTab("pitching")}>Pitching</button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button className={`px-3 py-1 text-sm font-medium border ${scope === "yearly" ? "bg-gray-200" : "bg-white"}`} onClick={() => setScope("yearly")}>Yearly</button>
          <button className={`px-3 py-1 text-sm font-medium border ${scope === "totals" ? "bg-gray-200" : "bg-white"}`} onClick={() => setScope("totals")}>Totals (All Years)</button>
        </div>

        {scope === "totals" && (
          <div className="flex items-center gap-3">
            {tab === "hitting" ? (
              <>
                <label className="text-sm">Min PA</label>
                <input type="number" className="border rounded px-2 py-1 w-24" value={totalsPaQual} onChange={(e) => setTotalsPaQual(parseInt(e.target.value || '0', 10))} />
              </>
            ) : (
              <>
                <label className="text-sm">Min IP</label>
                <input type="number" className="border rounded px-2 py-1 w-24" value={totalsIpQual} onChange={(e) => setTotalsIpQual(parseInt(e.target.value || '0', 10))} />
              </>
            )}
          </div>
        )}
      </div>

      <StatsFilter
        years={years}
        selectedYear={scope === "yearly" ? selectedYear : null}
        onYearChange={setSelectedYear}
        qualified={qualified}
        onQualifiedChange={setQualified}
        showQualified={true}
      />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <StatsTable data={visibleStats as any[]} columns={columns as any[]} initialSortField={initialSort} initialSortDesc={initialSortDesc} stickyFirstCols={2} columnWidthsPx={[180, 220]} />
      )}
      </div>
    </div>
  )
}
