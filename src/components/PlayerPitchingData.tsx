'use client'

import React, { useState, useEffect } from 'react'

interface PlayerPitchingData {
  Year: string
  NameID: string
  First: string
  Last: string
  Team: string
  YearTeam: string
  GP: string
  GS: string
  IP: string
  R: string
  ER: string
  H: string
  BB: string
  IBB: string
  K: string
  CG: string
  W: string
  L: string
  S: string
  HLD: string
  ERA: string
  WHIP: string
  'K PCT': string
  'BB PCT': string
  'K/BB': string
  'OPP AVG': string
  'ERA Percentile': string
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
  const [pitchingData, setPitchingData] = useState<PlayerPitchingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableTeams, setAvailableTeams] = useState<string[]>([])

  useEffect(() => {
    console.log('PlayerPitchingData: selectedYear changed to:', selectedYear)
    if (selectedYear && typeof selectedYear === 'string' && selectedYear.trim() !== '') {
      console.log('PlayerPitchingData: Fetching data for year:', selectedYear)
      fetchPitchingData()
    } else {
      // If no year selected, don't show loading state
      setLoading(false)
    }
  }, [selectedYear])

  const fetchPitchingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch pitching data from Google Sheets IP tab
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=IP&range=A300:AA999`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch pitching data')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      const pitching = rows
        .map((row: any) => {
          const cells = row.c || []
          return {
            Year: cells[0]?.v || '',
            NameID: cells[1]?.v || '',
            First: cells[2]?.v || '',
            Last: cells[3]?.v || '',
            Team: cells[4]?.v || '',
            YearTeam: cells[5]?.v || '',
            GP: cells[6]?.v ? Math.round(parseFloat(cells[6].v)).toString() : '0',
            GS: cells[7]?.v ? Math.round(parseFloat(cells[7].v)).toString() : '0',
            IP: cells[8]?.v ? parseFloat(cells[8].v).toFixed(1) : '0.0',
            R: cells[9]?.v ? Math.round(parseFloat(cells[9].v)).toString() : '0',
            ER: cells[10]?.v ? Math.round(parseFloat(cells[10].v)).toString() : '0',
            H: cells[11]?.v ? Math.round(parseFloat(cells[11].v)).toString() : '0',
            BB: cells[12]?.v ? Math.round(parseFloat(cells[12].v)).toString() : '0',
            IBB: cells[13]?.v ? Math.round(parseFloat(cells[13].v)).toString() : '0',
            K: cells[14]?.v ? Math.round(parseFloat(cells[14].v)).toString() : '0',
            CG: cells[15]?.v ? Math.round(parseFloat(cells[15].v)).toString() : '0',
            W: cells[16]?.v ? Math.round(parseFloat(cells[16].v)).toString() : '0',
            L: cells[17]?.v ? Math.round(parseFloat(cells[17].v)).toString() : '0',
            S: cells[18]?.v ? Math.round(parseFloat(cells[18].v)).toString() : '0',
            HLD: cells[19]?.v ? Math.round(parseFloat(cells[19].v)).toString() : '0',
            ERA: cells[20]?.v ? parseFloat(cells[20].v).toFixed(2) : '0.00',
            WHIP: cells[21]?.v ? parseFloat(cells[21].v).toFixed(2) : '0.00',
            'K PCT': cells[22]?.v ? parseFloat(cells[22].v).toFixed(3) : '0.000',
            'BB PCT': cells[23]?.v ? parseFloat(cells[23].v).toFixed(3) : '0.000',
            'K/BB': cells[24]?.v ? parseFloat(cells[24].v).toFixed(2) : '0.00',
            'OPP AVG': cells[25]?.v ? parseFloat(cells[25].v).toFixed(3) : '0.000',
            'ERA Percentile': cells[26]?.v || '0'
          }
        })
        .filter((item: PlayerPitchingData) => {
          // Only show rows with valid player data
          return item.First && item.Last && item.Team
        })

      setPitchingData(pitching)

      // Extract unique years and teams
      const years = [...new Set(pitching.map(item => item.Year))].sort((a, b) => parseInt(b) - parseInt(a))
      const teams = [...new Set(pitching.map(item => item.Team))].sort()
      
      setAvailableYears(years)
      setAvailableTeams(teams)

    } catch (err) {
      console.error('Error fetching pitching data:', err)
      setError('Failed to fetch pitching data')
    } finally {
      setLoading(false)
    }
  }

  // Filter data based on props
  const filteredData = pitchingData.filter(item => {
    if (selectedYear && item.Year !== selectedYear) return false
    if (selectedTeam && item.Team !== selectedTeam) return false
    if (selectedPlayer) {
      const fullName = `${item.First} ${item.Last}`.toLowerCase()
      if (!fullName.includes(selectedPlayer.toLowerCase())) return false
    }
    
    // Apply qualifier filter if enabled
    if (qualifierOnly && item['ERA Percentile'] === 'Non-qualifier') return false
    
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading pitching data...</span>
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Player Pitching Data</h2>
        <p className="text-sm text-gray-600 mt-1">
          Data from IP tab, cells A300:AA999
        </p>
        <div className="mt-2 text-sm text-gray-600">
          <p><strong>Total Records:</strong> {filteredData.length} | <strong>Available Years:</strong> {availableYears.length} | <strong>Available Teams:</strong> {availableTeams.length}</p>
          {qualifierOnly && (
            <p className="text-blue-600 mt-1">
              <strong>Filter:</strong> Showing qualified players only (excludes "Non-qualifier" in ERA Percentile)
            </p>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GP</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GS</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">K</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BB</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WHIP</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.slice(0, 20).map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.Year}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.First} {item.Last}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.Team}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.GP}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.GS}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.IP}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.W}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.L}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.K}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.BB}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.ERA}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.WHIP}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredData.length > 20 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing first 20 of {filteredData.length} records. Use filters to narrow results.
          </p>
        </div>
      )}
    </div>
  )
}

export default PlayerPitchingData
