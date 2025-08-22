import TeamMapping from '@/components/TeamMapping'

export default function TeamMappingDebugPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Mapping Debug</h1>
        <p className="text-gray-600 mb-8">
          This page shows the raw team mapping data from Google Sheets to help us understand the team structure.
        </p>
        
        <TeamMapping />
      </div>
    </div>
  )
}
