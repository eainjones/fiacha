import { NextRequest, NextResponse } from 'next/server';
import { getSystemDb } from '@/lib/db';

/**
 * API endpoint for scheduled crawler runs via Vercel Cron
 *
 * Security: Requires CRON_SECRET header for authentication
 *
 * Usage:
 * - Vercel Cron: Configure in vercel.json with CRON_SECRET
 * - Manual trigger: POST with Authorization: Bearer <CRON_SECRET>
 *
 * Environment variables required:
 * - CRON_SECRET: Secret token for authentication
 * - DATABASE_URL: PostgreSQL connection string
 * - ANTHROPIC_API_KEY: For AI extraction
 * - FIRECRAWL_API_KEY: For web crawling
 */

export const maxDuration = 300; // 5 minutes max for Pro plan
export const dynamic = 'force-dynamic';

interface CrawlResult {
  success: boolean;
  sourcesCrawled: number;
  promisesExtracted: number;
  politiciansMatched: number;
  queuedForReview: number;
  errors: string[];
  budgetStatus?: {
    totalSpent: number;
    budgetLimit: number;
    remaining: number;
  };
  duration: number;
}

/**
 * Verify the cron secret
 */
function verifyCronSecret(request: NextRequest): boolean {
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
 * Check AI budget before running
 */
async function checkBudget(): Promise<{ canProceed: boolean; totalSpent: number; budgetLimit: number }> {
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
    // If budget table doesn't exist yet, allow proceeding
    console.warn('[Cron] Budget check failed (table may not exist):', error);
    return { canProceed: true, totalSpent: 0, budgetLimit: 10 };
  }
}

/**
 * Log crawl run to database
 */
async function logCrawlRun(result: CrawlResult): Promise<void> {
  const db = getSystemDb();

  try {
    await db.query(
      `
      INSERT INTO ai_usage_log (agent_name, model, input_tokens, output_tokens, cost_usd, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        'crawler-cron',
        'system',
        0,
        0,
        0,
        JSON.stringify({
          type: 'crawl_run',
          ...result,
        }),
      ]
    );
  } catch (error) {
    console.warn('[Cron] Failed to log crawl run:', error);
  }
}

export async function GET(request: NextRequest) {
  // For Vercel Cron, we use GET requests
  return handleCrawlRequest(request);
}

export async function POST(request: NextRequest) {
  // For manual triggers, we use POST requests
  return handleCrawlRequest(request);
}

async function handleCrawlRequest(request: NextRequest) {
  const startTime = Date.now();

  // Verify authentication
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] Starting scheduled crawler run');

  // Check budget
  const budgetStatus = await checkBudget();
  if (!budgetStatus.canProceed) {
    console.log('[Cron] Daily budget exceeded, skipping run');
    return NextResponse.json(
      {
        success: false,
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

  // Check required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'ANTHROPIC_API_KEY'];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing environment variables: ${missingVars.join(', ')}`,
      },
      { status: 500 }
    );
  }

  try {
    // Dynamic import of crawler module to avoid bundling issues
    // Note: In production, the crawler runs separately on EC2/scheduled job
    // This endpoint is primarily for status checks and light triggers

    const result: CrawlResult = {
      success: true,
      sourcesCrawled: 0,
      promisesExtracted: 0,
      politiciansMatched: 0,
      queuedForReview: 0,
      errors: [],
      budgetStatus: {
        totalSpent: budgetStatus.totalSpent,
        budgetLimit: budgetStatus.budgetLimit,
        remaining: budgetStatus.budgetLimit - budgetStatus.totalSpent,
      },
      duration: 0,
    };

    // For now, this endpoint serves as:
    // 1. A health check for the cron system
    // 2. Budget status reporter
    // 3. Future: Light crawl trigger for serverless execution
    //
    // The main crawler runs via:
    // - npm run crawl (locally)
    // - Scheduled job on EC2/external service (production)

    // Get recent crawl stats from database
    const db = getSystemDb();
    const statsResult = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM promise_reviews WHERE created_at > NOW() - INTERVAL '24 hours') as recent_reviews,
        (SELECT COUNT(*) FROM promise_reviews WHERE status = 'pending') as pending_reviews
    `);

    const stats = statsResult.rows[0] || { recent_reviews: 0, pending_reviews: 0 };

    result.duration = Date.now() - startTime;

    // Log the run
    await logCrawlRun(result);

    return NextResponse.json({
      success: true,
      message: 'Crawler status check complete',
      budgetStatus: result.budgetStatus,
      stats: {
        recentReviews: parseInt(stats.recent_reviews) || 0,
        pendingReviews: parseInt(stats.pending_reviews) || 0,
      },
      duration: result.duration,
      note: 'Full crawler runs are executed via scheduled jobs. This endpoint provides status and budget checks.',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Cron] Crawler error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
