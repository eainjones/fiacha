/**
 * Shared utilities for cron API routes
 *
 * Authentication, budget checking, and logging used by all crawl endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemDb } from '@/lib/db';

/**
 * Verify the cron secret from request headers
 */
export function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('[Cron] CRON_SECRET not configured');
    return false;
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token === cronSecret) return true;
  }

  // Check x-cron-secret header (Vercel Cron)
  const cronHeader = request.headers.get('x-cron-secret');
  if (cronHeader === cronSecret) return true;

  return false;
}

/**
 * Check AI budget before running a pipeline
 */
export async function checkBudget(): Promise<{
  canProceed: boolean;
  totalSpent: number;
  budgetLimit: number;
}> {
  const db = getSystemDb();

  try {
    const result = await db.query(`
      SELECT
        COALESCE(total_cost_usd, 0) as total_spent,
        COALESCE(budget_limit_usd, 10) as budget_limit
      FROM ai_budget
      WHERE date = CURRENT_DATE
    `);

    if (result.rows.length === 0) {
      return { canProceed: true, totalSpent: 0, budgetLimit: 10 };
    }

    const { total_spent, budget_limit } = result.rows[0];
    return {
      canProceed: parseFloat(total_spent) < parseFloat(budget_limit),
      totalSpent: parseFloat(total_spent),
      budgetLimit: parseFloat(budget_limit),
    };
  } catch (error) {
    // If budget check fails, block crawl for safety
    console.error('[Cron] Budget check failed - blocking crawl for safety:', error);
    return { canProceed: false, totalSpent: 0, budgetLimit: 0 };
  }
}

/**
 * Insert a crawl_runs row at the START of a crawl.
 * Returns the row id so we can update it when complete.
 */
export async function startCrawlRun(pipeline: string): Promise<number | null> {
  const db = getSystemDb();
  try {
    const result = await db.query(
      `INSERT INTO crawl_runs (pipeline, status, started_at)
       VALUES ($1, 'running', NOW())
       RETURNING id`,
      [pipeline]
    );
    return result.rows[0]?.id ?? null;
  } catch (error) {
    console.warn('[Cron] Failed to start crawl run log:', error);
    return null;
  }
}

/**
 * Update a crawl_runs row when the crawl finishes (success or error).
 */
export async function completeCrawlRun(
  runId: number | null,
  result: {
    success: boolean;
    promisesExtracted: number;
    politiciansMatched: number;
    queuedForReview: number;
    errors: string[];
    duration: number;
  }
): Promise<void> {
  if (runId === null) return;

  const db = getSystemDb();
  try {
    await db.query(
      `UPDATE crawl_runs
       SET status = $1,
           promises_found = $2,
           politicians_matched = $3,
           queued_for_review = $4,
           error_count = $5,
           error_message = $6,
           duration_ms = $7,
           completed_at = NOW()
       WHERE id = $8`,
      [
        result.success ? 'success' : 'error',
        result.promisesExtracted,
        result.politiciansMatched,
        result.queuedForReview,
        result.errors.length,
        result.errors.length > 0 ? result.errors[0].slice(0, 2000) : null,
        result.duration,
        runId,
      ]
    );
  } catch (error) {
    console.warn('[Cron] Failed to complete crawl run log:', error);
  }
}

/**
 * Standard auth + budget guard for cron handlers.
 * Returns a NextResponse error if auth/budget fails, or null if OK to proceed.
 */
export async function guardCronRequest(
  request: NextRequest,
  pipeline: string
): Promise<NextResponse | null> {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`[Cron] Starting ${pipeline} pipeline`);

  const budgetStatus = await checkBudget();
  if (!budgetStatus.canProceed) {
    console.log(`[Cron] Daily budget exceeded, skipping ${pipeline}`);
    return NextResponse.json(
      {
        success: false,
        pipeline,
        message: 'Daily AI budget exceeded',
        budgetStatus: {
          totalSpent: budgetStatus.totalSpent,
          budgetLimit: budgetStatus.budgetLimit,
          remaining: 0,
        },
      },
      { status: 429 }
    );
  }

  const requiredEnvVars = ['DATABASE_URL', 'ANTHROPIC_API_KEY'];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        success: false,
        pipeline,
        error: `Missing environment variables: ${missingVars.join(', ')}`,
      },
      { status: 500 }
    );
  }

  return null; // OK to proceed
}
