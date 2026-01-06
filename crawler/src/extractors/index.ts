import type { IPromiseExtractor } from './llm-interface';
import { createClaudeExtractor } from './claude-extractor';
import { createOpenAIExtractor } from './openai-extractor';
import type { LLMProvider } from '../types';

/**
 * Factory function to create extractor based on environment configuration
 */
export function createExtractor(provider?: LLMProvider): IPromiseExtractor {
  const selectedProvider = provider || (process.env.LLM_PROVIDER as LLMProvider) || 'claude';

  console.log(`[Extractor] Using ${selectedProvider.toUpperCase()} for promise extraction`);

  switch (selectedProvider) {
    case 'claude':
      return createClaudeExtractor();
    case 'openai':
      return createOpenAIExtractor();
    default:
      throw new Error(`Unknown LLM provider: ${selectedProvider}. Use 'claude' or 'openai'`);
  }
}

export type { IPromiseExtractor } from './llm-interface';
export { ClaudePromiseExtractor } from './claude-extractor';
export { OpenAIPromiseExtractor } from './openai-extractor';
