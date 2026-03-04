"use client"

import PageNavigation from '@/components/PageNavigation'
import { GameChangerWidget } from '@/components/GameChangerWidget'

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule &amp; Scores</h1>
        <p className="text-gray-600 mb-8">
          View upcoming games, live scores, and recent results.
        </p>
        <GameChangerWidget maxGames={10} />
      </div>
    </div>
  )
}
