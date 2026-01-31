import { NextRequest, NextResponse } from 'next/server'
import { getPromises, getPromiseCount, createPromise } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase-server'
import { createPromiseSchema, promisesQuerySchema, parseBody, parseSearchParams } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate query parameters with Zod schema
    const paramResult = parseSearchParams(searchParams, promisesQuerySchema)
    if (!paramResult.success) {
      return NextResponse.json({ error: paramResult.error }, { status: 400 })
    }

    const { status, category, politician_id, limit, offset } = paramResult.data

    const filters = {
      status,
      category,
      politicianId: politician_id,
    }

    const [data, total] = await Promise.all([
      getPromises(filters, limit, offset),
      getPromiseCount(filters),
    ])

    return NextResponse.json({
      data,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('GET /api/promises failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to fetch promises' }, { status: 500 })
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
    const parseResult = await parseBody(request, createPromiseSchema)
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: parseResult.status })
    }

    const { politician_id, title, description, category, promise_date, target_date } = parseResult.data

    const promise = await createPromise({
      politicianId: politician_id,
      title,
      description,
      category,
      promiseDate: promise_date,
      targetDate: target_date,
    })

    return NextResponse.json(promise, { status: 201 })
  } catch (error) {
    console.error('POST /api/promises failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to create promise' }, { status: 500 })
  }
}
