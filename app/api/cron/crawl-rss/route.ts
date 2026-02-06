import { NextRequest, NextResponse } from 'next/server';
import { guardCronRequest, logCrawlRun } from '../_shared';

export const maxDuration = 300; // 5 minutes max (Vercel Pro)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await guardCronRequest(request, 'rss');
  if (guard) return guard;

  const startTime = Date.now();

  try {
    const { runPipeline } = await import('../../../../crawler/src/pipelines/run-pipeline');

    const result = await runPipeline('rss', {
      rss: { maxArticlesPerFeed: 3, delayMs: 2000, maxAgeDays: 3 },
      skipEmail: true,
    });

    await logCrawlRun('rss', result);

    return NextResponse.json({
      success: result.success,
      pipeline: 'rss',
      promisesExtracted: result.promisesExtracted,
      politiciansMatched: result.politiciansMatched,
      queuedForReview: result.queuedForReview,
      errors: result.errors,
      duration: result.duration,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Cron] RSS pipeline error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        pipeline: 'rss',
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
