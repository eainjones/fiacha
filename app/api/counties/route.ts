import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const result = await db.query(
      'SELECT * FROM counties ORDER BY province, name'
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching counties:', error)
    return NextResponse.json({ error: 'Failed to fetch counties' }, { status: 500 })
  }
}
