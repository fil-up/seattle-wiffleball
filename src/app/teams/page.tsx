"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CardSkeleton } from "@/components/Skeleton"
import ErrorState from "@/components/ErrorState"

type Team = {
  id: string
  name: string
  logoUrl?: string
}

type StandingsRecord = {
  team: string
  year: string
  wins: number
  losses: number
  pct: number
}

const DEFAULT_LOGO = "/images/teams/default-team-logo.png"

export default function TeamsIndexPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [records, setRecords] = useState<Map<string, StandingsRecord>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/teams').then(r => r.json()),
      fetch('/api/standings?scope=yearly').then(r => r.json()),
    ]).then(([teamsResult, standingsResult]) => {
      const { data: teamsData, stale: teamsStale } = teamsResult
      const { data: standingsData, stale: standingsStale } = standingsResult

      const list = (teamsData as any[]).map(t => ({ id: t.id, name: t.name, logoUrl: t.logoUrl }))
      setTeams(list)
      setStale(teamsStale || standingsStale)

      const recordMap = new Map<string, StandingsRecord>()
      const sorted = [...(standingsData as StandingsRecord[])].sort(
        (a, b) => parseInt(b.year) - parseInt(a.year)
      )
      for (const s of sorted) {
        const key = s.team.toLowerCase()
        if (!recordMap.has(key)) {
          recordMap.set(key, s)
        }
      }
      setRecords(recordMap)
      setLoading(false)
    }).catch((err) => {
      console.error('Error fetching teams:', err)
      setError(true)
      setLoading(false)
    })
  }, [retryCount])

  function getRecord(teamName: string): StandingsRecord | undefined {
    return records.get(teamName.toLowerCase())
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-content-primary mb-6">Teams</h1>
        {stale && (
          <div className="bg-brand-gold/10 border border-brand-gold/30 text-content-primary px-4 py-2 rounded mb-4 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Data may be outdated — showing last known data while we reconnect.
          </div>
        )}
        {error ? (
          <ErrorState message="Couldn't load teams." onRetry={() => { setError(false); setRetryCount(c => c + 1) }} />
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {teams.map((team) => {
              const record = getRecord(team.name)
              return (
                <Link key={team.id} href={`/teams/${team.id}`} className="group">
                  <div className="bg-surface-card p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={team.logoUrl || DEFAULT_LOGO}
                      alt={`${team.name} logo`}
                      className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain mb-4 transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO }}
                    />
                    <h3 className="text-lg font-semibold text-content-primary text-center group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors">
                      {team.name}
                    </h3>
                    <div className="mt-2 flex flex-col items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      {record ? (
                        <>
                          <span className="text-sm font-medium text-content-primary">
                            {record.wins}-{record.losses}
                          </span>
                          <span className="text-xs text-content-secondary">
                            {record.pct.toFixed(3)} WIN%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-content-secondary">No record</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
