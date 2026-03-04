import { NextRequest, NextResponse } from 'next/server'

// TODO: Replace with Seattle Wiffle YouTube channel ID
const CHANNEL_ID = ''

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 12), 50)

  if (!CHANNEL_ID) {
    return NextResponse.json({ data: [], stale: false })
  }

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } })

    if (!res.ok) {
      return NextResponse.json({ data: [], stale: true })
    }

    const xml = await res.text()

    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []
    const videos = entries.slice(0, limit).map((entry) => {
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? ''
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? ''
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? ''
      return { videoId, title, published }
    })

    return NextResponse.json({ data: videos, stale: false })
  } catch {
    return NextResponse.json({ data: [], stale: true })
  }
}
