/**
 * Dedup Check Tool
 *
 * Wraps db.promiseExists() as a Mastra tool.
 * Checks if a promise already exists in the database to avoid duplicates.
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const dedupCheckTool = createTool({
  id: 'dedup-check',
  description: 'Check if a promise already exists in the database',
  inputSchema: z.object({
    politicianId: z.number(),
    title: z.string(),
  }),
  outputSchema: z.object({
    exists: z.boolean(),
  }),
  execute: async (_inputData) => {
    // Execution happens inside workflow steps where DB client is available.
    throw new Error('dedup-check must be called via workflow context');
  },
});
