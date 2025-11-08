import { ExtractedPromiseType, CrawlResult, LLMProvider } from '../types';

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
      // Must have action verb in title
      const hasActionVerb = /^(Build|Deliver|Increase|Reduce|Introduce|Create|Establish|Implement|Provide|Expand|Launch|Develop|Pass|Enact|Commence|Invest|Achieve|Complete|Construct|Fund|Allocate|Approve|Support)/i.test(
        promise.promise_title
      );

      // Must be reasonably specific (has a number or specific target)
      const hasSpecifics = /\d+|specific|new|additional/i.test(promise.promise_title);

      // Must have minimum description length
      const hasDescription = promise.description.length >= 20;

      // Must have reasonable confidence
      const hasConfidence = promise.confidence >= 30;

      if (!hasActionVerb || !hasSpecifics || !hasDescription || !hasConfidence) {
        console.warn(`[Extractor] Filtered out low-quality promise: "${promise.promise_title}"`);
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
    const cleaned = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('[Extractor] Failed to parse JSON response:', cleaned);
      throw new Error(`Invalid JSON response from LLM: ${error}`);
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
