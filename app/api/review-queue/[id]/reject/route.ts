import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { promiseReviewQueue } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
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

    const result = await db
      .update(promiseReviewQueue)
      .set({
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: user.email || 'reviewer',
        rejectionReason: reason,
      })
      .where(and(eq(promiseReviewQueue.id, reviewId), eq(promiseReviewQueue.status, 'pending')))
      .returning({ id: promiseReviewQueue.id })

    if (result.length === 0) {
      return NextResponse.json({ error: 'Review not found or not pending' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/review-queue/[id]/reject failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to reject review' }, { status: 500 })
  }
}
