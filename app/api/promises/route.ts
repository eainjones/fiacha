import { NextRequest, NextResponse } from 'next/server'
import { getSystemDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'
import { createPromiseSchema, parseBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const db = getSystemDb()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const politicianId = searchParams.get('politician_id')
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 100)
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

    let query = `
      SELECT p.*, pol.name as politician_name, pol.party
      FROM promises p
      LEFT JOIN politicians pol ON p.politician_id = pol.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (status) {
      query += ` AND p.status = $${paramCount++}`
      params.push(status)
    }
    if (category) {
      query += ` AND p.category = $${paramCount++}`
      params.push(category)
    }
    if (politicianId) {
      query += ` AND p.politician_id = $${paramCount++}`
      params.push(politicianId)
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
    params.push(limit, offset)

    const result = await db.query(query, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching promises:', error)
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

    const db = getSystemDb()
    const result = await db.query(
      `INSERT INTO promises (politician_id, title, description, category, promise_date, target_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [politician_id, title, description, category, promise_date, target_date]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating promise:', error)
    return NextResponse.json({ error: 'Failed to create promise' }, { status: 500 })
  }
}
