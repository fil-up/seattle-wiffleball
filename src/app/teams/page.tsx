"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import PageNavigation from "@/components/PageNavigation"

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
  const [stale, setStale] = useState(false)

  useEffect(() => {
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
    })
  }, [])

  function getRecord(teamName: string): StandingsRecord | undefined {
    return records.get(teamName.toLowerCase())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Teams</h1>
        {stale && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mb-4 text-sm">
            Data may be outdated — showing last known data while we reconnect.
          </div>
        )}
        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {teams.map((team) => {
              const record = getRecord(team.name)
              return (
                <Link key={team.id} href={`/teams/${team.id}`} className="group">
                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={team.logoUrl || DEFAULT_LOGO}
                      alt={`${team.name} logo`}
                      className="w-36 h-36 md:w-44 md:h-44 object-contain mb-4 transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 text-center group-hover:text-blue-600 transition-colors">
                      {team.name}
                    </h3>
                    <div className="mt-2 flex flex-col items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      {record ? (
                        <>
                          <span className="text-sm font-medium text-gray-700">
                            {record.wins}-{record.losses}
                          </span>
                          <span className="text-xs text-gray-500">
                            {record.pct.toFixed(3)} WIN%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No record</span>
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
