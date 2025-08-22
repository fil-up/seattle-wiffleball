'use client'

import React, { useState, useEffect } from 'react'

interface PlayerBattingData {
  Year: string
  NameID: string
  First: string
  Last: string
  Team: string
  Season: string
  AVG: string
  GP: string
  PA: string
  AB: string
  R: string
  H: string
  '2B': string
  '3B': string
  HR: string
  RBI: string
  BB: string
  K: string
  IBB: string
  SF: string
  TB: string
  OBP: string
  SLG: string
  OPS: string
  'K PCT': string
  'BB PCT': string
  CONTACT: string
  'AB/HR': string
  'OPS+': string
  ISO: string
  BABIP: string
  wOBA: string
  wRAA: string
  wRC: string
  'wRC+': string
  'wRC+ Percentile': string
  'wOBA (Num)': string
  'wOBA (Den)': string
  'OPS+*PAs': string
  'wRAA*PAs': string
  'wRC*PAs': string
  'wRC+*PAs': string
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
  const [battingData, setBattingData] = useState<PlayerBattingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableTeams, setAvailableTeams] = useState<string[]>([])

  useEffect(() => {
    console.log('PlayerBattingData: selectedYear changed to:', selectedYear)
    if (selectedYear && typeof selectedYear === 'string' && selectedYear.trim() !== '') {
      console.log('PlayerBattingData: Fetching data for year:', selectedYear)
      fetchBattingData()
    } else {
      // If no year selected, don't show loading state
      setLoading(false)
    }
  }, [selectedYear])

  const fetchBattingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch batting data from Google Sheets IH tab
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=IH&range=A700:AP2000`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch batting data')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      const batting = rows
        .map((row: any) => {
          const cells = row.c || []
          return {
            Year: cells[0]?.v || '',
            NameID: cells[1]?.v || '',
            First: cells[2]?.v || '',
            Last: cells[3]?.v || '',
            Team: cells[4]?.v || '',
            Season: cells[5]?.v || '',
            AVG: cells[6]?.v ? parseFloat(cells[6].v).toFixed(3) : '0.000',
            GP: cells[7]?.v ? Math.round(parseFloat(cells[7].v)).toString() : '0',
            PA: cells[8]?.v ? Math.round(parseFloat(cells[8].v)).toString() : '0',
            AB: cells[9]?.v ? Math.round(parseFloat(cells[9].v)).toString() : '0',
            R: cells[10]?.v ? Math.round(parseFloat(cells[10].v)).toString() : '0',
            H: cells[11]?.v ? Math.round(parseFloat(cells[11].v)).toString() : '0',
            '2B': cells[12]?.v ? Math.round(parseFloat(cells[12].v)).toString() : '0',
            '3B': cells[13]?.v ? Math.round(parseFloat(cells[13].v)).toString() : '0',
            HR: cells[14]?.v ? Math.round(parseFloat(cells[14].v)).toString() : '0',
            RBI: cells[15]?.v ? Math.round(parseFloat(cells[15].v)).toString() : '0',
            BB: cells[16]?.v ? Math.round(parseFloat(cells[16].v)).toString() : '0',
            K: cells[17]?.v ? Math.round(parseFloat(cells[17].v)).toString() : '0',
            IBB: cells[18]?.v ? Math.round(parseFloat(cells[18].v)).toString() : '0',
            SF: cells[19]?.v ? Math.round(parseFloat(cells[19].v)).toString() : '0',
            TB: cells[20]?.v ? Math.round(parseFloat(cells[20].v)).toString() : '0',
            OBP: cells[21]?.v ? parseFloat(cells[21].v).toFixed(3) : '0.000',
            SLG: cells[22]?.v ? parseFloat(cells[22].v).toFixed(3) : '0.000',
            OPS: cells[23]?.v ? parseFloat(cells[23].v).toFixed(3) : '0.000',
            'K PCT': cells[24]?.v ? parseFloat(cells[24].v).toFixed(3) : '0.000',
            'BB PCT': cells[25]?.v ? parseFloat(cells[25].v).toFixed(3) : '0.000',
            CONTACT: cells[26]?.v ? parseFloat(cells[26].v).toFixed(3) : '0.000',
            'AB/HR': cells[27]?.v ? parseFloat(cells[27].v).toFixed(1) : '0.0',
            'OPS+': cells[28]?.v ? Math.round(parseFloat(cells[28].v)).toString() : '0',
            ISO: cells[29]?.v ? parseFloat(cells[29].v).toFixed(3) : '0.000',
            BABIP: cells[30]?.v ? parseFloat(cells[30].v).toFixed(3) : '0.000',
            wOBA: cells[31]?.v ? parseFloat(cells[31].v).toFixed(3) : '0.000',
            wRAA: cells[32]?.v ? parseFloat(cells[32].v).toFixed(1) : '0.0',
            wRC: cells[33]?.v ? parseFloat(cells[33].v).toFixed(1) : '0.0',
            'wRC+': cells[34]?.v ? Math.round(parseFloat(cells[34].v)).toString() : '0',
            'wRC+ Percentile': cells[35]?.v || '0',
            'wOBA (Num)': cells[36]?.v ? parseFloat(cells[36].v).toFixed(1) : '0.0',
            'wOBA (Den)': cells[37]?.v ? parseFloat(cells[37].v).toFixed(1) : '0.0',
            'OPS+*PAs': cells[38]?.v ? parseFloat(cells[38].v).toFixed(1) : '0.0',
            'wRAA*PAs': cells[39]?.v ? parseFloat(cells[39].v).toFixed(1) : '0.0',
            'wRC*PAs': cells[40]?.v ? parseFloat(cells[40].v).toFixed(1) : '0.0',
            'wRC+*PAs': cells[41]?.v ? parseFloat(cells[41].v).toFixed(1) : '0.0'
          }
        })
        .filter((item: PlayerBattingData) => {
          // Only show rows with valid player data
          return item.First && item.Last && item.Team
        })

      setBattingData(batting)

      // Extract unique years and teams
      const years = [...new Set(batting.map(item => item.Year))].sort((a, b) => parseInt(b) - parseInt(a))
      const teams = [...new Set(batting.map(item => item.Team))].sort()
      
      setAvailableYears(years)
      setAvailableTeams(teams)

    } catch (err) {
      console.error('Error fetching batting data:', err)
      setError('Failed to fetch batting data')
    } finally {
      setLoading(false)
    }
  }

  // Filter data based on props
  const filteredData = battingData.filter((item) => {
    const yearMatch = !selectedYear || item.Year === selectedYear
    const teamMatch = !selectedTeam || item.Team === selectedTeam
    const playerMatch = !selectedPlayer || 
      item.First.toLowerCase().includes(selectedPlayer.toLowerCase()) ||
      item.Last.toLowerCase().includes(selectedPlayer.toLowerCase())
    
    // Apply qualifier filter if enabled
    const qualifierMatch = !qualifierOnly || item['wRC+ Percentile'] !== 'Non-qualifier'
    
    return yearMatch && teamMatch && playerMatch && qualifierMatch
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading batting data...</span>
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Player Batting Data</h2>
        <p className="text-sm text-gray-600 mt-1">
          Data from IH tab, cells A700:AP2000
        </p>
        <div className="mt-2 text-sm text-gray-600">
          <p><strong>Total Records:</strong> {filteredData.length} | <strong>Available Years:</strong> {availableYears.length} | <strong>Available Teams:</strong> {availableTeams.length}</p>
          {qualifierOnly && (
            <p className="text-blue-600 mt-1">
              <strong>Filter:</strong> Showing qualified players only (excludes "Non-qualifier" in wRC+ Percentile)
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
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AVG</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HR</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RBI</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OPS</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">wRC+</th>
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
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.PA}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.AVG}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.HR}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.RBI}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.OPS}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item['wRC+']}</td>
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

export default PlayerBattingData
