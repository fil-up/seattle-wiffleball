import Image from 'next/image'
import Link from 'next/link'
import { teams } from '@/config/teams'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Seattle Wiffleball League
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                The Premier Wiffleball League of the Pacific Northwest
              </p>
              <div className="flex space-x-4">
                <Link 
                  href="/stats/teams" 
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  View Teams
                </Link>
                <Link 
                  href="/stats/players" 
                  className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Player Stats
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64">
                <Image
                  src="/images/seattle-wiffleball-logo.png"
                  alt="Seattle Wiffleball Logo"
                  width={256}
                  height={256}
                  priority
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Teams Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Teams</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {teams.slice(0, 5).map((team) => (
            <Link 
              key={team.id} 
              href={`/teams/${team.id}`}
              className="group"
            >
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="relative w-full h-32 mb-4">
                  <Image
                    src={team.logoPath}
                    alt={`${team.name} logo`}
                    width={128}
                    height={128}
                    unoptimized
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center group-hover:text-blue-600 transition-colors">
                  {team.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Player Stats</h3>
              <p className="text-gray-600 mb-4">
                Explore comprehensive player statistics, including batting averages, home runs, and pitching records.
              </p>
              <Link 
                href="/stats/players"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                View Stats →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Leaderboards</h3>
              <p className="text-gray-600 mb-4">
                Check out who's leading the league in various statistical categories.
              </p>
              <Link 
                href="/leaderboards"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                View Leaderboards →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">League Rules</h3>
              <p className="text-gray-600 mb-4">
                Learn about our league rules, regulations, and gameplay standards.
              </p>
              <Link 
                href="/rules"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                View Rules →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">July 28, 2025</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">It's Crunch Time</h3>
              <p className="text-gray-600 mb-4">
                From one coast to another, from legends to the legend, last Sunday was a formative day for all ballplayers...
              </p>
              <Link 
                href="/news/its-crunch-time"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                Read More →
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">June 19, 2025</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign up for the In-Season Tournament</h3>
              <p className="text-gray-600 mb-4">
                The 2nd Annual Seattle Wiffle In-Season Tournament is coming up! Join us for a day of competitive play...
              </p>
              <Link 
                href="/news/in-season-tournament"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                Read More →
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">May 17, 2025</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2025 Season Preview</h3>
              <p className="text-gray-600 mb-4">
                Picture the scene: Freshly-mown grass. A twelve-pack on the ground. Yellow bats strewn everywhere...
              </p>
              <Link 
                href="/news/season-preview"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                Read More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}