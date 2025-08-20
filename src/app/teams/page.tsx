"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Team = {
  id: string
  name: string
  logoUrl?: string
}

const DEFAULT_LOGO = "/images/teams/default-team-logo.png"

export default function TeamsIndexPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/teams')
      .then(r => r.json())
      .then((data) => {
        // shape may include extra fields
        const list = (data as any[]).map(t => ({ id: t.id, name: t.name, logoUrl: t.logoUrl }))
        setTeams(list)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Teams</h1>
      {loading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="group">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow h-full flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={team.logoUrl || DEFAULT_LOGO}
                  alt={`${team.name} logo`}
                  className="w-28 h-28 object-contain mb-4"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO }}
                />
                <h3 className="text-lg font-semibold text-gray-900 text-center group-hover:text-blue-600">{team.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
