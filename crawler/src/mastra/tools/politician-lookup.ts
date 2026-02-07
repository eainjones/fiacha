/**
 * Politician Lookup Tool
 *
 * Wraps PoliticianMatcher.findPolitician() as a Mastra tool.
 * Used in workflows to match extracted names to database politicians.
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const politicianLookupTool = createTool({
  id: 'politician-lookup',
  description: 'Find a politician in the database by name with fuzzy matching',
  inputSchema: z.object({
    name: z.string().min(1),
    party: z.string().optional(),
    constituency: z.string().optional(),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    match: z
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
  execute: async (_inputData) => {
    // This tool is registered for Mastra Studio visibility.
    // Actual execution happens inside workflow steps where the matcher is available.
    throw new Error('politician-lookup must be called with a matcher instance via workflow context');
  },
});
