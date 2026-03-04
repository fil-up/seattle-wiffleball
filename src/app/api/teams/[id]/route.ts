import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Route being migrated to Google Sheets data source' },
    { status: 503 }
  )
}
