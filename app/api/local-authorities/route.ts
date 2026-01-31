import { NextResponse } from 'next/server'
import { getLocalAuthorities } from '@/lib/db/queries'

export async function GET() {
  try {
    const localAuthorities = await getLocalAuthorities()

    return NextResponse.json({
      data: localAuthorities,
      total: localAuthorities.length,
    })
  } catch (error) {
    console.error('GET /api/local-authorities failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to fetch local authorities' }, { status: 500 })
  }
}
