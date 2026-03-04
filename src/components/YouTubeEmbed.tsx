"use client"

import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

interface YouTubeEmbedProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeEmbed({ videoId, title, className }: YouTubeEmbedProps) {
  return (
    <div className={`rounded-lg overflow-hidden ${className ?? ''}`}>
      <LiteYouTubeEmbed id={videoId} title={title} poster="hqdefault" webp />
    </div>
  )
}
