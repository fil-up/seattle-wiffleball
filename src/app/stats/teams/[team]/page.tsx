'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import PlayerBattingData from '@/components/PlayerBattingData'
import PlayerPitchingData from '@/components/PlayerPitchingData'

interface StandingsRecord {
  team: string
  year: string
  wins: number
  losses: number
  pct: number
  rf: number
  ra: number
}

interface TeamInfo {
  id: string
  name: string
  abbreviation: string
  uniqueTeamName: string
  teamCode: string
  logoUrl: string
}

const TeamPage: React.FC = () => {
  const params = useParams()
  const teamSlug = params.team as string
  
  const [teamData, setTeamData] = useState<TeamInfo | null>(null)
  const [yearlyRecords, setYearlyRecords] = useState<StandingsRecord[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [qualifiersOnly, setQualifiersOnly] = useState<boolean>(true)
  const [stale, setStale] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (teamSlug) {
      fetchTeamAndStandings()
    }
  }, [teamSlug])

  const fetchTeamAndStandings = async () => {
    try {
      setLoading(true)

      const [teamsRes, standingsRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/standings?scope=yearly'),
      ])

      if (!teamsRes.ok || !standingsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const teamsResult = await teamsRes.json()
      const standingsResult = await standingsRes.json()

      setStale(teamsResult.stale || standingsResult.stale)

      const teams: TeamInfo[] = teamsResult.data || []
      const team = teams.find(
        (t) => t.abbreviation.toLowerCase() === teamSlug.toLowerCase() || t.id === teamSlug.toLowerCase()
      )

      if (team) {
        setTeamData(team)

        const standings: StandingsRecord[] = standingsResult.data || []
        const teamStandings = standings.filter(
          (s) =>
            s.team === team.name ||
            s.team === team.uniqueTeamName ||
            s.team.toLowerCase().includes(teamSlug.toLowerCase())
        )

        setYearlyRecords(teamStandings)

        const years = [...new Set(teamStandings.map((r) => r.year))].sort(
          (a, b) => parseInt(b) - parseInt(a)
        )
        setAvailableYears(years)
      }
    } catch (err) {
      console.error('Error fetching team data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="text-center py-8">
          <p className="text-red-600">Team not found</p>
        </div>
      </div>
    )
  }

  return (
    <div>

      {stale && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded mb-4 text-sm">
            Data may be outdated — showing last known data while we reconnect.
          </div>
        </div>
      )}

      {/* Team Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 relative">
                <Image
                  src={teamData.logoUrl}
                  alt={`${teamData.name} Logo`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{teamData.name}</h1>
              <p className="text-sm text-gray-500">{teamData.abbreviation}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Yearly Records Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Yearly Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PCT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DIFF</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {yearlyRecords.length > 0 && (
                  <tr className="bg-blue-50 border-b-2 border-blue-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">TOTAL</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, r) => sum + r.wins, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, r) => sum + r.losses, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {(() => {
                        const tw = yearlyRecords.reduce((s, r) => s + r.wins, 0)
                        const tl = yearlyRecords.reduce((s, r) => s + r.losses, 0)
                        return tw + tl > 0 ? (tw / (tw + tl)).toFixed(3) : '0.000'
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, r) => sum + r.rf, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, r) => sum + r.ra, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, r) => sum + r.rf, 0) - yearlyRecords.reduce((sum, r) => sum + r.ra, 0)}
                    </td>
                  </tr>
                )}
                {yearlyRecords.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.wins}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.losses}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(record.pct ?? 0).toFixed(3)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.rf}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.ra}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.rf - record.ra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player Stats Section */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                  Select Year:
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a year</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="qualifiers-only"
                  type="checkbox"
                  checked={qualifiersOnly}
                  onChange={(e) => setQualifiersOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="qualifiers-only" className="ml-2 text-sm text-gray-700">
                  Qualifiers Only
                </label>
              </div>
            </div>
          </div>

          <PlayerBattingData 
            selectedYear={selectedYear}
            selectedTeam={teamData.abbreviation}
            qualifierOnly={qualifiersOnly}
          />

          <PlayerPitchingData 
            selectedYear={selectedYear}
            selectedTeam={teamData.abbreviation}
            qualifierOnly={qualifiersOnly}
          />
        </div>
      </div>
    </div>
  )
}

export default TeamPage
