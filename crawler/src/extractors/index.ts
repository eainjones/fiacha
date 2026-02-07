import type { IPromiseExtractor } from './llm-interface.js';
import { createClaudeExtractor } from './claude-extractor.js';
import { createOpenAIExtractor } from './openai-extractor.js';
import { createMastraExtractor } from './mastra-extractor.js';

// Extended LLMProvider type to include 'mastra'
type ExtendedLLMProvider = 'claude' | 'openai' | 'mastra';

/**
 * Factory function to create extractor based on environment configuration
 *
 * Provider options:
 * - 'mastra': Recommended. Uses Mastra framework with Claude Haiku, includes budget tracking
 * - 'claude': Direct Claude API (legacy)
 * - 'openai': Direct OpenAI API (legacy)
 */
export function createExtractor(provider?: ExtendedLLMProvider): IPromiseExtractor {
  const selectedProvider = provider || (process.env.LLM_PROVIDER as ExtendedLLMProvider) || 'mastra';

  console.log(`[Extractor] Using ${selectedProvider.toUpperCase()} for promise extraction`);

  switch (selectedProvider) {
    case 'mastra':
      return createMastraExtractor();
    case 'claude':
      return createClaudeExtractor();
    case 'openai':
      return createOpenAIExtractor();
    default:
      throw new Error(`Unknown LLM provider: ${selectedProvider}. Use 'mastra', 'claude', or 'openai'`);
  }
}

export type { IPromiseExtractor } from './llm-interface.js';
export { ClaudePromiseExtractor } from './claude-extractor.js';
export { OpenAIPromiseExtractor } from './openai-extractor.js';
export { MastraPromiseExtractor, createMastraExtractor } from './mastra-extractor.js';
