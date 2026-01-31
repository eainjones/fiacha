import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { promises, evidence, promiseReviewQueue } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth/admin'

function parseDate(value: unknown) {
  if (!value) return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
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

    // Fetch the review item
    const reviewRows = await db
      .select()
      .from(promiseReviewQueue)
      .where(eq(promiseReviewQueue.id, reviewId))
      .limit(1)

    if (reviewRows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const review = reviewRows[0]
    if (review.status !== 'pending') {
      return NextResponse.json({ error: 'Review is not pending' }, { status: 400 })
    }

    const extracted = (review.extractedPromise || {}) as Record<string, any>
    const match = review.politicianMatch as Record<string, any> | null

    if (!match || !match.id) {
      return NextResponse.json({ error: 'No politician match for review' }, { status: 400 })
    }

    if (!extracted.promise_title || !extracted.description) {
      return NextResponse.json({ error: 'Review has incomplete promise data' }, { status: 400 })
    }

    const promiseDate = parseDate(extracted.promise_date)
    const targetDate = parseDate(extracted.target_date)

    // Use Drizzle transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Insert the new promise
      const promiseRows = await tx
        .insert(promises)
        .values({
          politicianId: match.id,
          title: extracted.promise_title,
          description: extracted.description,
          category: extracted.category || null,
          promiseDate: promiseDate?.toISOString().split('T')[0] ?? null,
          targetDate: targetDate?.toISOString().split('T')[0] ?? null,
          status: 'pending',
          score: 0,
        })
        .returning({ id: promises.id })

      const promiseId = promiseRows[0].id

      // Insert the evidence record
      await tx.insert(evidence).values({
        promiseId,
        sourceType: extracted.source_type || null,
        sourceUrl: extracted.source_url || null,
        title: extracted.source_url ? `Original source: ${extracted.source_url}` : 'Original source',
        description: extracted.quote || extracted.description,
        publishedDate: parseDate(extracted.source_published_date)?.toISOString().split('T')[0] ?? null,
      })

      // Update review queue status
      await tx
        .update(promiseReviewQueue)
        .set({
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: user.email || 'reviewer',
        })
        .where(eq(promiseReviewQueue.id, reviewId))

      return promiseId
    })

    return NextResponse.json({ ok: true, promise_id: result })
  } catch (error) {
    console.error('POST /api/review-queue/[id]/approve failed:', {
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
    })
    return NextResponse.json({ error: 'Failed to approve review' }, { status: 500 })
  }
}
