import { NextRequest, NextResponse } from 'next/server'
import { getActivePoliticians, getActivePoliticiansCount, createPolitician } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase-server'
import { createPoliticianSchema, politiciansQuerySchema, parseBody, parseSearchParams } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const paramResult = parseSearchParams(searchParams, politiciansQuerySchema)
    if (!paramResult.success) {
      return NextResponse.json({ error: paramResult.error }, { status: 400 })
    }

    const { limit, offset } = paramResult.data
    const isPaginated = limit !== undefined || offset !== undefined

    if (isPaginated) {
      // Paginated response: { data, total, limit, offset }
      const paginationLimit = limit ?? 100
      const paginationOffset = offset ?? 0

      const [data, total] = await Promise.all([
        getActivePoliticians(paginationLimit, paginationOffset),
        getActivePoliticiansCount(),
      ])

      return NextResponse.json({
        data,
        total,
        limit: paginationLimit,
        offset: paginationOffset,
      })
    }

    // Default: return flat array for backward compatibility
    const result = await getActivePoliticians()
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/politicians failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to fetch politicians' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body with Zod schema
    const parseResult = await parseBody(request, createPoliticianSchema)
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: parseResult.status })
    }

    const { name, party, constituency, role } = parseResult.data

    const politician = await createPolitician({ name, party, constituency, role })

    return NextResponse.json(politician, { status: 201 })
  } catch (error) {
    console.error('POST /api/politicians failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to create politician' }, { status: 500 })
  }
}
