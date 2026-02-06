import Anthropic from '@anthropic-ai/sdk';
import { BasePromiseExtractor } from './llm-interface';
import { ExtractedPromise, ExtractedPromiseType, CrawlResult, LLMProvider } from '../types';
import { PROMISE_EXTRACTION_SYSTEM_PROMPT, buildPromiseExtractionPrompt } from './prompt-templates';

/**
 * Claude-based promise extractor using Anthropic API
 */
export class ClaudePromiseExtractor extends BasePromiseExtractor {
  private client: Anthropic;
  private model: string;

  constructor(
    apiKey: string,
    model: string = 'claude-3-5-haiku-20241022',
    temperature: number = 0.2,
    maxTokens: number = 4096
  ) {
    super(temperature, maxTokens);

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for Claude extractor');
    }

    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  getProvider(): LLMProvider {
    return 'claude';
  }

  getModelName(): string {
    return this.model;
  }

  async extractPromises(crawlResult: CrawlResult): Promise<ExtractedPromiseType[]> {
    console.log(`[Claude] Extracting promises from: ${crawlResult.url}`);

    try {
      // Truncate content if too long
      const content = this.truncateContent(crawlResult.markdown, 15000);

      // Build prompt
      const prompt = buildPromiseExtractionPrompt(
        content,
        crawlResult.url,
        'parliamentary' // Default, should be passed from source
      );

      // Call Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: PROMISE_EXTRACTION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content
      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      // Parse JSON response (handles both raw arrays and {"promises": [...]} format)
      const parsed = this.parseJsonResponse(textContent.text);

      // Normalize to array
      const rawPromises = Array.isArray(parsed) ? parsed : [];
      if (rawPromises.length === 0 && parsed && typeof parsed === 'object') {
        console.log('[Claude] No promises array found in response');
        return [];
      }

      // Validate each promise against Zod schema
      const validatedPromises: ExtractedPromiseType[] = [];
      for (const rawPromise of rawPromises) {
        try {
          const validated = ExtractedPromise.parse(rawPromise);
          validatedPromises.push(validated);
        } catch (error) {
          console.warn('[Claude] Invalid promise schema, skipping:', error);
          console.warn('Raw promise:', rawPromise);
        }
      }

      // Apply quality filters
      const filteredPromises = this.validatePromises(validatedPromises);

      console.log(`[Claude] ✓ Extracted ${filteredPromises.length} valid promises`);
      return filteredPromises;
    } catch (error) {
      console.error('[Claude] ✗ Extraction failed:', error);
      throw new Error(`Claude extraction failed: ${error}`);
    }
  }
}

/**
 * Factory function to create Claude extractor from environment
 */
export function createClaudeExtractor(): ClaudePromiseExtractor {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  return new ClaudePromiseExtractor(apiKey);
}
