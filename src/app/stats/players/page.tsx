"use client"

import { useState, useEffect, useMemo } from "react"
import StatsTable from "@/components/StatsTable"
import StatsFilter from "@/components/StatsFilter"
import type { YearlyHittingRow, TotalsHittingRow, YearlyPitchingRow, TotalsPitchingRow } from "@/lib/sheets"

type StatRow = YearlyHittingRow | TotalsHittingRow | YearlyPitchingRow | TotalsPitchingRow

export default function PlayersStats() {
  const [tab, setTab] = useState<"hitting" | "pitching">("hitting")
  const [scope, setScope] = useState<"yearly" | "totals">("yearly")
  const [allData, setAllData] = useState<StatRow[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [qualified, setQualified] = useState(true)
  const [loading, setLoading] = useState(true)
  const [stale, setStale] = useState(false)
  const [totalsPaQual, setTotalsPaQual] = useState(100)
  const [totalsIpQual, setTotalsIpQual] = useState(75)
  const [search, setSearch] = useState('')

  // Single fetch effect — only tab and scope trigger re-fetches
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const scopeParam = scope === 'yearly' ? 'yearly' : 'totals'
        const response = await fetch(`/api/players?type=${tab}&scope=${scopeParam}`)
        if (!response.ok) throw new Error('Failed to fetch data')
        const result = await response.json()
        setAllData(result.data || [])
        setStale(result.stale)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [tab, scope])

  // Reset filters on scope change
  useEffect(() => {
    setSelectedYear(null)
    setSelectedTeam(null)
  }, [scope])

  // Reset team on tab change
  useEffect(() => {
    setSelectedTeam(null)
  }, [tab])

  // Derive year list from UNFILTERED data (fixes year dropdown bug)
  const years = useMemo(() => {
    if (scope !== 'yearly') return []
    const unique = [...new Set((allData as any[]).map((r: any) => r.year).filter(Boolean))]
    return unique.sort((a: number, b: number) => b - a)
  }, [allData, scope])

  // Auto-select most recent year when years change and no year is selected
  useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0])
    }
  }, [years, selectedYear])

  // Derive team list from unfiltered data, scoped to selected year
  const teams = useMemo(() => {
    if (scope !== 'yearly' || !selectedYear) return []
    const yearData = (allData as any[]).filter((r: any) => r.year === selectedYear)
    return [...new Set(yearData.map((r: any) => r.team).filter(Boolean))].sort() as string[]
  }, [allData, scope, selectedYear])

  // Dynamic qualifier threshold computation
  const qualifierThreshold = useMemo(() => {
    if (scope !== 'yearly' || !selectedYear) return 0
    const yearPlayers = (allData as any[]).filter((r: any) => r.year === selectedYear && r.games > 0)
    if (yearPlayers.length === 0) return 0
    const avgGames = yearPlayers.reduce((sum: number, r: any) => sum + r.games, 0) / yearPlayers.length
    const multiplier = tab === 'hitting' ? 3.1 : 1.0
    return Math.floor(multiplier * avgGames)
  }, [allData, scope, selectedYear, tab])

  // Derive display data from allData + active filters
  const displayData = useMemo(() => {
    let filtered = allData as any[]

    if (scope === 'yearly' && selectedYear) {
      filtered = filtered.filter((r: any) => r.year === selectedYear)
    }

    if (scope === 'yearly' && selectedTeam) {
      filtered = filtered.filter((r: any) => r.team === selectedTeam)
    }

    if (qualified) {
      if (scope === 'yearly') {
        if (tab === 'hitting') {
          filtered = filtered.filter((r: any) => (r.plateAppearances || 0) >= qualifierThreshold)
        } else {
          filtered = filtered.filter((r: any) => (r.inningsPitched || 0) >= qualifierThreshold)
        }
      } else {
        if (tab === 'hitting') {
          filtered = filtered.filter((r: any) => (r.plateAppearances || 0) >= totalsPaQual)
        } else {
          filtered = filtered.filter((r: any) => (r.inningsPitched || 0) >= totalsIpQual)
        }
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter((r: any) => (r.player?.name || '').toLowerCase().includes(q))
    }

    return filtered
  }, [allData, scope, selectedYear, selectedTeam, qualified, qualifierThreshold, tab, totalsPaQual, totalsIpQual, search])

  const columns = useMemo(() => {
    if (tab === "hitting") {
      const base = [
        { header: "Player", accessorKey: "player.name", sortDescFirst: true, cell: ({ getValue }: any) => getValue() || '' },
        { header: "Team", accessorKey: "team", sortDescFirst: true, cell: ({ getValue }: any) => getValue() || '' },
        { header: "G", accessorKey: "games", sortDescFirst: true },
        { header: "PA", accessorKey: "plateAppearances", sortDescFirst: true },
        { header: "AB", accessorKey: "atBats", sortDescFirst: true },
        { header: "R", accessorKey: "runs", sortDescFirst: true },
        { header: "H", accessorKey: "hits", sortDescFirst: true },
        { header: "2B", accessorKey: "doubles", sortDescFirst: true },
        { header: "3B", accessorKey: "triples", sortDescFirst: true },
        { header: "HR", accessorKey: "homeRuns", sortDescFirst: true },
        { header: "RBI", accessorKey: "rbis", sortDescFirst: true },
        { header: "BB", accessorKey: "walks", sortDescFirst: true },
        { header: "SO", accessorKey: "strikeouts", sortDescFirst: true },
        { header: "AVG", accessorKey: "avg", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "OBP", accessorKey: "obp", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "SLG", accessorKey: "slg", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "OPS", accessorKey: "ops", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "wRC+", accessorKey: "wrcPlus", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(0) },
      ]

      if (scope === "totals") {
        base.splice(1, 0, { header: "Seasons", accessorKey: "seasons", sortDescFirst: true })
      }

      return base
    } else {
      const base = [
        { header: "Player", accessorKey: "player.name", sortDescFirst: true, cell: ({ getValue }: any) => getValue() || '' },
        { header: "Team", accessorKey: "team", sortDescFirst: true, cell: ({ getValue }: any) => getValue() || '' },
        { header: "G", accessorKey: "games", sortDescFirst: true },
        { header: "IP", accessorKey: "inningsPitched", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(1) },
        { header: "W", accessorKey: "wins", sortDescFirst: true },
        { header: "L", accessorKey: "losses", sortDescFirst: true },
        { header: "SV", accessorKey: "saves", sortDescFirst: true },
        { header: "K", accessorKey: "strikeouts", sortDescFirst: true },
        { header: "BB", accessorKey: "walks", sortDescFirst: true },
        { header: "H", accessorKey: "hits", sortDescFirst: true },
        { header: "R", accessorKey: "runs", sortDescFirst: true },
        { header: "ER", accessorKey: "earnedRuns", sortDescFirst: true },
        { header: "ERA", accessorKey: "era", sortDescFirst: false, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(2) },
        { header: "WHIP", accessorKey: "whip", sortDescFirst: false, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(2) },
        { header: "OPP AVG", accessorKey: "oppAvg", sortDescFirst: false, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
      ]

      if (scope === "totals") {
        base.splice(1, 0, { header: "Seasons", accessorKey: "seasons", sortDescFirst: true })
      }

      return base
    }
  }, [tab, scope])

  const initialSort = tab === "hitting" ? "wrcPlus" : "era"
  const initialSortDesc = tab === "hitting"

  return (
    <div>
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
        teams={teams}
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        qualified={qualified}
        onQualifiedChange={setQualified}
        showQualified={true}
      />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : displayData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No players match these filters.</div>
      ) : (
        <StatsTable data={displayData as any[]} columns={columns as any[]} initialSortField={initialSort} initialSortDesc={initialSortDesc} stickyFirstCols={2} columnWidthsPx={[180, 220]} />
      )}
      </div>
    </div>
  )
}
