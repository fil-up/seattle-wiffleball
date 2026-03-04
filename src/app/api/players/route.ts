import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Route being migrated to Google Sheets data source' },
    { status: 503 }
  )
}
