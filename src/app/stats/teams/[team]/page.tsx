'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import PlayerBattingData from '@/components/PlayerBattingData'
import PlayerPitchingData from '@/components/PlayerPitchingData'
import PageNavigation from '@/components/PageNavigation'

interface TeamRecord {
  Seasons: string
  W: string
  L: string
  PCT: string
  RF: string
  RA: string
  RunsPerGame: string
  RAPerGame: string
  PlayoffsW: string
  PlayoffL: string
  PlayoffPCT: string
}

const TeamPage: React.FC = () => {
  const params = useParams()
  const teamSlug = params.team as string
  
  const [teamData, setTeamData] = useState<any>(null)
  const [yearlyRecords, setYearlyRecords] = useState<TeamRecord[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [qualifiersOnly, setQualifiersOnly] = useState<boolean>(true)

  useEffect(() => {
    if (teamSlug) {
      fetchTeamData()
      fetchYearlyRecords()
    }
  }, [teamSlug])

  const fetchTeamData = async () => {
    try {
      // Fetch team info from Google Sheets
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=Player/Team%20Adj&range=O4:S100`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch team data')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      const teamRow = rows.find((row: any) => {
        const cells = row.c || []
        const franchiseCode = cells[3]?.v || ''
        return franchiseCode.toLowerCase() === teamSlug.toLowerCase()
      })

      if (teamRow) {
        const cells = teamRow.c || []
        setTeamData({
          name: cells[2]?.v || '',
          abbreviation: cells[3]?.v || '',
          uniqueTeamName: cells[0]?.v || '',
          teamCode: cells[1]?.v || '',
          logo: cells[4]?.v || '',
          photo: '', // We'll add this later if needed
          bio: '' // We'll add this later if needed
        })
      }
    } catch (err) {
      console.error('Error fetching team data:', err)
    }
  }

  const fetchYearlyRecords = async () => {
    try {
      // Fetch yearly records from the standings data
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1bkQNmqFBqBqyqwo5vtNZHSDYTwvU1_WSsfE2GlBd3Ek/gviz/tq?tqx=out:json&sheet=Standings&range=A54:T952`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch yearly records')
      }

      const text = await response.text()
      const jsonText = text.substring(47).slice(0, -2)
      const data = JSON.parse(jsonText)

      const rows = data.table.rows || []
      
      // Find rows that contain the specific team
      const teamRecords = rows
                 .map((row: any) => {
           const cells = row.c || []
           const teamName = cells[0]?.v || '' // Column A - Team name
           const year = cells[1]?.v || '' // Column B - Year
           const wins = cells[2]?.v || '0' // Column C - Wins
           const losses = cells[3]?.v || '0' // Column D - Losses
           const pct = cells[4]?.v || '' // Column E - PCT
           const runsFor = cells[14]?.v || '0' // Column O - RF
           const runsAgainst = cells[15]?.v || '0' // Column P - RA
           const playoffWins = cells[6]?.v || '0' // Column G - Playoff Wins
           const playoffLosses = cells[7]?.v || '0' // Column H - Playoff Losses
           
           // Debug: Log playoff data for first few rows
           if (teamName.toLowerCase().includes(teamSlug.toLowerCase())) {
             console.log(`Team: ${teamName}, Year: ${year}, Playoff W: ${playoffWins}, Playoff L: ${playoffLosses}`)
             console.log('Raw cells data:', cells.map((cell: any, index: number) => `${index}:${cell?.v}`))
           }
           
           return {
             teamName,
             year,
             wins,
             losses,
             pct,
             runsFor,
             runsAgainst,
             playoffWins,
             playoffLosses
           }
         })
        .filter((record: any) => {
          // Filter for the specific team - check if team name contains the team abbreviation
          return record.teamName && 
                 record.year && 
                 record.teamName.toLowerCase().includes(teamSlug.toLowerCase())
        })

             // Group by year and calculate totals
       const yearlyData = teamRecords.reduce((acc: any, record: any) => {
         const year = record.year
         if (!acc[year]) {
           acc[year] = {
             Seasons: year,
             W: 0,
             L: 0,
             RF: 0,
             RA: 0,
             PlayoffsW: 0,
             PlayoffL: 0
           }
         }
         acc[year].W += parseInt(record.wins) || 0
         acc[year].L += parseInt(record.losses) || 0
         acc[year].RF += parseInt(record.runsFor) || 0
         acc[year].RA += parseInt(record.runsAgainst) || 0
         acc[year].PlayoffsW += parseInt(record.playoffWins) || 0
         acc[year].PlayoffL += parseInt(record.playoffLosses) || 0
         return acc
       }, {})

             const formattedRecords = Object.values(yearlyData).map((yearData: any) => {
         const wins = yearData.W
         const losses = yearData.L
         const playoffWins = yearData.PlayoffsW
         const playoffLosses = yearData.PlayoffL
         
         const pct = wins + losses > 0 ? (wins / (wins + losses)).toFixed(3) : '0.000'
         const runsPerGame = wins + losses > 0 ? (yearData.RF / (wins + losses)).toFixed(2) : '0.00'
         const raPerGame = wins + losses > 0 ? (yearData.RA / (wins + losses)).toFixed(2) : '0.00'
         const playoffPct = playoffWins + playoffLosses > 0 ? (playoffWins / (playoffWins + playoffLosses)).toFixed(3) : '0.000'

         return {
           Seasons: yearData.Seasons,
           W: wins.toString(),
           L: losses.toString(),
           PCT: pct,
           RF: yearData.RF.toString(),
           RA: yearData.RA.toString(),
           RunsPerGame: runsPerGame,
           RAPerGame: raPerGame,
           PlayoffsW: playoffWins.toString(),
           PlayoffL: playoffLosses.toString(),
           PlayoffPCT: playoffPct
         }
       })

             console.log('Team Records Found:', teamRecords)
       console.log('Yearly Data:', yearlyData)
       console.log('Formatted Records:', formattedRecords)
       
       // Debug: Check playoff data specifically
       console.log('Playoff Data Check:')
       Object.entries(yearlyData).forEach(([year, data]: [string, any]) => {
         console.log(`Year ${year}: Playoff W: ${data.PlayoffsW}, Playoff L: ${data.PlayoffL}`)
       })

      setYearlyRecords(formattedRecords)
      
             // Set available years but don't set a default year
       const years = formattedRecords.map(r => r.Seasons).sort((a, b) => parseInt(b) - parseInt(a))
       setAvailableYears(years)
       // Don't set a default year - let user select from dropdown
    } catch (err) {
      console.error('Error fetching yearly records:', err)
    }
  }

  if (!teamData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Team not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation />
      {/* Team Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Team Logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 relative">
                <Image
                  src={`/images/teams/${teamData.logo}`}
                  alt={`${teamData.name} Logo`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Team Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{teamData.name}</h1>
              {teamData.bio && (
                <p className="text-lg text-gray-600 max-w-3xl">{teamData.bio}</p>
              )}
            </div>

            {/* Team Photo */}
            {teamData.photo && (
              <div className="flex-shrink-0">
                <div className="w-48 h-32 relative rounded-lg overflow-hidden">
                  <Image
                    src={`/images/teams/${teamData.photo}`}
                    alt={`${teamData.name} Team Photo`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seasons</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PCT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runs/Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA/Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Playoffs W</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Playoff L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Playoff PCT</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Totals Row */}
                {yearlyRecords.length > 0 && (
                  <tr className="bg-blue-50 border-b-2 border-blue-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">TOTAL</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, record) => sum + parseInt(record.W), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, record) => sum + parseInt(record.L), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {(() => {
                        const totalW = yearlyRecords.reduce((sum, record) => sum + parseInt(record.W), 0)
                        const totalL = yearlyRecords.reduce((sum, record) => sum + parseInt(record.L), 0)
                        return totalW + totalL > 0 ? (totalW / (totalW + totalL)).toFixed(3) : '0.000'
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, record) => sum + parseInt(record.RF), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, record) => sum + parseInt(record.RA), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {(() => {
                        const totalW = yearlyRecords.reduce((sum, record) => sum + parseInt(record.W), 0)
                        const totalL = yearlyRecords.reduce((sum, record) => sum + parseInt(record.L), 0)
                        const totalRF = yearlyRecords.reduce((sum, record) => sum + parseInt(record.RF), 0)
                        return totalW + totalL > 0 ? (totalRF / (totalW + totalL)).toFixed(2) : '0.00'
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {(() => {
                        const totalW = yearlyRecords.reduce((sum, record) => sum + parseInt(record.W), 0)
                        const totalL = yearlyRecords.reduce((sum, record) => sum + parseInt(record.L), 0)
                        const totalRA = yearlyRecords.reduce((sum, record) => sum + parseInt(record.RA), 0)
                        return totalW + totalL > 0 ? (totalRA / (totalW + totalL)).toFixed(2) : '0.00'
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, record) => sum + parseInt(record.PlayoffsW), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {yearlyRecords.reduce((sum, record) => sum + parseInt(record.PlayoffL), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      {(() => {
                        const totalPW = yearlyRecords.reduce((sum, record) => sum + parseInt(record.PlayoffsW), 0)
                        const totalPL = yearlyRecords.reduce((sum, record) => sum + parseInt(record.PlayoffL), 0)
                        return totalPW + totalPL > 0 ? (totalPW / (totalPW + totalPL)).toFixed(3) : '0.000'
                      })()}
                    </td>
                  </tr>
                )}
                {/* Individual Year Rows */}
                {yearlyRecords.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.Seasons}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.W}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.L}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.PCT}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.RF}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.RA}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.RunsPerGame}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.RAPerGame}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.PlayoffsW}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.PlayoffL}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.PlayoffPCT}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player Stats Section */}
        <div className="space-y-8">
          {/* Year Selection and Qualifier Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              {/* Year Selection */}
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
              
              {/* Qualifier Filter */}
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

          {/* Batting Stats */}
          <PlayerBattingData 
            selectedYear={selectedYear}
            selectedTeam={teamData.abbreviation}
            qualifierOnly={qualifiersOnly}
          />

          {/* Pitching Stats */}
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
