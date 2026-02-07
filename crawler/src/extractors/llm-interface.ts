import { ExtractedPromiseType, CrawlResult, LLMProvider } from '../types/index.js';

/**
 * Abstract interface for LLM promise extractors
 * Supports multiple providers (Claude, OpenAI, etc.)
 */
export interface IPromiseExtractor {
  extractPromises(crawlResult: CrawlResult): Promise<ExtractedPromiseType[]>;
  getProvider(): LLMProvider;
  getModelName(): string;
}

/**
 * Base class for LLM extractors with common functionality
 */
export abstract class BasePromiseExtractor implements IPromiseExtractor {
  protected temperature: number;
  protected maxTokens: number;

  constructor(temperature: number = 0.2, maxTokens: number = 4096) {
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  abstract extractPromises(crawlResult: CrawlResult): Promise<ExtractedPromiseType[]>;
  abstract getProvider(): LLMProvider;
  abstract getModelName(): string;

  /**
   * Validate extracted promises before returning
   * Ensures they match our quality standards from RESEARCHER-GUIDE.md
   */
  protected validatePromises(promises: ExtractedPromiseType[]): ExtractedPromiseType[] {
    return promises.filter(promise => {
      // Must have minimum description length
      const hasDescription = promise.description && promise.description.length >= 10;

      // Must have reasonable confidence
      const hasConfidence = promise.confidence >= 40;

      // Must have a non-empty title
      const hasTitle = promise.promise_title && promise.promise_title.length >= 5;

      if (!hasTitle || !hasDescription || !hasConfidence) {
        console.warn(`[Extractor] Filtered out low-quality promise: "${promise.promise_title}" (confidence: ${promise.confidence})`);
        return false;
      }

      return true;
    });
  }

  /**
   * Parse LLM response that should contain JSON
   * Handles cases where LLM wraps JSON in markdown code blocks
   */
  protected parseJsonResponse(response: string): any {
    // Remove markdown code blocks if present
    let cleaned = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try direct parse first
    try {
      const parsed = JSON.parse(cleaned);
      // If the response was wrapped in {"promises": [...]}, unwrap it
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.promises)) {
        return parsed.promises;
      }
      return parsed;
    } catch {
      // LLMs sometimes add explanatory text after JSON — extract the JSON object/array
      const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          // If the response was wrapped in {"promises": [...]}, unwrap it
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.promises)) {
            return parsed.promises;
          }
          return parsed;
        } catch (innerError) {
          console.error('[Extractor] Failed to parse extracted JSON:', jsonMatch[1].substring(0, 200));
          throw new Error(`Invalid JSON response from LLM: ${innerError}`);
        }
      }
      console.error('[Extractor] No JSON found in response:', cleaned.substring(0, 200));
      throw new Error('No JSON found in LLM response');
    }
  }

  /**
   * Truncate content if too long (to avoid token limits)
   */
  protected truncateContent(content: string, maxLength: number = 10000): string {
    if (content.length <= maxLength) {
      return content;
    }

    console.warn(`[Extractor] Truncating content from ${content.length} to ${maxLength} chars`);
    return content.substring(0, maxLength) + '\n\n[Content truncated...]';
  }
}
