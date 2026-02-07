/**
 * Aggregate Results Step
 *
 * Sums up step outputs into PipelineResult format.
 * Takes an array of per-source results and produces the final summary.
 */

import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const sourceResultSchema = z.object({
  extracted: z.number(),
  matched: z.number(),
  queued: z.number(),
  errors: z.array(z.string()),
});

export type SourceResult = z.infer<typeof sourceResultSchema>;

export const aggregateResultsStep = createStep({
  id: 'aggregate-results',
  description: 'Aggregate results from all pipeline sources into final summary',
  inputSchema: z.object({
    results: z.array(sourceResultSchema),
    mode: z.string(),
    startTime: z.number(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    mode: z.string(),
    promisesExtracted: z.number(),
    politiciansMatched: z.number(),
    queuedForReview: z.number(),
    errors: z.array(z.string()),
    duration: z.number(),
  }),
  execute: async ({ inputData }) => {
    let totalExtracted = 0;
    let totalMatched = 0;
    let totalQueued = 0;
    const allErrors: string[] = [];

    for (const result of inputData.results) {
      totalExtracted += result.extracted;
      totalMatched += result.matched;
      totalQueued += result.queued;
      allErrors.push(...result.errors);
    }

    const duration = Date.now() - inputData.startTime;

    console.log(
      `[aggregate] Complete: ${totalExtracted} extracted, ${totalMatched} matched, ${totalQueued} queued, ${allErrors.length} errors, ${(duration / 1000).toFixed(1)}s`
    );

    return {
      success: allErrors.length === 0,
      mode: inputData.mode,
      promisesExtracted: totalExtracted,
      politiciansMatched: totalMatched,
      queuedForReview: totalQueued,
      errors: allErrors,
      duration,
    };
  },
});
