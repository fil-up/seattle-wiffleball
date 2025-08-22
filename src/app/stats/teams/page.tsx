'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import StatsFilter from '@/components/StatsFilter'
import SheetrockStandings from '@/components/SheetrockStandings'
import PageNavigation from '@/components/PageNavigation'

interface Team {
  id: string
  name: string
  abbreviation: string
  logoUrl: string
  currentStats?: {
    wins: number
    losses: number
    winningPercentage: number
    runsScored: number
    runsAllowed: number
    runDifferential: number
  }
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>('2024')

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading teams...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Teams</h1>
        
        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {teams.map((team) => (
            <Link 
              key={team.id} 
              href={`/stats/teams/${team.abbreviation.toLowerCase()}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 relative">
                      <img
                        src={team.logoUrl}
                alt={`${team.name} logo`}
                        className="w-full h-full object-contain"
              />
            </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500">{team.abbreviation}</p>
                    {team.currentStats && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Record: {team.currentStats.wins}-{team.currentStats.losses}</p>
                        <p>PCT: {team.currentStats.winningPercentage?.toFixed(3) || '0.000'}</p>
                      </div>
                    )}
                  </div>
                </div>
          </div>
            </Link>
          ))}
        </div>

        {/* Standings Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">League Standings</h2>
          </div>
          <div className="p-6">
            <SheetrockStandings />
          </div>
        </div>
      </div>
    </div>
  )
}