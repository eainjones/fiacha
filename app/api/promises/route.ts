import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
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

    const db = getDb()
    const body = await request.json()

    const { politician_id, title, description, category, promise_date, target_date } = body

    const politicianId = Number(politician_id)
    if (!Number.isInteger(politicianId) || politicianId <= 0) {
      return NextResponse.json({ error: 'politician_id must be a positive integer' }, { status: 400 })
    }
    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const result = await db.query(
      `INSERT INTO promises (politician_id, title, description, category, promise_date, target_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [politicianId, title.trim(), description, category, promise_date, target_date]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating promise:', error)
    return NextResponse.json({ error: 'Failed to create promise' }, { status: 500 })
  }
}
