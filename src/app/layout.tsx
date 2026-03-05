import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import SiteNavigation from '@/components/SiteNavigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Seattle Wiffle',
  description: 'The Premier Wiffleball League of the Pacific Northwest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-surface-primary text-content-primary`}>
        <Providers>
          <SiteNavigation />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-900 dark:bg-gray-950 text-white">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  <p className="text-gray-400">
                    Seattle Wiffle is the premier wiffleball organization in the Pacific Northwest.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li><a href="/stats/players" className="text-gray-400 hover:text-white">Players</a></li>
                    <li><a href="/stats/teams" className="text-gray-400 hover:text-white">Teams</a></li>
                    <li><a href="/leaderboards" className="text-gray-400 hover:text-white">Leaderboards</a></li>
                    <li><a href="/rules" className="text-gray-400 hover:text-white">Rules</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Teams</h3>
                  <ul className="space-y-2">
                    <li><a href="/teams/wiffle-house" className="text-gray-400 hover:text-white">Wiffle House</a></li>
                    <li><a href="/teams/swingdome" className="text-gray-400 hover:text-white">Swingdome</a></li>
                    <li><a href="/teams/bilabial-stops" className="text-gray-400 hover:text-white">Bilabial Stops</a></li>
                    <li><a href="/teams" className="text-gray-400 hover:text-white">View All Teams</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact</h3>
                  <p className="text-gray-400">
                    Cowen Park<br />
                    Seattle, WA
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                © {new Date().getFullYear()} Seattle Wiffle. All rights reserved.
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
