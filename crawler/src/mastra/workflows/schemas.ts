/**
 * Shared Workflow Schemas
 *
 * Zod schemas used across all crawler workflows for type-safe
 * input/output contracts.
 */

import { z } from 'zod';

/**
 * Input schema for all crawler workflows
 */
export const CrawlerInputSchema = z.object({
  mode: z.enum(['all', 'oireachtas', 'rss', 'web', 'tier1', 'tier2', 'tier3']),
});

export type CrawlerInput = z.infer<typeof CrawlerInputSchema>;

/**
 * Output schema matching PipelineResult
 */
export const PipelineResultSchema = z.object({
  success: z.boolean(),
  mode: z.string(),
  promisesExtracted: z.number(),
  politiciansMatched: z.number(),
  queuedForReview: z.number(),
  errors: z.array(z.string()),
  duration: z.number(),
});

export type PipelineResultType = z.infer<typeof PipelineResultSchema>;

/**
 * Per-source result schema (used within workflow steps)
 */
export const SourceResultSchema = z.object({
  extracted: z.number(),
  matched: z.number(),
  queued: z.number(),
  errors: z.array(z.string()),
});

/**
 * Oireachtas-specific options
 */
export const OireachtasOptionsSchema = z.object({
  limit: z.number().default(20),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
  delayMs: z.number().default(1000),
});

/**
 * RSS-specific options
 */
export const RSSOptionsSchema = z.object({
  maxArticlesPerFeed: z.number().default(10),
  delayMs: z.number().default(2000),
  maxAgeDays: z.number().default(7),
});
