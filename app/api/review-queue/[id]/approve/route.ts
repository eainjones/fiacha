import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'

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

    const reviewId = Number(params.id)
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return NextResponse.json({ error: 'Invalid review id' }, { status: 400 })
    }

    const db = getDb()
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      const reviewResult = await client.query(
        'SELECT * FROM promise_review_queue WHERE id = $1 FOR UPDATE',
        [reviewId]
      )

      if (reviewResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }

      const review = reviewResult.rows[0]
      if (review.status !== 'pending') {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Review is not pending' }, { status: 400 })
      }

      const extracted = review.extracted_promise || {}
      const match = review.politician_match

      if (!match || !match.id) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'No politician match for review' }, { status: 400 })
      }

      if (!extracted.promise_title || !extracted.description) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Review has incomplete promise data' }, { status: 400 })
      }

      const promiseDate = parseDate(extracted.promise_date)
      const targetDate = parseDate(extracted.target_date)

      const promiseResult = await client.query(
        `
        INSERT INTO promises (
          politician_id, title, description, category,
          promise_date, target_date, status, score, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0, NOW())
        RETURNING id
        `,
        [
          match.id,
          extracted.promise_title,
          extracted.description,
          extracted.category || null,
          promiseDate,
          targetDate,
        ]
      )

      const promiseId = promiseResult.rows[0].id

      await client.query(
        `
        INSERT INTO evidence (
          promise_id, source_type, source_url, title, description, published_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `,
        [
          promiseId,
          extracted.source_type || null,
          extracted.source_url || null,
          extracted.source_url ? `Original source: ${extracted.source_url}` : 'Original source',
          extracted.quote || extracted.description,
          promiseDate,
        ]
      )

      await client.query(
        `
        UPDATE promise_review_queue
        SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1
        WHERE id = $2
        `,
        [user.email || 'reviewer', reviewId]
      )

      await client.query('COMMIT')

      return NextResponse.json({ ok: true, promise_id: promiseId })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Failed to approve review:', error)
      return NextResponse.json({ error: 'Failed to approve review' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to approve review:', error)
    return NextResponse.json({ error: 'Failed to approve review' }, { status: 500 })
  }
}
