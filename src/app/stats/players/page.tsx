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
  woba?: number
  wobaNum?: number
  wobaDen?: number
  wrcPlus?: number
  team?: string
  teamLogo?: string
}

interface PitchingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  year?: number
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
  const [totalsPaQual, setTotalsPaQual] = useState(100)
  const [totalsIpQual, setTotalsIpQual] = useState(75)
  const [search, setSearch] = useState('')

  // Fetch data from Google Sheets
  const fetchData = async (category: 'hitting' | 'pitching', isYearly: boolean) => {
    try {
      setLoading(true)
      
      let url: string
      if (category === 'hitting') {
        if (isYearly) {
          // Batting by year: "IH" tab, cells A700:AP2000
          url = `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=IH&range=A700:AP2000`
        } else {
          // Batting all-time totals: "IP" tab, cells C2:AL600
          url = `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=IP&range=C2:AL600`
        }
      } else {
        if (isYearly) {
          // Pitching stats by year: "IP" tab, cells A300:AA999
          url = `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=IP&range=A300:AA999`
        } else {
          // Player all-time pitching stats: "IP" tab, cells C1:AA1
          url = `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=IP&range=C1:AA1`
        }
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      let processed: any[] = []

      if (category === 'hitting') {
        if (isYearly) {
          // Process yearly hitting data
          processed = rows.map((row: any, index: number) => {
            const cells = row.c || []
            return {
              id: `hitting-${index}`,
              playerId: cells[1]?.v || '', // Name ID column
              player: { 
                id: cells[1]?.v || '', 
                name: `${cells[2]?.v || ''} ${cells[3]?.v || ''}`.trim() // FIRST + LAST
              },
              year: parseInt(cells[0]?.v || '0'), // Year column
              team: cells[4]?.v || '', // TEAM column
              games: parseInt(cells[6]?.v || '0'), // GP column
              plateAppearances: parseInt(cells[8]?.v || '0'), // PA column
              atBats: parseInt(cells[9]?.v || '0'), // AB column
              runs: parseInt(cells[10]?.v || '0'), // R column
              hits: parseInt(cells[11]?.v || '0'), // H column
              doubles: parseInt(cells[12]?.v || '0'), // 2B column
              triples: parseInt(cells[13]?.v || '0'), // 3B column
              homeRuns: parseInt(cells[14]?.v || '0'), // HR column
              rbis: parseInt(cells[15]?.v || '0'), // RBI column
              walks: parseInt(cells[16]?.v || '0'), // BB column
              strikeouts: parseInt(cells[17]?.v || '0'), // K column
              avg: parseFloat(cells[18]?.v || '0'), // AVG column
              obp: parseFloat(cells[21]?.v || '0'), // OBP column
              slg: parseFloat(cells[22]?.v || '0'), // SLG column
              ops: parseFloat(cells[23]?.v || '0'), // OPS column
              wrcPlus: parseFloat(cells[34]?.v || '0'), // wRC+ column
              teamLogo: `/images/teams/${cells[4]?.v || 'default'}-logo.png`
            }
          }).filter((row: any) => row.player.name.trim() !== '' && row.year > 0)
        } else {
          // Process all-time hitting totals
          processed = rows.map((row: any, index: number) => {
            const cells = row.c || []
            return {
              id: `hitting-totals-${index}`,
              playerId: `${cells[0]?.v || ''}-${cells[1]?.v || ''}`, // FIRST + LAST
              player: { 
                id: `${cells[0]?.v || ''}-${cells[1]?.v || ''}`, 
                name: `${cells[0]?.v || ''} ${cells[1]?.v || ''}`.trim()
              },
              seasons: parseInt(cells[2]?.v || '0'), // SEASONS column
              games: parseInt(cells[4]?.v || '0'), // GP column
              plateAppearances: parseInt(cells[5]?.v || '0'), // PA column
              atBats: parseInt(cells[6]?.v || '0'), // AB column
              runs: parseInt(cells[7]?.v || '0'), // R column
              hits: parseInt(cells[8]?.v || '0'), // H column
              doubles: parseInt(cells[9]?.v || '0'), // 2B column
              triples: parseInt(cells[10]?.v || '0'), // 3B column
              homeRuns: parseInt(cells[11]?.v || '0'), // HR column
              rbis: parseInt(cells[12]?.v || '0'), // RBI column
              walks: parseInt(cells[13]?.v || '0'), // BB column
              strikeouts: parseInt(cells[14]?.v || '0'), // K column
              avg: parseFloat(cells[15]?.v || '0'), // AVG column
              obp: parseFloat(cells[18]?.v || '0'), // OBP column
              slg: parseFloat(cells[19]?.v || '0'), // SLG column
              ops: parseFloat(cells[20]?.v || '0'), // OPS column
              wrcPlus: parseFloat(cells[33]?.v || '0'), // wRC+ column
              teamLogo: `/images/teams/default-logo.png`
            }
          }).filter((row: any) => row.player.name.trim() !== '' && row.seasons > 0)
        }
      } else {
        if (isYearly) {
          // Process yearly pitching data
          processed = rows.map((row: any, index: number) => {
            const cells = row.c || []
            return {
              id: `pitching-${index}`,
              playerId: cells[1]?.v || '', // Name ID column
              player: { 
                id: cells[1]?.v || '', 
                name: `${cells[2]?.v || ''} ${cells[3]?.v || ''}`.trim() // FIRST + LAST
              },
              year: parseInt(cells[0]?.v || '0'), // Year column
              team: cells[4]?.v || '', // TEAM column
              games: parseInt(cells[6]?.v || '0'), // GP column
              inningsPitched: parseFloat(cells[8]?.v || '0'), // IP column
              wins: parseInt(cells[11]?.v || '0'), // W column
              losses: parseInt(cells[12]?.v || '0'), // L column
              saves: parseInt(cells[13]?.v || '0'), // S column
              strikeouts: parseInt(cells[14]?.v || '0'), // K column
              walks: parseInt(cells[15]?.v || '0'), // BB column
              hits: parseInt(cells[16]?.v || '0'), // H column
              runs: parseInt(cells[17]?.v || '0'), // R column
              earnedRuns: parseInt(cells[18]?.v || '0'), // ER column
              era: parseFloat(cells[19]?.v || '0'), // ERA column
              whip: parseFloat(cells[20]?.v || '0'), // WHIP column
              oppAvg: parseFloat(cells[24]?.v || '0'), // OPP AVG column
              teamLogo: `/images/teams/${cells[4]?.v || 'default'}-logo.png`
            }
          }).filter((row: any) => row.player.name.trim() !== '' && row.year > 0)
        } else {
          // Process all-time pitching totals
          processed = rows.map((row: any, index: number) => {
            const cells = row.c || []
            return {
              id: `pitching-totals-${index}`,
              playerId: `${cells[0]?.v || ''}-${cells[1]?.v || ''}`, // FIRST + LAST
              player: { 
                id: `${cells[0]?.v || ''}-${cells[1]?.v || ''}`, 
                name: `${cells[0]?.v || ''} ${cells[1]?.v || ''}`.trim()
              },
              seasons: parseInt(cells[2]?.v || '0'), // SEASONS column
              games: parseInt(cells[4]?.v || '0'), // GP column
              inningsPitched: parseFloat(cells[6]?.v || '0'), // IP column
              wins: parseInt(cells[11]?.v || '0'), // W column
              losses: parseInt(cells[12]?.v || '0'), // L column
              saves: parseInt(cells[13]?.v || '0'), // S column
              strikeouts: parseInt(cells[14]?.v || '0'), // K column
              walks: parseInt(cells[15]?.v || '0'), // BB column
              hits: parseInt(cells[16]?.v || '0'), // H column
              runs: parseInt(cells[17]?.v || '0'), // R column
              earnedRuns: parseInt(cells[18]?.v || '0'), // ER column
              era: parseFloat(cells[19]?.v || '0'), // ERA column
              whip: parseFloat(cells[20]?.v || '0'), // WHIP column
              oppAvg: parseFloat(cells[24]?.v || '0'), // OPP AVG column
              teamLogo: `/images/teams/default-logo.png`
            }
          }).filter((row: any) => row.player.name.trim() !== '' && row.seasons > 0)
        }
      }

      // Apply filters
      if (isYearly && selectedYear) {
        processed = processed.filter((row: any) => row.year === selectedYear)
      }

      if (qualified && isYearly) {
        if (category === 'hitting') {
          // Filter by wRC+ percentile (exclude "Non-qualifier")
          processed = processed.filter((row: any) => row.wrcPlus && row.wrcPlus > 0)
        } else {
          // Filter by ERA percentile (exclude "Non-qualifier")
          processed = processed.filter((row: any) => row.era && row.era > 0)
        }
      }

      if (!isYearly) {
        // Apply minimum qualifiers for totals
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

  // Fetch years for yearly view
  useEffect(() => {
    if (tab === "hitting") {
      fetchData('hitting', true)
    } else {
      fetchData('pitching', true)
    }
  }, [tab])

  // Fetch data when parameters change
  useEffect(() => {
    const isYearly = scope === "yearly"
    fetchData(tab, isYearly)
  }, [tab, scope, selectedYear, qualified, totalsPaQual, totalsIpQual])

  // Extract unique years from yearly data
  useEffect(() => {
    if (scope === "yearly" && stats.length > 0) {
      const uniqueYears = Array.from(new Set(stats.map(s => s.year).filter(Boolean))).sort((a, b) => b - a)
      setYears(uniqueYears)
      if (uniqueYears.length > 0 && !selectedYear) {
        setSelectedYear(uniqueYears[0])
      }
    }
  }, [stats, scope, selectedYear])

  // Derived filtered stats by search
  const visibleStats = useMemo(() => {
    if (!search.trim()) return stats
    const q = search.toLowerCase()
    return stats.filter((row: any) => (row.player?.name || '').toLowerCase().includes(q))
  }, [stats, search])

  // Define columns based on tab and scope
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
