import { NextRequest, NextResponse } from 'next/server';
import { guardCronRequest, logCrawlRun } from '../_shared';

export const maxDuration = 300; // 5 minutes max (Vercel Pro)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await guardCronRequest(request, 'oireachtas');
  if (guard) return guard;

  const startTime = Date.now();

  try {
    // Dynamic import to avoid bundling the entire crawler into the API route
    const { runPipeline } = await import('../../../../crawler/src/pipelines/run-pipeline');

    const result = await runPipeline('oireachtas', {
      oireachtas: { limit: 20, delayMs: 1000 },
      skipEmail: true,
    });

    await logCrawlRun('oireachtas', result);

    return NextResponse.json({
      success: result.success,
      pipeline: 'oireachtas',
      promisesExtracted: result.promisesExtracted,
      politiciansMatched: result.politiciansMatched,
      queuedForReview: result.queuedForReview,
      errors: result.errors,
      duration: result.duration,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Cron] Oireachtas pipeline error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        pipeline: 'oireachtas',
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
