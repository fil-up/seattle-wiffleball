"use client"

import { useState, useEffect, useMemo } from "react"
import StatsTable from "@/components/StatsTable"
import StatsFilter from "@/components/StatsFilter"
import Link from "next/link"
import Image from "next/image"
import { teams } from "@/config/teams"
import { resolveTeamByCode } from "@/config/teamCodeLogos"
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

const DEFAULT_TEAM_LOGO = "/images/teams/default-team-logo.png"

function slugifyTeamName(name?: string) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function TeamLogo({ src, name }: { src?: string; name?: string }) {
  const initial = src && src.length > 0 ? src : (name ? `/images/teams/${slugifyTeamName(name)}-logo.png` : DEFAULT_TEAM_LOGO)
  return (
    <img
      src={initial}
      alt={`${name || 'team'} logo`}
      className="w-6 h-6 object-contain"
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement
        const fallback = name ? `/images/teams/${slugifyTeamName(name)}-logo.png` : DEFAULT_TEAM_LOGO
        if (target.src.endsWith(fallback)) {
          target.src = DEFAULT_TEAM_LOGO
        } else {
          target.src = fallback
        }
      }}
    />
  )
}

function selectTeamForYear(player: any, year?: number): { name?: string; logoUrl?: string } {
  if (!player?.teams) return {}
  if (year) {
    const match = player.teams.find((t: any) => t.year === year)
    return { name: match?.team?.name, logoUrl: match?.team?.logoUrl }
  }
  const first = player.teams[0]
  return { name: first?.team?.name, logoUrl: first?.team?.logoUrl }
}

// columns
const hittingColumns = [
  {
    header: "Team",
    accessorKey: "teamLogo",
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <TeamLogo src={row.original.teamLogo} name={row.original.team} />
        <span className="text-xs text-gray-700">{row.original.team || ''}</span>
        <span className="text-[10px] text-gray-400">{row.original.teamCode || ''}</span>
      </div>
    ),
  },
  {
    header: "Player",
    accessorKey: "player.name",
    cell: ({ row }: any) => (
      <Link href={`/players/${row.original.player.id}`} className="text-blue-600 hover:text-blue-800">
        {row.original.player.name}
      </Link>
    ),
  },
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
  { header: "OPS+", accessorKey: "opsPlus", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(0) },
  { header: "wOBA", accessorKey: "woba", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
  { header: "wRC+", accessorKey: "wrcPlus", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(0) },
]

