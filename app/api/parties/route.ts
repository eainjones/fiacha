import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/parties
 * Fetch all active political parties
 */
export async function GET() {
  try {
    const result = await query(`
      SELECT
        id,
        name,
        abbreviation,
        color,
        text_color,
        icon_url,
        description,
        active,
        display_order,
        created_at,
        updated_at
      FROM political_parties
      WHERE active = true
      ORDER BY display_order ASC, name ASC
    `)

    return NextResponse.json({
      success: true,
      parties: result.rows
    })
  } catch (error) {
    console.error('Error fetching parties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch parties' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/parties
 * Create a new political party
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, abbreviation, color, text_color, icon_url, description, display_order } = body

    // Validation
    if (!name || !abbreviation || !color || !text_color) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await query(`
      INSERT INTO political_parties
        (name, abbreviation, color, text_color, icon_url, description, display_order, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `, [name, abbreviation, color, text_color, icon_url || null, description || null, display_order || 0])

    return NextResponse.json({
      success: true,
      party: result.rows[0]
    })
  } catch (error: any) {
    console.error('Error creating party:', error)

    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A party with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create party' },
      { status: 500 }
    )
  }
}
