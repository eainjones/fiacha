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
 * Log a crawl run to the ai_usage_log table
 */
export async function logCrawlRun(
  pipeline: string,
  result: {
    success: boolean;
    promisesExtracted: number;
    politiciansMatched: number;
    queuedForReview: number;
    errors: string[];
    duration: number;
  }
): Promise<void> {
  const db = getSystemDb();

  try {
    await db.query(
      `
      INSERT INTO ai_usage_log (agent_name, model, input_tokens, output_tokens, cost_usd, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        `crawler-cron-${pipeline}`,
        'system',
        0,
        0,
        0,
        JSON.stringify({
          type: 'crawl_run',
          pipeline,
          ...result,
        }),
      ]
    );
  } catch (error) {
    console.warn('[Cron] Failed to log crawl run:', error);
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
