"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface StandingsEntry {
  team: string
  year: string
  wins: number
  losses: number
  pct: number
}

export function StandingsWidget() {
  const [standings, setStandings] = useState<StandingsEntry[]>([])
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/standings?scope=yearly')
      .then((res) => res.json())
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setLoading(false)
          return
        }
        const years = [...new Set(data.map((d: StandingsEntry) => d.year))] as string[]
        const latestYear = years.sort().pop() ?? ''
        const filtered = data
          .filter((d: StandingsEntry) => d.year === latestYear)
          .sort((a: StandingsEntry, b: StandingsEntry) => b.pct - a.pct)
          .slice(0, 10)
        setYear(latestYear)
        setStandings(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-surface-card rounded-lg shadow p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-surface-secondary rounded w-1/2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-surface-secondary rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (standings.length === 0) {
    return (
      <div className="bg-surface-card rounded-lg shadow p-4">
        <p className="text-content-secondary text-sm">No standings data available.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-content-primary">Standings {year}</h3>
        <Link href="/stats/teams" className="text-brand-navy text-xs font-semibold hover:text-brand-navy/80">
          Full Standings →
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-content-secondary text-xs uppercase">
            <th className="pb-2 pr-2">#</th>
            <th className="pb-2">Team</th>
            <th className="pb-2 text-right">W-L</th>
            <th className="pb-2 text-right">PCT</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry, i) => (
            <tr key={entry.team} className="border-t border-border">
              <td className="py-1.5 pr-2 text-content-secondary text-xs">{i + 1}</td>
              <td className="py-1.5 font-medium text-content-primary truncate max-w-[120px]">{entry.team}</td>
              <td className="py-1.5 text-right text-content-secondary">{entry.wins}-{entry.losses}</td>
              <td className="py-1.5 text-right font-mono text-content-primary">{entry.pct.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
