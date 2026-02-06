import { NextRequest, NextResponse } from 'next/server';
import { guardCronRequest, startCrawlRun, completeCrawlRun } from '../_shared';

export const maxDuration = 300; // 5 minutes max (Vercel Pro)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await guardCronRequest(request, 'web');
  if (guard) return guard;

  const runId = await startCrawlRun('web');
  const startTime = Date.now();

  try {
    const { runPipeline } = await import('../../../../crawler/src/pipelines/run-pipeline');

    // Web pipeline: single-page scrapes only (no deep crawl) to fit in 5 min
    const result = await runPipeline('web', {
      skipEmail: true,
    });

    await completeCrawlRun(runId, result);

    return NextResponse.json({
      success: result.success,
      pipeline: 'web',
      promisesExtracted: result.promisesExtracted,
      politiciansMatched: result.politiciansMatched,
      queuedForReview: result.queuedForReview,
      errors: result.errors,
      duration: result.duration,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Cron] Web pipeline error:', errorMessage);

    await completeCrawlRun(runId, {
      success: false,
      promisesExtracted: 0,
      politiciansMatched: 0,
      queuedForReview: 0,
      errors: [errorMessage],
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        pipeline: 'web',
        error: errorMessage,
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
