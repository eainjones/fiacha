import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db/client'
import { eq, ilike, asc, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() ?? ''

    // Require at least 2 characters to search
    if (q.length < 2) {
      return NextResponse.json([])
    }

    const results = await db
      .select({
        id: schema.politicians.id,
        name: schema.politicians.name,
        party_name: schema.parties.name,
        position_type: schema.politicians.positionType,
      })
      .from(schema.politicians)
      .leftJoin(schema.parties, eq(schema.politicians.partyId, schema.parties.id))
      .where(
        and(
          eq(schema.politicians.active, true),
          ilike(schema.politicians.name, `%${q}%`)
        )
      )
      .orderBy(asc(schema.politicians.name))
      .limit(50)

    return NextResponse.json(results)
  } catch (error) {
    console.error('GET /api/politicians/search failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to search politicians' }, { status: 500 })
  }
}
