import Link from 'next/link'

export default function PageNavigation() {
  return (
    <div className="bg-[#25397B] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">Seattle Wiffleball</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/news" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                News
              </Link>
              <Link href="/stats/players" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Players
              </Link>
              <Link href="/stats/teams" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Teams
              </Link>
              <Link href="/leaderboards" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Leaderboards
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-blue-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="hidden md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-blue-200 hover:bg-[#1e2f63]"
            >
              Home
            </Link>
            <Link 
              href="/stats/players"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-blue-200 hover:bg-[#1e2f63]"
            >
              Players
            </Link>
            <Link 
              href="/stats/teams"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-blue-200 hover:bg-[#1e2f63]"
            >
              Teams
            </Link>
            <Link 
              href="/leaderboards"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-blue-200 hover:bg-[#1e2f63]"
            >
              Leaderboards
            </Link>
            <Link 
              href="/news"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-blue-200 hover:bg-[#1e2f63]"
            >
              News
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
