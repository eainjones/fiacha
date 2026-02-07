import { NextRequest, NextResponse } from 'next/server';
import { guardCronRequest, startCrawlRun, completeCrawlRun } from '../_shared';

/**
 * Full crawler run — dispatches all pipelines sequentially.
 *
 * This is the daily "run everything" endpoint. Individual pipelines
 * (crawl-oireachtas, crawl-rss, crawl-web) run on their own staggered
 * schedules throughout the day.
 *
 * Environment variables required:
 * - CRON_SECRET: Secret token for authentication
 * - DATABASE_URL: PostgreSQL connection string
 * - ANTHROPIC_API_KEY: For AI extraction
 * - FIRECRAWL_API_KEY: For web crawling
 */

export const maxDuration = 300; // 5 minutes max (Vercel Pro)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleCrawlRequest(request);
}

export async function POST(request: NextRequest) {
  return handleCrawlRequest(request);
}

async function handleCrawlRequest(request: NextRequest) {
  const guard = await guardCronRequest(request, 'all');
  if (guard) return guard;

  const startTime = Date.now();
  const runId = await startCrawlRun('all');

  try {
    const { runPipeline } = await import('../../../../crawler/src/pipelines/run-pipeline');

    // Run the full pipeline with conservative limits to fit in 5 minutes
    const result = await runPipeline('all', {
      oireachtas: { limit: 10, delayMs: 500 },
      rss: { maxArticlesPerFeed: 2, delayMs: 1500, maxAgeDays: 3 },
      skipEmail: true,
    });

    await completeCrawlRun(runId, result);

    return NextResponse.json({
      success: result.success,
      pipeline: 'all',
      promisesExtracted: result.promisesExtracted,
      politiciansMatched: result.politiciansMatched,
      queuedForReview: result.queuedForReview,
      errors: result.errors,
      duration: result.duration,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Cron] Full crawler error:', errorMessage);

    const duration = Date.now() - startTime;
    await completeCrawlRun(runId, {
      success: false,
      promisesExtracted: 0,
      politiciansMatched: 0,
      queuedForReview: 0,
      errors: [errorMessage],
      duration,
    });

    return NextResponse.json(
      {
        success: false,
        pipeline: 'all',
        error: errorMessage,
        duration,
      },
      { status: 500 }
    );
  }
}
