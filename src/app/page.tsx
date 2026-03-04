"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getNewsArticles } from '@/lib/news'
import { GameChangerWidget } from '@/components/GameChangerWidget'
import { StandingsWidget } from '@/components/StandingsWidget'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'

interface Video {
  videoId: string
  title: string
  published: string
}

export default function Home() {
  const articles = getNewsArticles()
  const featuredArticle = articles[0] ?? null
  const recentArticles = articles.slice(1, 4)
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    fetch('/api/youtube?limit=3')
      .then((res) => res.json())
      .then(({ data }) => {
        if (data && data.length > 0) setVideos(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Blue Navigation Bar (sticky) */}
      <div className="sticky top-0 z-50">
        <div className="bg-[#25397B]">
          <div className="container mx-auto px-4">
            <div className="flex justify-end space-x-4 py-3">
              <Link href="/" className="text-white px-4 py-2 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2 2 8v10h6v-6h4v6h6V8z" />
                </svg>
                Home
              </Link>
              <Link href="/news" className="text-white px-4 py-2 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3 4h12v12H3zM16 6h1a1 1 0 0 1 1 1v7a3 3 0 0 1-3 3H4a2 2 0 0 1-2-2V6h1v9a1 1 0 0 0 1 1h11a2 2 0 0 0 2-2V6z" />
                  <path d="M5 7h8v2H5zM5 10h8v2H5zM5 13h5v2H5z" />
                </svg>
                News
              </Link>
              <Link href="/stats/players" className="text-white px-4 py-2 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 10a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 1 1 14 0z" />
                </svg>
                Players
              </Link>
              <Link href="/stats/teams" className="text-white px-4 py-2 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm10 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM7 13a5 5 0 0 0-5 5v2h6v-2a7 7 0 0 1 3-5.74A6.94 6.94 0 0 0 7 13Zm10 0a6.94 6.94 0 0 0-4 1.26A7 7 0 0 1 16 18v2h6v-2a5 5 0 0 0-5-5Z" />
                </svg>
                Teams
              </Link>
              <Link href="/leaderboards" className="text-white px-4 py-2 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M7 14V6H5v8zm4 0V2H9v12zm4 0V9h-2v5z" />
                </svg>
                Leaderboards
              </Link>
              <Link href="/schedule" className="text-white px-4 py-2 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-1-1zM4 8h12v8H4V8z" />
                </svg>
                Schedule
              </Link>
              <Link href="/media" className="text-white px-4 py-2 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.5 5.5v9l7-4.5-7-4.5zM10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
                </svg>
                Media
              </Link>
            </div>
          </div>
          <div className="h-1 w-full" style={{ backgroundColor: '#FFD700' }}></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section text-white relative overflow-hidden">
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
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(to right, #25397B 0%, rgba(37,57,123,0.85) 15%, rgba(37,57,123,0.5) 25%, transparent 33%, transparent 100%)'
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="py-40 px-6">
            <div className="flex">
              <div className="w-full md:w-[20%] flex flex-col items-center">
                <div className="relative w-40 h-40 md:w-56 md:h-56">
                  <Image
                    src="/images/seattle-wiffleball-logo.png"
                    alt="Seattle Wiffle Logo"
                    fill
                    priority
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <p className="mt-2 text-blue-200 font-semibold tracking-wider text-center">EST. 2015</p>
              </div>
              <div className="w-full md:w-[80%] flex items-center justify-center text-center md:pl-8 mt-6 md:mt-0">
                <div className="max-w-3xl">
                  <h1
                    className="text-3xl md:text-6xl font-black tracking-wider text-white"
                    style={{
                      fontFamily: 'Impact, "Arial Black", sans-serif',
                      textShadow:
                        '2px 2px 0px #FFD700, -2px -2px 0px #FFD700, 2px -2px 0px #FFD700, -2px 2px 0px #FFD700'
                    }}
                  >
                    SEATTLE WIFFLE
                  </h1>
                  <p className="mt-2 text-base md:text-xl text-blue-100">
                    Premier Wiffleball League of the Pacific Northwest
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GameChanger Schedule Widget (compact) */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Games</h2>
          <div className="w-full">
            <GameChangerWidget maxGames={2} />
          </div>
        </div>
      </div>

      {/* News + Standings two-column layout */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
          <Link href="/news" className="text-blue-600 font-semibold hover:text-blue-800">
            View All News →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured article (large card) */}
            {featuredArticle && (
              <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {featuredArticle.image && (
                  <div className="relative w-full h-64 overflow-hidden">
                    <div className="absolute inset-0">
                      <Image
                        src={featuredArticle.image}
                        alt=""
                        fill
                        className="object-cover blur-xl scale-110 opacity-30"
                        priority
                        unoptimized
                      />
                    </div>
                    <div className="relative w-full h-full">
                      <Image
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
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
                    <div className="text-sm text-gray-500">{featuredArticle.date}</div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{featuredArticle.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{featuredArticle.excerpt}</p>
                  <Link href={`/news/${featuredArticle.slug}`} className="text-blue-600 font-semibold hover:text-blue-800">
                    Read Full Article →
                  </Link>
                </div>
              </article>
            )}

            {/* Recent articles (smaller cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentArticles.map((article) => (
                <article key={article.slug} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {article.image && (
                    <div className="relative w-full h-36 overflow-hidden">
                      <div className="absolute inset-0">
                        <Image
                          src={article.image}
                          alt=""
                          fill
                          className="object-cover blur-xl scale-110 opacity-30"
                          unoptimized
                        />
                      </div>
                      <div className="relative w-full h-full">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-2">{article.date}</div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{article.excerpt}</p>
                    <Link href={`/news/${article.slug}`} className="text-blue-600 font-semibold hover:text-blue-800 text-xs mt-2 inline-block">
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Standings sidebar */}
          <div>
            <StandingsWidget />
          </div>
        </div>
      </div>

      {/* Latest Videos (only renders if YouTube channel is configured) */}
      {videos.length > 0 && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Latest Videos</h2>
              <Link href="/media" className="text-blue-600 font-semibold hover:text-blue-800">
                View All Media →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.videoId}>
                  <YouTubeEmbed videoId={video.videoId} title={video.title} />
                  <p className="mt-2 text-sm font-medium text-gray-900">{video.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links Section */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Player Stats</h3>
              <p className="text-gray-600 mb-4">
                Explore comprehensive player statistics, including batting averages, home runs, and pitching records.
              </p>
              <Link href="/stats/players" className="text-blue-600 font-semibold hover:text-blue-800">
                View Stats →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Leaderboards</h3>
              <p className="text-gray-600 mb-4">
                Check out who&apos;s leading the league in various statistical categories.
              </p>
              <Link href="/leaderboards" className="text-blue-600 font-semibold hover:text-blue-800">
                View Leaderboards →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule</h3>
              <p className="text-gray-600 mb-4">
                View upcoming games, live scores, and recent results from the full season schedule.
              </p>
              <Link href="/schedule" className="text-blue-600 font-semibold hover:text-blue-800">
                View Schedule →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">League Rules</h3>
              <p className="text-gray-600 mb-4">
                Learn about our league rules, regulations, and gameplay standards.
              </p>
              <Link href="/rules" className="text-blue-600 font-semibold hover:text-blue-800">
                View Rules →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
