/**
 * Promise Extraction Schemas
 *
 * Zod schemas for structured output from the Promise Extractor Agent.
 * These ensure AI responses are properly typed and validated.
 */

import { z } from 'zod';
import { PROMISE_CATEGORIES, type PromiseCategory } from '../config.js';

/**
 * Schema for a single extracted promise
 */
export const ExtractedPromiseSchema = z.object({
  // Politician information
  politician_name: z
    .string()
    .min(2, 'Politician name must be at least 2 characters')
    .describe('Full name of the politician who made the promise'),

  party: z
    .string()
    .nullable()
    .optional()
    .describe('Political party of the politician, if mentioned'),

  constituency: z
    .string()
    .nullable()
    .optional()
    .describe('Constituency or electoral area, if mentioned'),

  // Promise details
  promise_text: z
    .string()
    .min(10, 'Promise text must be at least 10 characters')
    .max(2000, 'Promise text must be under 2000 characters')
    .describe('The exact text of the promise, preferably a direct quote'),

  title: z
    .string()
    .max(200, 'Title must be under 200 characters')
    .optional()
    .describe('A short summary title for the promise (optional)'),

  category: z
    .enum(PROMISE_CATEGORIES as unknown as [PromiseCategory, ...PromiseCategory[]])
    .describe('Category of the promise from the canonical list'),

  target_date: z
    .string()
    .nullable()
    .optional()
    .describe('Target date for promise completion in YYYY-MM-DD format, if mentioned'),

  // Extraction metadata
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe('Confidence score (0-100) that this is a real, verifiable promise'),

  source_context: z
    .string()
    .max(500)
    .optional()
    .describe('Brief context about where/when the promise was made'),
});

export type ExtractedPromise = z.infer<typeof ExtractedPromiseSchema>;

/**
 * Schema for the full extraction response (array of promises)
 */
export const ExtractionResponseSchema = z.object({
  promises: z.array(ExtractedPromiseSchema),
  extraction_summary: z
    .string()
    .optional()
    .describe('Brief summary of what was found in the document'),
});

export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;

/**
 * Validate an extraction response
 * Returns validated data or null if invalid
 */
export function validateExtractionResponse(data: unknown): ExtractionResponse | null {
  const result = ExtractionResponseSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('[Schema] Extraction validation failed:', result.error.format());
  return null;
}

/**
 * Filter promises by confidence threshold
 */
export function filterByConfidence(
  promises: ExtractedPromise[],
  minConfidence: number = 50
): ExtractedPromise[] {
  return promises.filter((p) => p.confidence >= minConfidence);
}

/**
 * Generate a title from promise text if not provided
 */
export function generateTitle(promiseText: string, maxLength: number = 100): string {
  // Take first sentence or first N characters
  const firstSentence = promiseText.split(/[.!?]/)[0];
  if (firstSentence.length <= maxLength) {
    return firstSentence.trim();
  }
  return promiseText.substring(0, maxLength - 3).trim() + '...';
}
