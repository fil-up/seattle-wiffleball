"use client"

import Image from 'next/image'
import Link from 'next/link'
import { teams } from '@/config/teams'
import { useEffect } from 'react'
import { getFeaturedArticle, getNewsArticles } from '@/lib/news'

function GameChangerWidget() {
  useEffect(() => {
    // Load GameChanger script dynamically
    const script = document.createElement('script')
    script.src = 'https://widgets.gc.com/static/js/sdk.v1.js'
    script.onload = () => {
      // Wait a bit for the SDK to initialize
      setTimeout(() => {
        const gc = (window as any).GC
        if (gc && gc.scoreboard) {
          try {
            gc.scoreboard.init({
              target: "#gc-scoreboard-widget-trvs",
              widgetId: "e2cc3143-0338-4eda-a65b-34a2b2db9a97",
              maxVerticalGamesVisible: 4,
            })
            console.log('GameChanger widget loaded successfully')
          } catch (error) {
            console.error('Error loading GameChanger widget:', error)
          }
        } else {
          console.error('GameChanger SDK not available')
        }
      }, 1000)
    }
    script.onerror = () => {
      console.error('Failed to load GameChanger SDK')
    }
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div id="gc-scoreboard-widget-trvs">
      <div className="text-center p-8 text-gray-500">
        Loading schedule from GameChanger...
      </div>
    </div>
  )
}

export default function Home() {
  const featuredArticle = getFeaturedArticle()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="text-white relative overflow-hidden">
        {/* Background GIF */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/game-highlights.gif)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </div>
        
        {/* Navigation - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex space-x-4">
            <Link href="/" className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Home
            </Link>
            <Link href="/news" className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              News
            </Link>
            <Link href="/stats/players" className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Players
            </Link>
            <Link href="/stats/teams" className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Teams
            </Link>
            <Link href="/leaderboards" className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Leaderboards
            </Link>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row">
            {/* Logo Section - Left Side with Darker Blue */}
            <div className="md:w-1/4 flex items-center justify-center py-16" style={{ backgroundColor: '#25397B' }}>
              <div className="relative w-full h-full">
                <Image
                  src="/images/seattle-wiffleball-logo.png"
                  alt="Seattle Wiffleball Logo"
                  fill
                  priority
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* Titles Section - Right Side with Gradient */}
            <div className="md:w-1/4 relative">
              {/* Gradient Background - Fades from darker blue to transparent over GIF */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#25397B] to-transparent"></div>
              
              {/* Content */}
              <div className="relative z-10 px-6 py-16 flex flex-col justify-center h-full">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Seattle Wiffleball League
              </h1>
                <p className="text-lg md:text-xl mb-6 text-blue-100">
                The Premier Wiffleball League of the Pacific Northwest
              </p>
                <div className="flex flex-col space-y-3">
                <Link 
                  href="/stats/teams" 
                    className="bg-white text-[#25397B] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  View Teams
                </Link>
                <Link 
                  href="/stats/players" 
                    className="bg-white text-[#25397B] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  Player Stats
                </Link>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GameChanger Schedule Widget */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Games</h2>
          <div className="w-full">
            <GameChangerWidget />
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

      {/* Featured News Section */}
      {featuredArticle && (
      <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
              <Link 
              href="/news"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
              View All News →
              </Link>
            </div>
          
          {/* Three Featured Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {getNewsArticles().slice(0, 3).map((article) => (
              <article key={article.slug} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {article.image && (
                  <div className="relative w-full h-48 overflow-hidden">
                    {/* Blurred background image */}
                    <div className="absolute inset-0">
                      <Image
                        src={article.image}
                        alt=""
                        fill
                        className="object-cover blur-xl scale-110 opacity-30"
                        priority
                        unoptimized
                      />
          </div>
                    {/* Main image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-contain"
                        priority
                        unoptimized
                      />
            </div>
          </div>
                )}
            <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-500">{article.date}</div>
                    {article.featured && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                    {article.excerpt}
              </p>
              <Link 
                    href={`/news/${article.slug}`}
                    className="text-blue-600 font-semibold hover:text-blue-800 text-sm"
              >
                    Read Full Article →
              </Link>
            </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}