"use client"

import { useState, useEffect, useMemo } from "react"
import StatsTable from "@/components/StatsTable"
import StatsFilter from "@/components/StatsFilter"
import { TableSkeleton } from "@/components/Skeleton"
import ErrorState from "@/components/ErrorState"
import { resolveTeamByCode } from "@/config/teamCodeLogos"
import Image from "next/image"
import Link from "next/link"
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
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
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
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [tab, scope, retryCount])

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
        { header: "Player", accessorKey: "player.name", sortDescFirst: true, cell: ({ row, getValue }: any) => {
          const name = getValue() || ''
          const teamCode = row.original?.teamCode || row.original?.team || ''
          const playerId = row.original?.player?.id
          const { logoUrl } = resolveTeamByCode(teamCode)
          return (
            <div className="flex items-center gap-2">
              {logoUrl && <Image src={logoUrl} alt="" width={16} height={16} className="flex-shrink-0" unoptimized />}
              {playerId ? <Link href={`/stats/players/${playerId}`} className="text-brand-navy hover:underline dark:text-blue-400">{name}</Link> : name}
            </div>
          )
        }},
        { header: "Team", accessorKey: "team", sortDescFirst: true, cell: ({ getValue }: any) => getValue() || '' },
        { header: "G", accessorKey: "games", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "PA", accessorKey: "plateAppearances", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "AB", accessorKey: "atBats", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "R", accessorKey: "runs", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "H", accessorKey: "hits", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "2B", accessorKey: "doubles", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "3B", accessorKey: "triples", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "HR", accessorKey: "homeRuns", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "RBI", accessorKey: "rbis", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "BB", accessorKey: "walks", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "SO", accessorKey: "strikeouts", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "AVG", accessorKey: "avg", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "OBP", accessorKey: "obp", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "SLG", accessorKey: "slg", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "OPS", accessorKey: "ops", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
        { header: "wRC+", accessorKey: "wrcPlus", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(0) },
      ]

      if (scope === "totals") {
        base.splice(1, 0, { header: "Seasons", accessorKey: "seasons", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) })
      }

      return base
    } else {
      const base = [
        { header: "Player", accessorKey: "player.name", sortDescFirst: true, cell: ({ row, getValue }: any) => {
          const name = getValue() || ''
          const teamCode = row.original?.teamCode || row.original?.team || ''
          const playerId = row.original?.player?.id
          const { logoUrl } = resolveTeamByCode(teamCode)
          return (
            <div className="flex items-center gap-2">
              {logoUrl && <Image src={logoUrl} alt="" width={16} height={16} className="flex-shrink-0" unoptimized />}
              {playerId ? <Link href={`/stats/players/${playerId}`} className="text-brand-navy hover:underline dark:text-blue-400">{name}</Link> : name}
            </div>
          )
        }},
        { header: "Team", accessorKey: "team", sortDescFirst: true, cell: ({ getValue }: any) => getValue() || '' },
        { header: "G", accessorKey: "games", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "IP", accessorKey: "inningsPitched", sortDescFirst: true, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(1) },
        { header: "W", accessorKey: "wins", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "L", accessorKey: "losses", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "SV", accessorKey: "saves", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "K", accessorKey: "strikeouts", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "BB", accessorKey: "walks", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "H", accessorKey: "hits", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "R", accessorKey: "runs", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "ER", accessorKey: "earnedRuns", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) },
        { header: "ERA", accessorKey: "era", sortDescFirst: false, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(2) },
        { header: "WHIP", accessorKey: "whip", sortDescFirst: false, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(2) },
        { header: "OPP AVG", accessorKey: "oppAvg", sortDescFirst: false, cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
      ]

      if (scope === "totals") {
        base.splice(1, 0, { header: "Seasons", accessorKey: "seasons", sortDescFirst: true, cell: ({ getValue }: any) => Math.round(getValue() ?? 0) })
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
        <div className="bg-brand-gold/10 border border-brand-gold/30 text-content-primary px-4 py-2 rounded mb-4 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Data may be outdated — we&apos;re having trouble reaching the latest stats. Showing last known data.
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-content-primary">Player Statistics</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-sm bg-surface-card text-content-primary focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-colors min-w-0 flex-1 sm:flex-none"
          />
          <div className="inline-flex rounded-md shadow-sm flex-shrink-0" role="group">
              <button className={`px-4 py-2 text-sm font-medium border border-border rounded-l-md transition-colors ${tab === "hitting" ? "bg-brand-navy text-white" : "bg-surface-card text-content-primary"}`} onClick={() => setTab("hitting")}>Hitting</button>
              <button className={`px-4 py-2 text-sm font-medium border border-border rounded-r-md transition-colors ${tab === "pitching" ? "bg-brand-navy text-white" : "bg-surface-card text-content-primary"}`} onClick={() => setTab("pitching")}>Pitching</button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button className={`px-3 py-1 text-sm font-medium border border-border ${scope === "yearly" ? "bg-surface-secondary" : "bg-surface-card"}`} onClick={() => setScope("yearly")}>Yearly</button>
          <button className={`px-3 py-1 text-sm font-medium border border-border ${scope === "totals" ? "bg-surface-secondary" : "bg-surface-card"}`} onClick={() => setScope("totals")}>Totals (All Years)</button>
        </div>

        {scope === "totals" && (
          <div className="flex items-center gap-3">
            {tab === "hitting" ? (
              <>
                <label className="text-sm text-content-secondary">Min PA</label>
                <input type="number" className="border border-border rounded px-2 py-1 w-24 bg-surface-card text-content-primary" value={totalsPaQual} onChange={(e) => setTotalsPaQual(parseInt(e.target.value || '0', 10))} />
              </>
            ) : (
              <>
                <label className="text-sm text-content-secondary">Min IP</label>
                <input type="number" className="border border-border rounded px-2 py-1 w-24 bg-surface-card text-content-primary" value={totalsIpQual} onChange={(e) => setTotalsIpQual(parseInt(e.target.value || '0', 10))} />
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

      {error ? (
        <ErrorState message="Couldn't load player stats." onRetry={() => { setError(false); setRetryCount(c => c + 1) }} />
      ) : loading ? (
        <TableSkeleton rows={12} cols={8} />
      ) : displayData.length === 0 ? (
        <div className="text-center py-8 text-content-secondary">No players match these filters.</div>
      ) : (
        <StatsTable data={displayData as any[]} columns={columns as any[]} initialSortField={initialSort} initialSortDesc={initialSortDesc} stickyFirstCols={1} columnWidthsPx={[200]} />
      )}
      </div>
    </div>
  )
}
