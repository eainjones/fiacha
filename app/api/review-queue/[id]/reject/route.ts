import { NextRequest, NextResponse } from 'next/server'
import { getSystemDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth/admin'
import { rejectReviewSchema, parseBody } from '@/lib/validations'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const reviewId = Number(params.id)
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return NextResponse.json({ error: 'Invalid review id' }, { status: 400 })
    }

    // Validate request body with Zod schema
    const parseResult = await parseBody(request, rejectReviewSchema)
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: parseResult.status })
    }

    const { reason } = parseResult.data

    const db = getSystemDb()
    const result = await db.query(
      `
      UPDATE promise_review_queue
      SET status = 'rejected',
          reviewed_at = NOW(),
          reviewed_by = $1,
          rejection_reason = $2
      WHERE id = $3 AND status = 'pending'
      RETURNING id
      `,
      [user.email || 'reviewer', reason, reviewId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found or not pending' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to reject review:', error)
    return NextResponse.json({ error: 'Failed to reject review' }, { status: 500 })
  }
}
