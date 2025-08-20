'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { teams } from '@/config/teams'
import StatsTable from '@/components/StatsTable'
import StatsFilter from '@/components/StatsFilter'

const columns = [
  {
    header: 'Team',
    accessorKey: 'name',
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-3">
        <div className="relative w-8 h-8">
          <Image
            src={teams.find(t => t.name === row.original.name)?.logoPath || ''}
            alt={`${row.original.name} logo`}
            width={32}
            height={32}
            unoptimized
          />
        </div>
        <Link 
          href={`/teams/${row.original.id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {row.original.name}
        </Link>
      </div>
    ),
  },
  {
    header: 'W',
    accessorKey: 'wins',
  },
  {
    header: 'L',
    accessorKey: 'losses',
  },
  {
    header: 'PCT',
    accessorKey: 'winningPercentage',
    cell: ({ getValue }: any) => getValue().toFixed(3),
  },
  {
    header: 'RS',
    accessorKey: 'runsScored',
  },
  {
    header: 'RA',
    accessorKey: 'runsAllowed',
  },
  {
    header: 'DIFF',
    accessorKey: 'runDifferential',
  },
]

export default function TeamsStats() {
  const [stats, setStats] = useState<any[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get unique years from the API
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        const uniqueYears = Array.from(new Set(data.flatMap((team: any) => 
          team.teamStats.map((stat: any) => stat.year)
        )))
        setYears(uniqueYears.sort((a, b) => b - a))
      })
  }, [])

  useEffect(() => {
    setLoading(true)
    const queryParams = new URLSearchParams()
    if (selectedYear) queryParams.append('year', selectedYear.toString())

    fetch(`/api/teams?${queryParams}`)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
  }, [selectedYear])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Team Statistics</h1>
      
      <StatsFilter
        years={years}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        qualified={false}
        onQualifiedChange={() => {}}
        showQualified={false}
      />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <StatsTable
          data={stats}
          columns={columns}
          initialSortField="winningPercentage"
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
        {teams.map((team) => (
          <div key={team.id} className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="relative w-32 h-32">
              <Image
                src={team.logoPath}
                alt={`${team.name} logo`}
                width={128}
                height={128}
                unoptimized
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{team.name}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}