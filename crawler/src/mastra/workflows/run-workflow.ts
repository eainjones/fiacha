/**
 * Workflow Orchestrator
 *
 * Replaces run-pipeline.ts logic. Delegates to individual workflow runners
 * based on the crawl mode. Returns the same PipelineResult contract.
 */

import { initClientsStep } from '../steps/init-clients.js';
import { clearClients } from '../steps/init-clients.js';
import { runOireachtasWorkflow } from './oireachtas-workflow.js';
import { runRssWorkflow } from './rss-workflow.js';
import { runWebWorkflow } from './web-workflow.js';
import type { SourceResult } from '../steps/aggregate-results.js';

export type CrawlMode =
  | 'all'
  | 'oireachtas'
  | 'rss'
  | 'web'
  | 'tier1'
  | 'tier2'
  | 'tier3';

export interface PipelineOptions {
  oireachtas?: {
    limit?: number;
    dateStart?: string;
    dateEnd?: string;
    delayMs?: number;
  };
  rss?: {
    maxArticlesPerFeed?: number;
    delayMs?: number;
    maxAgeDays?: number;
  };
  skipEmail?: boolean;
}

export interface PipelineResult {
  success: boolean;
  mode: CrawlMode;
  promisesExtracted: number;
  politiciansMatched: number;
  queuedForReview: number;
  errors: string[];
  duration: number;
}

/**
 * Run a crawl workflow for the given mode.
 *
 * This is the shared core logic used by both CLI and API routes.
 * It initializes clients, runs the appropriate workflows,
 * and returns a structured result.
 */
export async function runWorkflow(
  mode: CrawlMode,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let totalExtracted = 0;
  let totalMatched = 0;
  let totalQueued = 0;

  console.log(`[Workflow] Starting ${mode} workflow`);

  try {
    // Initialize shared clients
    const initResult = (await initClientsStep.execute({
      inputData: { mode },
    } as any)) as {
      politicianCount: number;
      budgetCanProceed: boolean;
      budgetRemaining: number;
    };

    console.log(
      `[Workflow] Initialized: ${initResult.politicianCount} politicians, budget: $${initResult.budgetRemaining.toFixed(2)} remaining`
    );

    if (!initResult.budgetCanProceed) {
      console.warn('[Workflow] Budget exceeded — proceeding with caution');
    }

    // Accumulate results from each sub-workflow
    const accumulate = (result: SourceResult) => {
      totalExtracted += result.extracted;
      totalMatched += result.matched;
      totalQueued += result.queued;
      errors.push(...result.errors);
    };

    // --- Oireachtas ---
    if (mode === 'all' || mode === 'oireachtas' || mode === 'tier1') {
      const oireachtasOpts = options.oireachtas ?? {
        limit: 20,
        delayMs: 1000,
      };
      const result = await runOireachtasWorkflow(oireachtasOpts);
      accumulate(result);
    }

    // --- RSS ---
    if (mode === 'all' || mode === 'rss' || mode === 'tier2') {
      const rssOpts = options.rss ?? {
        maxArticlesPerFeed: 5,
        delayMs: 2000,
        maxAgeDays: 7,
      };
      const result = await runRssWorkflow(rssOpts);
      accumulate(result);
    }

    // --- Web ---
    if (
      mode === 'all' ||
      mode === 'web' ||
      mode === 'tier1' ||
      mode === 'tier2' ||
      mode === 'tier3'
    ) {
      const tier =
        mode === 'tier1' || mode === 'tier2' || mode === 'tier3'
          ? mode
          : undefined;
      const result = await runWebWorkflow({ tier });
      accumulate(result);
    }

    console.log(
      `[Workflow] Complete: ${totalExtracted} extracted, ${totalMatched} matched, ${totalQueued} queued, ${errors.length} errors`
    );

    return {
      success: errors.length === 0,
      mode,
      promisesExtracted: totalExtracted,
      politiciansMatched: totalMatched,
      queuedForReview: totalQueued,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Workflow] Fatal error: ${msg}`);
    return {
      success: false,
      mode,
      promisesExtracted: totalExtracted,
      politiciansMatched: totalMatched,
      queuedForReview: totalQueued,
      errors: [...errors, msg],
      duration: Date.now() - startTime,
    };
  } finally {
    // Clean up module-level client store and close DB connection
    await clearClients();
  }
}
