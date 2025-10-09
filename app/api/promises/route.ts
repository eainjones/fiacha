import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const politicianId = searchParams.get('politician_id')

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

    query += ' ORDER BY p.created_at DESC LIMIT 100'

    const result = await db.query(query, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching promises:', error)
    return NextResponse.json({ error: 'Failed to fetch promises' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const body = await request.json()

    const { politician_id, title, description, category, promise_date, target_date } = body

    if (!politician_id || !title) {
      return NextResponse.json({ error: 'politician_id and title are required' }, { status: 400 })
    }

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
