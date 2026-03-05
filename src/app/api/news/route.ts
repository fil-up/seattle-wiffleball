import { NextResponse } from 'next/server'
import { getNewsArticles } from '@/lib/news'

export async function GET() {
  try {
    const data = getNewsArticles()
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
