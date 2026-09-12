import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/parties/:id
 * Fetch a single party by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(`
      SELECT * FROM political_parties WHERE id = $1
    `, [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      party: result.rows[0]
    })
  } catch (error) {
    console.error('Error fetching party:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch party' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/parties/:id
 * Update a political party
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, abbreviation, color, text_color, icon_url, description, active, display_order } = body

    const result = await query(`
      UPDATE political_parties
      SET
        name = COALESCE($1, name),
        abbreviation = COALESCE($2, abbreviation),
        color = COALESCE($3, color),
        text_color = COALESCE($4, text_color),
        icon_url = COALESCE($5, icon_url),
        description = COALESCE($6, description),
        active = COALESCE($7, active),
        display_order = COALESCE($8, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [name, abbreviation, color, text_color, icon_url, description, active, display_order, params.id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      party: result.rows[0]
    })
  } catch (error: any) {
    console.error('Error updating party:', error)

    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A party with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update party' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/parties/:id
 * Soft delete a party (set active = false)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete - just set active to false
    const result = await query(`
      UPDATE political_parties
      SET active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Party deactivated successfully'
    })
  } catch (error) {
    console.error('Error deleting party:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete party' },
      { status: 500 }
    )
  }
}
