"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GameChangerWidget } from '@/components/GameChangerWidget'
import { StandingsWidget } from '@/components/StandingsWidget'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'

interface NewsArticle {
  slug: string
  title: string
  date: string
  excerpt: string
  image?: string
  tag?: string
  featured?: boolean
}

interface Video {
  videoId: string
  title: string
  published: string
}

export default function Home() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((json) => setArticles(json.data || []))
      .catch((err) => console.error('Error fetching news:', err))
  }, [])

  const featuredArticle = articles[0] ?? null
  const recentArticles = articles.slice(1, 4)

  useEffect(() => {
    fetch('/api/youtube?limit=3')
      .then((res) => res.json())
      .then(({ data }) => {
        if (data && data.length > 0) setVideos(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Hero Section */}
      <div className="hero-section text-white relative overflow-hidden">
        <img
          src="/images/game-highlights.gif"
          alt=""
          className="w-full block"
        />
        <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-gradient-to-b from-transparent to-surface-card pointer-events-none z-20" />

        <div className="absolute inset-0 z-10">
          <div className="py-20 md:py-40 px-4 md:px-6">
            <div className="flex flex-col md:flex-row">
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

      {/* News + Standings two-column layout */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-content-primary">Latest News</h2>
          <Link href="/news" className="text-brand-navy dark:text-brand-gold font-semibold hover:text-brand-navy/80 dark:hover:text-brand-gold/80">
            View All News →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured article (large card) */}
            {featuredArticle && (
              <article className="bg-surface-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                    <div className="text-sm text-content-secondary">{featuredArticle.date}</div>
                    <span className="bg-brand-navy/10 dark:bg-brand-gold/20 text-brand-navy dark:text-brand-gold text-xs font-medium px-2.5 py-0.5 rounded">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-content-primary mb-3">{featuredArticle.title}</h3>
                  <p className="text-content-secondary mb-4 leading-relaxed line-clamp-3">{featuredArticle.excerpt}</p>
                  <Link href={`/news/${featuredArticle.slug}`} className="text-brand-navy dark:text-brand-gold font-semibold hover:text-brand-navy/80 dark:hover:text-brand-gold/80">
                    Read Full Article →
                  </Link>
                </div>
              </article>
            )}

            {/* Recent articles (smaller cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentArticles.map((article) => (
                <article key={article.slug} className="bg-surface-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                    <div className="text-xs text-content-secondary mb-2">{article.date}</div>
                    <h3 className="text-sm font-bold text-content-primary mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-content-secondary text-xs leading-relaxed line-clamp-2">{article.excerpt}</p>
                    <Link href={`/news/${article.slug}`} className="text-brand-navy dark:text-brand-gold font-semibold hover:text-brand-navy/80 dark:hover:text-brand-gold/80 text-xs mt-2 inline-block">
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

      {/* GameChanger Schedule Widget */}
      <div className="bg-surface-card py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-content-primary mb-8">Upcoming Games</h2>
          <div className="w-full">
            <GameChangerWidget maxGames={2} />
          </div>
        </div>
      </div>

      {/* Latest Videos (only renders if YouTube channel is configured) */}
      {videos.length > 0 && (
        <div className="bg-surface-card py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-content-primary">Latest Videos</h2>
              <Link href="/media" className="text-brand-navy dark:text-brand-gold font-semibold hover:text-brand-navy/80 dark:hover:text-brand-gold/80">
                View All Media →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.videoId}>
                  <YouTubeEmbed videoId={video.videoId} title={video.title} />
                  <p className="mt-2 text-sm font-medium text-content-primary">{video.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links Section */}
      <div className="bg-surface-secondary">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-content-primary mb-4">Player Stats</h3>
              <p className="text-content-secondary mb-4">
                Explore comprehensive player statistics, including batting averages, home runs, and pitching records.
              </p>
              <Link href="/stats/players" className="text-brand-navy dark:text-brand-gold font-semibold hover:text-brand-navy/80 dark:hover:text-brand-gold/80">
                View Stats →
              </Link>
            </div>
            <div className="bg-surface-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-content-primary mb-4">Leaderboards</h3>
              <p className="text-content-secondary mb-4">
                Check out who&apos;s leading the league in various statistical categories.
              </p>
              <Link href="/leaderboards" className="text-brand-navy dark:text-brand-gold font-semibold hover:text-brand-navy/80 dark:hover:text-brand-gold/80">
                View Leaderboards →
              </Link>
            </div>
            <div className="bg-surface-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-content-primary mb-4">Schedule</h3>
              <p className="text-content-secondary mb-4">
                View upcoming games, live scores, and recent results from the full season schedule.
              </p>
              <Link href="/schedule" className="text-brand-navy dark:text-brand-gold font-semibold hover:text-brand-navy/80 dark:hover:text-brand-gold/80">
                View Schedule →
              </Link>
            </div>
            <div className="bg-surface-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-content-primary mb-4">League Rules</h3>
              <p className="text-content-secondary mb-4">
                Learn about our league rules, regulations, and gameplay standards.
              </p>
              <Link href="/rules" className="text-brand-navy dark:text-brand-gold font-semibold hover:text-brand-navy/80 dark:hover:text-brand-gold/80">
                View Rules →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
