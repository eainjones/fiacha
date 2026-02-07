/**
 * Promise Save Tool
 *
 * Wraps insertPromiseReview() as a Mastra tool.
 * Inserts extracted promises into the review queue.
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const promiseSaveTool = createTool({
  id: 'promise-save',
  description: 'Save an extracted promise to the review queue',
  inputSchema: z.object({
    politician_name: z.string(),
    party: z.string().optional(),
    promise_title: z.string(),
    description: z.string(),
    category: z.string(),
    promise_date: z.string(),
    target_date: z.string().nullable(),
    quote: z.string().optional(),
    confidence: z.number(),
    source_url: z.string(),
    source_type: z.string(),
    politician_match: z
      .object({
        id: z.number(),
        name: z.string(),
        party: z.string().nullable(),
        constituency: z.string().nullable(),
        matchScore: z.number(),
        isExactMatch: z.boolean(),
      })
      .nullable(),
  }),
  outputSchema: z.object({
    reviewId: z.number(),
    saved: z.boolean(),
  }),
  execute: async (_inputData) => {
    // Execution happens inside workflow steps where DB client is available.
    throw new Error('promise-save must be called via workflow context');
  },
});
