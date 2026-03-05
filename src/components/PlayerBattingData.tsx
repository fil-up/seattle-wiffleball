'use client'

import React, { useState, useEffect } from 'react'

interface PlayerBattingRow {
  id: string
  playerId: string
  player: { id: string; name: string }
  year: number
  team: string
  games: number
  plateAppearances: number
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
  wrcPlus: number
  teamLogo: string
}

interface PlayerBattingDataProps {
  selectedYear?: string
  selectedTeam?: string
  selectedPlayer?: string
  qualifierOnly?: boolean
}

const PlayerBattingData: React.FC<PlayerBattingDataProps> = ({ 
  selectedYear, 
  selectedTeam, 
  selectedPlayer,
  qualifierOnly = true
}) => {
  const [battingData, setBattingData] = useState<PlayerBattingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableTeams, setAvailableTeams] = useState<string[]>([])

  useEffect(() => {
    if (selectedYear && typeof selectedYear === 'string' && selectedYear.trim() !== '') {
      fetchBattingData()
    } else {
      setLoading(false)
    }
  }, [selectedYear])

  const fetchBattingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/players?type=hitting&scope=yearly')
      
      if (!response.ok) {
        throw new Error('Failed to fetch batting data')
      }

      const result = await response.json()
      const { data, stale: isStale } = result
      setStale(isStale)

      const batting: PlayerBattingRow[] = (data || []).filter(
        (item: PlayerBattingRow) => item.player.name.trim() !== '' && item.team
      )

      setBattingData(batting)

      const years = [...new Set(batting.map((item) => String(item.year)))]
      years.sort((a, b) => parseInt(b) - parseInt(a))
      const teams = [...new Set(batting.map((item) => item.team))]
      teams.sort()
      
      setAvailableYears(years)
      setAvailableTeams(teams)
    } catch (err) {
      console.error('Error fetching batting data:', err)
      setError('Failed to fetch batting data')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = battingData.filter((item) => {
    const yearMatch = !selectedYear || String(item.year) === selectedYear
    const teamMatch = !selectedTeam || item.team === selectedTeam
    const playerMatch = !selectedPlayer || 
      item.player.name.toLowerCase().includes(selectedPlayer.toLowerCase())
    
    const qualifierMatch = !qualifierOnly || (item.wrcPlus && item.wrcPlus > 0)
    
    return yearMatch && teamMatch && playerMatch && qualifierMatch
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
        <span className="ml-2 text-content-secondary">Loading batting data...</span>
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
                onClick={fetchBattingData}
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
        <h2 className="text-xl font-semibold text-content-primary">Player Batting Data</h2>
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
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">PA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">AVG</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">HR</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">RBI</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">OPS</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">wRC+</th>
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
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.plateAppearances}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{(item.avg ?? 0).toFixed(3)}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.homeRuns}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.rbis}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{(item.ops ?? 0).toFixed(3)}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-content-primary">{item.wrcPlus}</td>
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

export default PlayerBattingData