const pitchingColumns = [
  {
    header: "Team",
    accessorKey: "teamLogo",
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <TeamLogo src={row.original.teamLogo} name={row.original.team} />
        <span className="text-xs text-gray-700">{row.original.team || ''}</span>
        <span className="text-[10px] text-gray-400">{row.original.teamCode || ''}</span>
      </div>
    ),
  },
  {
    header: "Player",
    accessorKey: "player.name",
    cell: ({ row }: any) => (
      <Link href={`/players/${row.original.player.id}`} className="text-blue-600 hover:text-blue-800">
        {row.original.player.name}
      </Link>
    ),
  },
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
  { header: "OPP AVG", accessorKey: "oppAvg", cell: ({ getValue }: any) => (getValue() ?? 0).toFixed(3) },
]

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

  useEffect(() => {
    fetch("/api/stats?category=hitting&limit=50000")
      .then((res) => res.json())
      .then((data) => {
        const uniqueYears = Array.from(new Set((data as any[]).map((s: any) => s.year).filter(Boolean))).sort((a, b) => b - a)
        setYears(uniqueYears)
        if (uniqueYears.length > 0) setSelectedYear(uniqueYears[0])
      })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.append("category", tab)
    if (scope === "yearly" && selectedYear) params.append("year", String(selectedYear))
    if (qualified && scope === "yearly") params.append("qualified", "true")
    params.append("limit", "50000")

    fetch(`/api/stats?${params.toString()}`)
      .then((r) => r.json())
      .then((rows) => {
        let processed = rows as any[]
        processed = processed.map((row) => {
          const t = selectTeamForYear(row.player, row.year)
          const code = (row.teamCode || row.team || '').toString()
          const fallback = resolveTeamByCode(code)
          return { 
            ...row, 
            team: t.name || fallback.name || '', 
            teamLogo: t.logoUrl || fallback.logoUrl || '', 
            teamCode: code 
          }
        })

        if (scope === "totals") {
          const byPlayer = new Map<string, any>()
          const seasonsByPlayer = new Map<string, Set<number>>()

          for (const row of processed) {
            const key = row.playerId
            if (!byPlayer.has(key)) byPlayer.set(key, { ...row })
            const acc = byPlayer.get(key)
            seasonsByPlayer.set(key, (seasonsByPlayer.get(key) || new Set<number>()).add(row.year))

            for (const k of Object.keys(row)) {
              const v = (row as any)[k]
              if (typeof v === "number") acc[k] = (acc[k] || 0) + v
            }

            // For hitters: sum wOBA num/den if present
            acc.wobaNum = (acc.wobaNum || 0) + (row.wobaNum || 0)
            acc.wobaDen = (acc.wobaDen || 0) + (row.wobaDen || 0)
          }

          let totals = Array.from(byPlayer.values())

          // Seasons count
          totals = totals.map((p) => ({ ...p, seasons: (seasonsByPlayer.get(p.playerId) || new Set<number>()).size }))

          // Recompute derived and weighted fields
          totals = totals.map((acc) => {
            if (tab === "hitting") {
              const ab = acc.atBats || 0
              const hits = acc.hits || 0
              const obpDen = (acc.atBats || 0) + (acc.walks || 0)
              acc.avg = ab ? hits / ab : 0
              acc.obp = obpDen ? (hits + (acc.walks || 0)) / obpDen : 0
              acc.slg = ab ? ((acc.doubles || 0) + 2 * (acc.triples || 0) + 3 * (acc.homeRuns || 0) + (hits - (acc.doubles || 0) - (acc.triples || 0) - (acc.homeRuns || 0))) / ab : 0
              acc.ops = (acc.obp || 0) + (acc.slg || 0)
              acc.iso = (acc.slg || 0) - (acc.avg || 0)
              const num = (acc.hits || 0) - (acc.homeRuns || 0)
              const den = (acc.atBats || 0) - (acc.homeRuns || 0) - (acc.strikeouts || 0) + (acc.sacFlies || 0)
              acc.babip = den > 0 ? num / den : 0
              // Totals wOBA from components if available
              if ((acc.wobaNum || 0) > 0 && (acc.wobaDen || 0) > 0) acc.woba = acc.wobaNum / acc.wobaDen
            } else {
              const ip = acc.inningsPitched || 0
              acc.era = ip ? (acc.earnedRuns || 0) * 9 / ip : 0
              acc.whip = ip ? ((acc.walks || 0) + (acc.hits || 0)) / ip : 0
              // Simplified OPP AVG: H / (IP*3 + H)
              const denom = ip * 3 + (acc.hits || 0)
              acc.oppAvg = denom > 0 ? (acc.hits || 0) / denom : 0
            }
            return acc
          })

          // OPS+ totals: player OPS / league avg OPS of qualified players
          if (tab === "hitting") {
            const qualifiedPlayers = totals.filter((p) => (p.plateAppearances || 0) >= totalsPaQual)
            const leagueAvgOps = qualifiedPlayers.length ? qualifiedPlayers.reduce((s, p) => s + (p.ops || 0), 0) / qualifiedPlayers.length : 0
            totals = totals.map((p) => ({ ...p, opsPlus: leagueAvgOps ? (p.ops || 0) / leagueAvgOps * 100 : 0 }))
            // Weighted wRC+ by PA
            const paSumByPlayer: Record<string, number> = {}
            processed.forEach((r) => {
              if (!paSumByPlayer[r.playerId]) paSumByPlayer[r.playerId] = 0
              paSumByPlayer[r.playerId] += r.plateAppearances || 0
            })
            totals = totals.map((p) => {
              const totalPA = paSumByPlayer[p.playerId] || 0
              if (totalPA > 0) {
                let weighted = 0
                processed.filter((r) => r.playerId === p.playerId).forEach((yr) => {
                  if ((yr.plateAppearances || 0) > 0 && (yr.wrcPlus || 0) > 0) weighted += (yr.wrcPlus || 0) * (yr.plateAppearances || 0)
                })
                return { ...p, wrcPlus: weighted / totalPA }
              }
              return p
            })
          }

          if (qualified) {
            totals = totals.filter((row) =>
              tab === "hitting" ? (row.plateAppearances || 0) >= totalsPaQual : (row.inningsPitched || 0) >= totalsIpQual
            )
          }

          processed = totals
        } else {
          if (tab === "hitting") {
            processed = processed.map((p) => ({
              ...p,
              iso: (p.slg ?? 0) - (p.avg ?? 0),
              babip: (() => {
                const num = (p.hits || 0) - (p.homeRuns || 0)
                const den = (p.atBats || 0) - (p.homeRuns || 0) - (p.strikeouts || 0) + (p.sacFlies || 0)
                return den > 0 ? num / den : 0
              })(),
            }))
          }
        }

        setStats(processed)
        setLoading(false)
      })
  }, [tab, scope, selectedYear, qualified, totalsPaQual, totalsIpQual])

  // Derived filtered stats by search
  const visibleStats = useMemo(() => {
    if (!search.trim()) return stats
    const q = search.toLowerCase()
    return stats.filter((row: any) => (row.player?.name || '').toLowerCase().includes(q))
  }, [stats, search])

  const columns = useMemo(() => {
    const base = tab === "hitting" ? hittingColumns.slice() : pitchingColumns.slice()
    if (scope === "totals") {
      base.splice(1, 0, { header: "Seasons", accessorKey: "seasons" } as any)
    }
    return base
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
