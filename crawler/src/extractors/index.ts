import type { IPromiseExtractor } from './llm-interface.js';
import { createMastraExtractor } from './mastra-extractor.js';

/**
 * Factory function to create the promise extractor.
 * Uses Mastra framework with Claude Haiku and budget tracking.
 */
export function createExtractor(): IPromiseExtractor {
  console.log(`[Extractor] Using MASTRA for promise extraction`);
  return createMastraExtractor();
}

export type { IPromiseExtractor } from './llm-interface.js';
export { MastraPromiseExtractor, createMastraExtractor } from './mastra-extractor.js';
