"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageNavigation from '@/components/PageNavigation'
import SeasonAccordion from '@/components/SeasonAccordion'
import archivesData from '@/data/archives.json'

interface YearlyStanding {
  team: string
  year: string
  wins: number
  losses: number
  pct: number
  rf: number
  ra: number
}

interface ArchiveSeason {
  year: number
  champion: string
  runnerUp: string
  mvp: string | null
  cyYoung: string | null
  battingChamp: string | null
  homeRunLeader: string | null
  notes: string | null
}

export default function ArchivesPage() {
  const [standings, setStandings] = useState<Record<string, YearlyStanding[]>>({})
  const [loading, setLoading] = useState(true)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    fetch('/api/standings?scope=yearly')
      .then((res) => res.json())
      .then((json) => {
        const grouped: Record<string, YearlyStanding[]> = {}
        for (const row of json.data ?? []) {
          const yr = row.year
          if (!grouped[yr]) grouped[yr] = []
          grouped[yr].push(row)
        }
        for (const yr of Object.keys(grouped)) {
          grouped[yr].sort((a: YearlyStanding, b: YearlyStanding) => b.pct - a.pct)
        }
        setStandings(grouped)
        setStale(json.stale ?? false)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const archives = (archivesData as ArchiveSeason[]).sort(
    (a, b) => b.year - a.year
  )

  const allYears = Array.from(
    new Set([
      ...archives.map((a) => a.year),
      ...Object.keys(standings).map(Number),
    ])
  ).sort((a, b) => b - a)

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation />
      <div className="bg-[#25397B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Archives</h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Season history and results since 2015
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-4">
          {stale && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm mb-4">
              Showing cached data — live results may differ.
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading season data...
            </div>
          ) : allYears.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No archive data available yet.
            </div>
          ) : (
            allYears.map((year, idx) => {
              const archive = archives.find((a) => a.year === year)
              const yearStandings = standings[String(year)]
              const champion = archive?.champion ?? 'Unknown'

              const awards = archive
                ? [
                    archive.mvp && { label: 'MVP', value: archive.mvp },
                    archive.cyYoung && {
                      label: 'Cy Young',
                      value: archive.cyYoung,
                    },
                    archive.battingChamp && {
                      label: 'Batting Champion',
                      value: archive.battingChamp,
                    },
                    archive.homeRunLeader && {
                      label: 'Home Run Leader',
                      value: archive.homeRunLeader,
                    },
                  ].filter(Boolean) as { label: string; value: string }[]
                : []

              return (
                <SeasonAccordion
                  key={year}
                  year={year}
                  champion={champion}
                  defaultOpen={idx === 0}
                >
                  {awards.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Awards
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {awards.map((award) => (
                          <div key={award.label} className="text-sm">
                            <span className="font-medium text-gray-700">
                              {award.label}:
                            </span>{' '}
                            <span className="text-gray-900">{award.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {yearStandings && yearStandings.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Standings
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="text-left py-2 pr-4 font-semibold text-gray-700">
                                Team
                              </th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">
                                W
                              </th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">
                                L
                              </th>
                              <th className="text-right py-2 pl-2 font-semibold text-gray-700">
                                PCT
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {yearStandings.map((s) => (
                              <tr
                                key={s.team}
                                className="border-b border-gray-100"
                              >
                                <td className="py-1.5 pr-4 text-gray-900">
                                  {s.team}
                                </td>
                                <td className="py-1.5 px-2 text-right text-gray-700">
                                  {s.wins}
                                </td>
                                <td className="py-1.5 px-2 text-right text-gray-700">
                                  {s.losses}
                                </td>
                                <td className="py-1.5 pl-2 text-right text-gray-700">
                                  {s.pct.toFixed(3)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No standings data available for this season.
                    </p>
                  )}

                  <div className="mt-4">
                    <Link
                      href={`/stats/teams?year=${year}`}
                      className="text-sm text-[#25397B] font-medium hover:text-[#1e2f63] transition-colors"
                    >
                      View full {year} stats →
                    </Link>
                  </div>
                </SeasonAccordion>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
