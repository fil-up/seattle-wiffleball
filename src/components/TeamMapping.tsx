'use client'

import React, { useState, useEffect } from 'react'

interface TeamMappingData {
  uniqueTeams: string
  teamCodes: string
  franchiseCurrentName: string
  franchiseCurrentCode: string
  logoImageName: string
}

const TeamMapping: React.FC = () => {
  const [mappingData, setMappingData] = useState<TeamMappingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamMapping()
  }, [])

  const fetchTeamMapping = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch team mapping data from Google Sheets
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=Player/Team%20Adj&range=O4:S100`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch team mapping data')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      const mapping = rows
        .map((row: any) => {
          const cells = row.c || []
          return {
            uniqueTeams: cells[0]?.v || '',
            teamCodes: cells[1]?.v || '',
            franchiseCurrentName: cells[2]?.v || '',
            franchiseCurrentCode: cells[3]?.v || '',
            logoImageName: cells[4]?.v || ''
          }
        })
        .filter((item: TeamMappingData) => {
          // Only show rows with valid team data
          return item.uniqueTeams && item.uniqueTeams.trim() !== ''
        })

      setMappingData(mapping)
    } catch (err) {
      console.error('Error fetching team mapping:', err)
      setError('Failed to fetch team mapping data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading team mapping data...</span>
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
                onClick={fetchTeamMapping}
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
        <h2 className="text-xl font-semibold text-gray-900">Team Mapping Data</h2>
        <p className="text-sm text-gray-600 mt-1">
          Raw data from "Player/Team Adj" tab, cells O4:S100
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unique Teams
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Codes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Franchise Current Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Franchise Current Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Logo Image Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mappingData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.uniqueTeams}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.teamCodes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.franchiseCurrentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.franchiseCurrentCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.logoImageName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p><strong>Total Teams:</strong> {mappingData.length}</p>
          <p><strong>Data Source:</strong> Player/Team Adj tab, cells O4:S100</p>
        </div>
      </div>
    </div>
  )
}

export default TeamMapping
