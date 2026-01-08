import { NextRequest, NextResponse } from 'next/server'
import { getSystemDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'
import { createPoliticianSchema, parseBody } from '@/lib/validations'

export async function GET() {
  try {
    const db = getSystemDb()
    const result = await db.query(`
      SELECT
        p.*,
        c.name as county_name,
        c.province,
        la.name as local_authority_name
      FROM politicians p
      LEFT JOIN counties c ON p.county_id = c.id
      LEFT JOIN local_authorities la ON p.local_authority_id = la.id
      WHERE p.active = true
      ORDER BY
        CASE WHEN p.position_type = 'TD' THEN 0 ELSE 1 END,
        p.party,
        p.name
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching politicians:', error)
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

    const db = getSystemDb()
    const result = await db.query(
      `INSERT INTO politicians (name, party, constituency, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, party, constituency, role]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating politician:', error)
    return NextResponse.json({ error: 'Failed to create politician' }, { status: 500 })
  }
}
