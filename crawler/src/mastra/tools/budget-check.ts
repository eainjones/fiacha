/**
 * Budget Check Tool
 *
 * Wraps checkBudget() as a Mastra tool.
 * Checks remaining AI budget before expensive operations.
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const budgetCheckTool = createTool({
  id: 'budget-check',
  description: 'Check remaining AI API budget before making expensive calls',
  inputSchema: z.object({}),
  outputSchema: z.object({
    canProceed: z.boolean(),
    remainingUsd: z.number(),
    totalSpent: z.number(),
    budgetLimit: z.number(),
    isExceeded: z.boolean(),
  }),
  execute: async (_inputData) => {
    // Execution happens inside workflow steps where budget DB is initialized.
    throw new Error('budget-check must be called via workflow context');
  },
});
