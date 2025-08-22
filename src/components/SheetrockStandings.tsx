'use client'

import React, { useState, useEffect } from 'react'

interface StandingsRow {
  Teams: string
  Year: string
  W: string
  L: string
  PCT: string
  RF: string
  RA: string
}

interface AllTimeRow {
  Teams: string
  W: string
  L: string
  PCT: string
  Berth: string
  PlayoffsW: string
  PlayoffsL: string
  PlayoffPCT: string
  SeriesW: string
  SeriesL: string
  SeriesPCT: string
  WSAPP: string
  WSWin: string
  RF: string
  RA: string
  RFPlayoffs: string
  RAPlayoffs: string
  RunsPerGame: string
  RAPerGame: string
}

const SheetrockStandings: React.FC = () => {
  const [standings, setStandings] = useState<StandingsRow[]>([])
  const [allTimeStandings, setAllTimeStandings] = useState<AllTimeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=Standings&range=A54:T952`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch standings data')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      const parsedData: StandingsRow[] = rows.map((row: any) => {
        const cells = row.c || []
        return {
          Teams: cells[0]?.v || '',
          Year: cells[1]?.v || '',
          W: cells[2]?.v || '0',
          L: cells[3]?.v || '0',
          PCT: cells[4]?.v || '',
          RF: cells[14]?.v || '0', // RF column (O) - 0-indexed so O=14
          RA: cells[15]?.v || '0', // RA column (P) - 0-indexed so P=15
        }
      }).filter((row: StandingsRow) => row.Teams && row.Year && row.Teams.trim() !== '')

      setStandings(parsedData)
      
      // Extract unique years and set default to most recent
      const years = [...new Set(parsedData.map(row => row.Year))].sort((a, b) => parseInt(b) - parseInt(a))
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
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=Standings&range=B1:T49`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch all-time standings data')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      const allTimeRows = rows
        .map((row: any) => {
          const cells = row.c || []
          return {
            Teams: cells[0]?.v || '',
            W: cells[1]?.v ? Math.round(parseFloat(cells[1].v)).toString() : '0',
            L: cells[2]?.v ? Math.round(parseFloat(cells[2].v)).toString() : '0',
            PCT: cells[3]?.v ? parseFloat(cells[3].v).toFixed(3) : '0.000',
            RF: cells[4]?.v ? Math.round(parseFloat(cells[4].v)).toString() : '0',
            RA: cells[5]?.v ? Math.round(parseFloat(cells[5].v)).toString() : '0',
            RunsPerGame: cells[6]?.v ? parseFloat(cells[6].v).toFixed(2) : '0.00',
            RAPerGame: cells[7]?.v ? parseFloat(cells[7].v).toFixed(2) : '0.00',
            PlayoffsW: cells[8]?.v ? Math.round(parseFloat(cells[8].v)).toString() : '0',
            PlayoffsL: cells[9]?.v ? Math.round(parseFloat(cells[9].v)).toString() : '0',
            PlayoffPCT: cells[10]?.v ? parseFloat(cells[10].v).toFixed(3) : '0.000',
            SeriesW: cells[11]?.v ? Math.round(parseFloat(cells[11].v)).toString() : '0',
            SeriesL: cells[12]?.v ? Math.round(parseFloat(cells[12].v)).toString() : '0',
            SeriesPCT: cells[13]?.v ? parseFloat(cells[13].v).toFixed(3) : '0.000',
            WSAPP: cells[14]?.v ? Math.round(parseFloat(cells[14].v)).toString() : '0',
            WSWin: cells[15]?.v ? Math.round(parseFloat(cells[15].v)).toString() : '0',
            RFPlayoffs: cells[16]?.v ? Math.round(parseFloat(cells[16].v)).toString() : '0',
            RAPlayoffs: cells[17]?.v ? Math.round(parseFloat(cells[17].v)).toString() : '0',
            Berth: cells[18]?.v ? Math.round(parseFloat(cells[18].v)).toString() : '0'
          }
        })
      
      const filteredData = allTimeRows.filter((row: AllTimeRow) => {
        return row.Teams && row.Teams.trim() !== '' && row.Teams !== '-' && row.Teams !== '~'
      })

      // Sort by win percentage (highest first)
      const sortedData = filteredData.sort((a: AllTimeRow, b: AllTimeRow) => {
        const aPct = parseFloat(a.PCT) || 0
        const bPct = parseFloat(b.PCT) || 0
        return bPct - aPct
      })

      setAllTimeStandings(sortedData)
    } catch (err) {
      console.error('Error fetching all-time standings:', err)
      // Don't set error state for all-time data as it's secondary
    }
  }

  const filteredStandings = standings.filter(row => String(row.Year) === String(selectedYear))

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading standings from Google Sheets...</span>
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
                  const wins = parseInt(row.W) || 0
                  const losses = parseInt(row.L) || 0
                  const runsFor = parseInt(row.RF) || 0
                  const runsAgainst = parseInt(row.RA) || 0
                  const runDiff = runsFor - runsAgainst
                  
                  // Format PCT as percentage, fallback to calculated if not provided
                  const pctValue = row.PCT ? parseFloat(row.PCT) : null
                  const displayPct = pctValue !== null ? pctValue.toFixed(3) : (wins + losses > 0 ? (wins / (wins + losses)).toFixed(3) : '0.000')
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.Teams}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{wins}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{losses}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{displayPct}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{runsFor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{runsAgainst}</td>
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
                    const wins = Math.round(parseFloat(row.W) || 0)
                    const losses = Math.round(parseFloat(row.L) || 0)
                    const playoffWins = Math.round(parseFloat(row.PlayoffsW) || 0)
                    const playoffLosses = Math.round(parseFloat(row.PlayoffsL) || 0)
                    const seriesWins = Math.round(parseFloat(row.SeriesW) || 0)
                    const seriesLosses = Math.round(parseFloat(row.SeriesL) || 0)
                    const wsAppearances = Math.round(parseFloat(row.WSAPP) || 0)
                    const wsWins = Math.round(parseFloat(row.WSWin) || 0)
                    const runsFor = Math.round(parseFloat(row.RF) || 0)
                    const runsAgainst = Math.round(parseFloat(row.RA) || 0)
                    
                    // Format PCT as percentage, fallback to calculated if not provided
                    const pctValue = row.PCT ? parseFloat(row.PCT) : null
                    const displayPct = pctValue !== null ? pctValue.toFixed(3) : (wins + losses > 0 ? (wins / (wins + losses)).toFixed(3) : '0.000')
                    
                    // Format playoff and series records - handle 0 values properly
                    const playoffRecord = (playoffWins > 0 || playoffLosses > 0) ? `${playoffWins}-${playoffLosses}` : '0-0'
                    const seriesRecord = (seriesWins > 0 || seriesLosses > 0) ? `${seriesWins}-${seriesLosses}` : '0-0'
                    
                    // Fix WS record calculation: "WS Win - (WS APP - WS Win)" - handle 0 values
                    const wsRecord = wsAppearances > 0 ? `${wsWins}-${wsAppearances - wsWins}` : '0-0'
                    
                    // Format per game stats to 2 decimal places
                    const runsPerGame = row.RunsPerGame ? parseFloat(row.RunsPerGame).toFixed(2) : '0.00'
                    const raPerGame = row.RAPerGame ? parseFloat(row.RAPerGame).toFixed(2) : '0.00'
                    
                    // Format playoff berths as integer - handle 0 values
                    const playoffBerths = row.Berth ? Math.round(parseFloat(row.Berth)).toString() : '0'
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.Teams}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{wins}-{losses}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{displayPct}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{runsFor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{runsAgainst}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{runsPerGame}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{raPerGame}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{playoffBerths}</td>
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
