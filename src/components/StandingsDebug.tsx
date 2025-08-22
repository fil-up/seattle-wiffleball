'use client'

import React, { useState, useEffect } from 'react'

const StandingsDebug: React.FC = () => {
  const [standingsData, setStandingsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<string>('A54:T952')

  useEffect(() => {
    fetchStandingsData()
  }, [selectedRange])

  const fetchStandingsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch standings data from Google Sheets
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=Standings&range=${selectedRange}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch standings data')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      const standings = rows
        .map((row: any) => {
          const cells = row.c || []
          return {
            Team: cells[0]?.v || '',
            Year: cells[1]?.v || '',
            W: cells[2]?.v || '',
            L: cells[3]?.v || '',
            PCT: cells[4]?.v || '',
            RF: cells[14]?.v || '',
            RA: cells[15]?.v || ''
          }
        })
        .filter((item: any) => {
          // Only show rows with valid team data
          return item.Team && item.Team.trim() !== ''
        })
        .slice(0, 50) // Show first 50 rows

      setStandingsData(standings)
    } catch (err) {
      console.error('Error fetching standings data:', err)
      setError('Failed to fetch standings data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading standings data...</span>
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
                onClick={fetchStandingsData}
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
        <h2 className="text-xl font-semibold text-gray-900">Standings Data Debug</h2>
        <p className="text-sm text-gray-600 mt-1">
          Raw data from Standings tab, cells A54:T952 (first 50 rows)
        </p>
        <div className="mt-2 text-sm text-gray-600">
          <p><strong>Total Records:</strong> {standingsData.length}</p>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <label htmlFor="range-select" className="text-sm font-medium text-gray-700">
            Select Range:
          </label>
          <select
            id="range-select"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="A1:T100">A1:T100 (Headers + Early Data)</option>
            <option value="A54:T952">A54:T952 (Current Range)</option>
            <option value="A100:T200">A100:T200 (Alternative Range)</option>
            <option value="A200:T400">A200:T400 (Alternative Range)</option>
            <option value="A400:T600">A400:T600 (Alternative Range)</option>
            <option value="A600:T800">A600:T800 (Alternative Range)</option>
            <option value="A800:T1000">A800:T1000 (Alternative Range)</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PCT</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RF</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {standingsData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.Team}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.Year}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.W}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.L}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.PCT}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.RF}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.RA}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StandingsDebug
