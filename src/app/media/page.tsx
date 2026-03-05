"use client"

import { useState, useEffect } from 'react'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { CardSkeleton } from '@/components/Skeleton'
import ErrorState from '@/components/ErrorState'

interface Video {
  videoId: string
  title: string
  published: string
}

export default function MediaPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setError(false)
    fetch('/api/youtube?limit=12')
      .then((res) => res.json())
      .then(({ data }) => {
        setVideos(data ?? [])
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [retryCount])

  return (
    <div>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-content-primary mb-2">Media</h1>
        <p className="text-content-secondary mb-8">
          Game highlights, recaps, and league broadcasts.
        </p>

        {error ? (
          <ErrorState
            message="Couldn't load videos. Try again?"
            onRetry={() => { setError(false); setLoading(true); setRetryCount(c => c + 1) }}
          />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-content-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-content-primary">No videos available yet</h2>
            <p className="mt-2 text-content-secondary">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.videoId}>
                <YouTubeEmbed videoId={video.videoId} title={video.title} />
                <p className="mt-2 text-sm font-medium text-content-primary line-clamp-2">{video.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
