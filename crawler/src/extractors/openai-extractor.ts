import OpenAI from 'openai';
import { BasePromiseExtractor } from './llm-interface';
import { ExtractedPromise, ExtractedPromiseType, CrawlResult, LLMProvider } from '../types';
import { PROMISE_EXTRACTION_SYSTEM_PROMPT, buildPromiseExtractionPrompt } from './prompt-templates';

/**
 * OpenAI-based promise extractor using GPT-4
 */
export class OpenAIPromiseExtractor extends BasePromiseExtractor {
  private client: OpenAI;
  private model: string;

  constructor(
    apiKey: string,
    model: string = 'gpt-4-turbo-preview',
    temperature: number = 0.2,
    maxTokens: number = 4096
  ) {
    super(temperature, maxTokens);

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAI extractor');
    }

    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  getProvider(): LLMProvider {
    return 'openai';
  }

  getModelName(): string {
    return this.model;
  }

  async extractPromises(crawlResult: CrawlResult): Promise<ExtractedPromiseType[]> {
    console.log(`[OpenAI] Extracting promises from: ${crawlResult.url}`);

    try {
      // Truncate content if too long
      const content = this.truncateContent(crawlResult.markdown, 15000);

      // Build prompt
      const prompt = buildPromiseExtractionPrompt(
        content,
        crawlResult.url,
        'parliamentary' // Default, should be passed from source
      );

      // Call OpenAI API with JSON mode
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: PROMISE_EXTRACTION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' },
      });

      // Extract response
      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response content from OpenAI');
      }

      // Parse JSON response
      const parsedResponse = this.parseJsonResponse(responseText);

      // OpenAI might wrap array in an object, or return a single promise object
      let rawPromises = [];
      if (Array.isArray(parsedResponse)) {
        rawPromises = parsedResponse;
      } else if (parsedResponse.promises && Array.isArray(parsedResponse.promises)) {
        rawPromises = parsedResponse.promises;
      } else if (parsedResponse.politician_name) {
        // Single promise object returned
        rawPromises = [parsedResponse];
      } else {
        console.warn('[OpenAI] Unexpected response format, returning empty');
        return [];
      }

      // Validate each promise against Zod schema
      const validatedPromises: ExtractedPromiseType[] = [];
      for (const rawPromise of rawPromises) {
        try {
          const validated = ExtractedPromise.parse(rawPromise);
          validatedPromises.push(validated);
          console.log(`[OpenAI] ✓ Validated promise: "${rawPromise.promise_title}"`);
        } catch (error) {
          console.warn('[OpenAI] ✗ Invalid promise schema, skipping');
          const err = error as { errors?: { message: string }[]; message?: string };
          console.warn('  Error:', err.errors?.[0]?.message || err.message);
          console.warn('  Promise title:', rawPromise.promise_title);
        }
      }

      // Apply quality filters
      const filteredPromises = this.validatePromises(validatedPromises);

      console.log(`[OpenAI] ✓ Extracted ${filteredPromises.length} valid promises`);
      return filteredPromises;
    } catch (error) {
      console.error('[OpenAI] ✗ Extraction failed:', error);
      throw new Error(`OpenAI extraction failed: ${error}`);
    }
  }
}

/**
 * Factory function to create OpenAI extractor from environment
 */
export function createOpenAIExtractor(): OpenAIPromiseExtractor {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAIPromiseExtractor(apiKey);
}
