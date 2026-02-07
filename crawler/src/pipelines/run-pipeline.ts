/**
 * Shared Pipeline Runner
 *
 * Bridge layer: delegates to Mastra workflow orchestrator.
 * Preserves the same public API so CLI and cron routes need zero changes.
 */

import {
  runWorkflow,
  type CrawlMode,
  type PipelineOptions,
  type PipelineResult,
} from '../mastra/workflows/run-workflow.js';

export type { CrawlMode, PipelineOptions, PipelineResult };

/**
 * Run a crawl pipeline for the given mode.
 *
 * This is the shared core logic used by both CLI and API routes.
 * Delegates to the Mastra workflow orchestrator.
 */
export async function runPipeline(
  mode: CrawlMode,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  return runWorkflow(mode, options);
}
