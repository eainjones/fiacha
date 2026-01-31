import { NextResponse } from 'next/server'
import { getCountiesWithStats } from '@/lib/db/queries'

export async function GET() {
  try {
    const counties = await getCountiesWithStats()

    return NextResponse.json({
      data: counties,
      total: counties.length,
    })
  } catch (error) {
    console.error('GET /api/counties failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to fetch counties' }, { status: 500 })
  }
}
