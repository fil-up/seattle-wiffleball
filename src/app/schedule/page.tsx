"use client"

import { GameChangerWidget } from '@/components/GameChangerWidget'

export default function SchedulePage() {
  return (
    <div>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-content-primary mb-2">Schedule &amp; Scores</h1>
        <p className="text-content-secondary mb-8">
          View upcoming games, live scores, and recent results.
        </p>
        <GameChangerWidget maxGames={10} />
      </div>
    </div>
  )
}
