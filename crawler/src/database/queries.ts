import { PoolClient } from 'pg';
import {
  DbPromiseInsert,
  DbEvidenceInsert,
  ExtractedPromiseType,
  PoliticianMatch,
  PromiseReview,
} from '../types/index.js';
import { DatabaseClient } from './client.js';

/**
 * Database queries for promise review and insertion
 */

/**
 * Insert promise into review queue
 */
export async function insertPromiseReview(
  db: DatabaseClient,
  extractedPromise: ExtractedPromiseType,
  politicianMatch: PoliticianMatch | null
): Promise<number> {
  const query = `
    INSERT INTO promise_submissions (
      politician_name,
      politician_id,
      party,
      title,
      description,
      category,
      target_date,
      source_url,
      source_type,
      confidence_score,
      extraction_metadata,
      status,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending_review', NOW(), NOW())
    RETURNING id
  `;

  const result = await db.query(query, [
    extractedPromise.politician_name,
    politicianMatch?.id || null,
    extractedPromise.party || politicianMatch?.party || null,
    extractedPromise.promise_title,
    extractedPromise.description,
    extractedPromise.category,
    extractedPromise.target_date || null,
    extractedPromise.source_url,
    extractedPromise.source_type,
    extractedPromise.confidence,
    JSON.stringify({
      quote: extractedPromise.quote,
      promise_date: extractedPromise.promise_date,
      match_score: politicianMatch?.matchScore,
      match_exact: politicianMatch?.isExactMatch,
    }),
  ]);

  return result.rows[0].id;
}

/**
 * Get all pending reviews
 */
export async function getPendingReviews(db: DatabaseClient): Promise<PromiseReview[]> {
  const query = `
    SELECT * FROM promise_review_queue
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `;

  const result = await db.query(query);

  return result.rows.map(row => ({
    id: row.id,
    extracted_promise: row.extracted_promise,
    politician_match: row.politician_match,
    status: row.status,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at,
    reviewed_by: row.reviewed_by,
    rejection_reason: row.rejection_reason,
  }));
}

/**
 * Approve a promise review and insert into main database
 */
export async function approvePromiseReview(
  db: DatabaseClient,
  reviewId: number,
  reviewedBy: string = 'system'
): Promise<{ promiseId: number; evidenceId: number }> {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Get review data
    const reviewQuery = 'SELECT * FROM promise_review_queue WHERE id = $1';
    const reviewResult = await client.query(reviewQuery, [reviewId]);

    if (reviewResult.rows.length === 0) {
      throw new Error(`Review ${reviewId} not found`);
    }

    const review = reviewResult.rows[0];
    const extractedPromise: ExtractedPromiseType = review.extracted_promise;
    const politicianMatch: PoliticianMatch = review.politician_match;

    if (!politicianMatch) {
      throw new Error('Cannot approve review without politician match');
    }

    // Insert promise
    const promiseInsert: DbPromiseInsert = {
      politician_id: politicianMatch.id,
      title: extractedPromise.promise_title,
      description: extractedPromise.description,
      category: extractedPromise.category,
      promise_date: new Date(extractedPromise.promise_date),
      target_date: extractedPromise.target_date ? new Date(extractedPromise.target_date) : null,
      status: 'pending',
      score: 0,
    };

    const promiseQuery = `
      INSERT INTO promises (
        politician_id, title, description, category,
        promise_date, target_date, status, score, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id
    `;

    const promiseResult = await client.query(promiseQuery, [
      promiseInsert.politician_id,
      promiseInsert.title,
      promiseInsert.description,
      promiseInsert.category,
      promiseInsert.promise_date,
      promiseInsert.target_date,
      promiseInsert.status,
      promiseInsert.score,
    ]);

    const promiseId = promiseResult.rows[0].id;

    // Insert evidence
    const evidenceInsert: DbEvidenceInsert = {
      promise_id: promiseId,
      source_type: extractedPromise.source_type,
      source_url: extractedPromise.source_url,
      title: `Original source: ${extractedPromise.source_url}`,
      description: extractedPromise.quote || extractedPromise.description,
      published_date: new Date(extractedPromise.promise_date),
    };

    const evidenceQuery = `
      INSERT INTO evidence (
        promise_id, source_type, source_url, title, description, published_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id
    `;

    const evidenceResult = await client.query(evidenceQuery, [
      evidenceInsert.promise_id,
      evidenceInsert.source_type,
      evidenceInsert.source_url,
      evidenceInsert.title,
      evidenceInsert.description,
      evidenceInsert.published_date,
    ]);

    const evidenceId = evidenceResult.rows[0].id;

    // Update review status
    const updateReviewQuery = `
      UPDATE promise_review_queue
      SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1
      WHERE id = $2
    `;

    await client.query(updateReviewQuery, [reviewedBy, reviewId]);

    await client.query('COMMIT');

    console.log(`[Database] ✓ Approved review ${reviewId}, created promise ${promiseId}`);

    return { promiseId, evidenceId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Database] ✗ Failed to approve review:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Reject a promise review
 */
export async function rejectPromiseReview(
  db: DatabaseClient,
  reviewId: number,
  reason: string,
  reviewedBy: string = 'system'
): Promise<void> {
  const query = `
    UPDATE promise_review_queue
    SET status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = $1,
        rejection_reason = $2
    WHERE id = $3
  `;

  await db.query(query, [reviewedBy, reason, reviewId]);
  console.log(`[Database] ✓ Rejected review ${reviewId}: ${reason}`);
}

/**
 * Get review statistics
 */
export async function getReviewStats(db: DatabaseClient): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}> {
  const query = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM promise_review_queue
  `;

  const result = await db.query(query);
  return result.rows[0];
}

/**
 * Delete old reviewed promises from queue (cleanup)
 */
export async function cleanupReviewQueue(
  db: DatabaseClient,
  olderThanDays: number = 30
): Promise<number> {
  const query = `
    DELETE FROM promise_review_queue
    WHERE status IN ('approved', 'rejected')
    AND reviewed_at < NOW() - make_interval(days => $1)
  `;

  const result = await db.query(query, [olderThanDays]);
  const deletedCount = result.rowCount || 0;

  console.log(`[Database] ✓ Cleaned up ${deletedCount} old reviews`);
  return deletedCount;
}
