import Link from 'next/link'
import Image from 'next/image'

export default function Navigation() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative w-10 h-10 mr-2">
                <Image
                  src="/images/seattle-wiffleball-logo.png"
                  alt="Seattle Wiffleball Logo"
                  width={40}
                  height={40}
                  priority
                  unoptimized
                />
              </div>
              <span className="text-xl font-bold text-gray-900">Seattle Wiffleball</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link 
              href="/stats/players" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Players
            </Link>
            <Link 
              href="/stats/teams" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Teams
            </Link>
            <Link 
              href="/leaderboards" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Leaderboards
            </Link>
            <Link 
              href="/rules" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Rules
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="hidden md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            href="/stats/players"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Players
          </Link>
          <Link 
            href="/stats/teams"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Teams
          </Link>
          <Link 
            href="/leaderboards"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Leaderboards
          </Link>
          <Link 
            href="/rules"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Rules
          </Link>
        </div>
      </div>
    </nav>
  )
}