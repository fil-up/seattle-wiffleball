'use client'

import React, { useState, useEffect } from 'react'

interface YearlyStandingsRow {
  team: string
  year: string
  wins: number
  losses: number
  pct: number
  rf: number
  ra: number
}

interface AllTimeRow {
  team: string
  wins: number
  losses: number
  pct: number
  rf: number
  ra: number
  runsPerGame: number
  raPerGame: number
  playoffsW: number
  playoffsL: number
  playoffPct: number
  seriesW: number
  seriesL: number
  seriesPct: number
  wsApp: number
  wsWin: number
  rfPlayoffs: number
  raPlayoffs: number
  berth: number
}

const SheetrockStandings: React.FC = () => {
  const [standings, setStandings] = useState<YearlyStandingsRow[]>([])
  const [allTimeStandings, setAllTimeStandings] = useState<AllTimeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'yearly' | 'alltime'>('yearly')

  useEffect(() => {
    fetchStandings()
    fetchAllTimeStandings()
  }, [])

  const fetchStandings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/standings?scope=yearly')
      
      if (!response.ok) {
        throw new Error('Failed to fetch standings data')
      }

      const result = await response.json()
      const { data, stale: isStale } = result
      setStale((prev) => prev || isStale)

      const parsedData: YearlyStandingsRow[] = data || []
      setStandings(parsedData)
      
      const years = [...new Set(parsedData.map((row) => row.year))]
      years.sort((a, b) => parseInt(b) - parseInt(a))
      setAvailableYears(years)
      if (years.length > 0) {
        setSelectedYear(years[0])
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching standings:', err)
      setError('Failed to load standings data')
      setLoading(false)
    }
  }

  const fetchAllTimeStandings = async () => {
    try {
      const response = await fetch('/api/standings?scope=alltime')
      
      if (!response.ok) {
        throw new Error('Failed to fetch all-time standings data')
      }

      const result = await response.json()
      const { data, stale: isStale } = result
      setStale((prev) => prev || isStale)

      const sortedData = (data || []).sort((a: AllTimeRow, b: AllTimeRow) => {
        return (b.pct || 0) - (a.pct || 0)
      })

      setAllTimeStandings(sortedData)
    } catch (err) {
      console.error('Error fetching all-time standings:', err)
    }
  }

  const filteredStandings = standings.filter((row) => String(row.year) === String(selectedYear))

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading standings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchStandings}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {stale && (
        <div className="mx-6 mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded text-sm">
          Data may be outdated — showing last known data while we reconnect.
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('yearly')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'yearly'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => setActiveTab('alltime')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alltime'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Time
          </button>
        </nav>
      </div>

      {/* Yearly Standings Tab */}
      {activeTab === 'yearly' && (
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Year:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PCT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DIFF</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStandings.map((row, index) => {
                  const runDiff = row.rf - row.ra
                  const displayPct = row.pct !== null ? row.pct.toFixed(3) : (row.wins + row.losses > 0 ? (row.wins / (row.wins + row.losses)).toFixed(3) : '0.000')
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.team}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.wins}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.losses}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{displayPct}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.rf}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ra}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{runDiff}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Time Standings Tab */}
      {activeTab === 'alltime' && (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REGULAR SEASON RECORD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REGULAR SEASON WIN PCT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">R/G</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA/G</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLAYOFF BERTHS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLAYOFF RECORD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLAYOFF SERIES RECORD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WS RECORD</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allTimeStandings.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-4 text-center text-gray-500">
                      No all-time standings data available
                    </td>
                  </tr>
                ) : (
                  allTimeStandings.map((row, index) => {
                    const playoffRecord = (row.playoffsW > 0 || row.playoffsL > 0) ? `${row.playoffsW}-${row.playoffsL}` : '0-0'
                    const seriesRecord = (row.seriesW > 0 || row.seriesL > 0) ? `${row.seriesW}-${row.seriesL}` : '0-0'
                    const wsRecord = row.wsApp > 0 ? `${row.wsWin}-${row.wsApp - row.wsWin}` : '0-0'
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.team}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.wins}-{row.losses}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.pct.toFixed(3)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.rf}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ra}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.runsPerGame.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.raPerGame.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.berth}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{playoffRecord}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seriesRecord}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{wsRecord}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default SheetrockStandings
