import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = Number(params.id)
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return NextResponse.json({ error: 'Invalid review id' }, { status: 400 })
    }

    const body = await request.json()
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const db = getDb()
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
