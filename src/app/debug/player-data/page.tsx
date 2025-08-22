import PlayerBattingData from '@/components/PlayerBattingData'
import PlayerPitchingData from '@/components/PlayerPitchingData'
import StandingsDebug from '@/components/StandingsDebug'

export default function PlayerDataDebugPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Player Data Debug</h1>
        <p className="text-gray-600 mb-8">
          This page shows the raw player data from Google Sheets to help us understand the data structure.
        </p>
        
        <div className="space-y-8">
          <StandingsDebug />
          <PlayerBattingData />
          <PlayerPitchingData />
        </div>
      </div>
    </div>
  )
}
