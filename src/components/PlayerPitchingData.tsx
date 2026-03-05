'use client'

import React, { useState, useEffect } from 'react'

interface PlayerPitchingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  year: number
  team: string
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
  oppAvg: number
  teamLogo: string
}

interface PlayerPitchingDataProps {
  selectedYear?: string
  selectedTeam?: string
  selectedPlayer?: string
  qualifierOnly?: boolean
}

const PlayerPitchingData: React.FC<PlayerPitchingDataProps> = ({ 
  selectedYear, 
  selectedTeam, 
  selectedPlayer,
  qualifierOnly = true
}) => {
  const [pitchingData, setPitchingData] = useState<PlayerPitchingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableTeams, setAvailableTeams] = useState<string[]>([])

  useEffect(() => {
    if (selectedYear && typeof selectedYear === 'string' && selectedYear.trim() !== '') {
      fetchPitchingData()
    } else {
      setLoading(false)
    }
  }, [selectedYear])

  const fetchPitchingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/players?type=pitching&scope=yearly')
      
      if (!response.ok) {
        throw new Error('Failed to fetch pitching data')
      }

      const result = await response.json()
      const { data, stale: isStale } = result
      setStale(isStale)

      const pitching: PlayerPitchingRow[] = (data || []).filter(
        (item: PlayerPitchingRow) => item.player.name.trim() !== '' && item.team
      )

      setPitchingData(pitching)

      const years = [...new Set(pitching.map((item) => String(item.year)))]
      years.sort((a, b) => parseInt(b) - parseInt(a))
      const teams = [...new Set(pitching.map((item) => item.team))]
      teams.sort()
      
      setAvailableYears(years)
      setAvailableTeams(teams)
    } catch (err) {
      console.error('Error fetching pitching data:', err)
      setError('Failed to fetch pitching data')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = pitchingData.filter((item) => {
    if (selectedYear && String(item.year) !== selectedYear) return false
    if (selectedTeam && item.team !== selectedTeam) return false
    if (selectedPlayer) {
      if (!item.player.name.toLowerCase().includes(selectedPlayer.toLowerCase())) return false
    }
    if (qualifierOnly && item.era === 0) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
        <span className="ml-2 text-content-secondary">Loading pitching data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchPitchingData}
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card rounded-lg shadow">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-content-primary">Player Pitching Data</h2>
        <div className="mt-2 text-sm text-content-secondary">
          <p><strong>Total Records:</strong> {filteredData.length} | <strong>Available Years:</strong> {availableYears.length} | <strong>Available Teams:</strong> {availableTeams.length}</p>
          {qualifierOnly && (
            <p className="text-brand-navy mt-1">
              <strong>Filter:</strong> Showing qualified players only
            </p>
          )}
        </div>
      </div>

      {stale && (
        <div className="mx-6 mt-4 bg-brand-gold/10 border border-brand-gold/30 text-content-primary px-4 py-2 rounded text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Data may be outdated — showing last known data while we reconnect.
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Year</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Team</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">GP</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">IP</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">W</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">L</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">K</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">BB</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">ERA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">WHIP</th>
            </tr>
          </thead>
          <tbody className="bg-surface-card divide-y divide-border">
            {filteredData.slice(0, 20).map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? '' : 'bg-table-stripe'}>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.year}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-content-primary">
                  {item.player.name}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.team}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.games}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{(item.inningsPitched ?? 0).toFixed(1)}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.wins}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.losses}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.strikeouts}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.walks}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{(item.era ?? 0).toFixed(2)}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{(item.whip ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredData.length > 20 && (
        <div className="px-6 py-4 bg-surface-secondary border-t border-border">
          <p className="text-sm text-content-secondary">
            Showing first 20 of {filteredData.length} records. Use filters to narrow results.
          </p>
        </div>
      )}
    </div>
  )
}

export default PlayerPitchingData
