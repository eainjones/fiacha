import FirecrawlApp from '@mendable/firecrawl-js';
import { CrawlResult, CrawlSourceType } from '../types';

/**
 * Rate limit error class for 429 handling
 */
export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded (429)') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Firecrawl client wrapper with retry logic and error handling
 */
export class FirecrawlClient {
  private client: FirecrawlApp;
  private maxRetries: number;
  private delayMs: number;
  private rateLimitPauseMs: number;
  private consecutiveRateLimits: number = 0;
  private maxConsecutiveRateLimits: number = 3;

  constructor(
    apiKey: string,
    maxRetries: number = 3,
    delayMs: number = 2000,
    rateLimitPauseMs: number = 1800000 // 30 minutes default
  ) {
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is required');
    }

    this.client = new FirecrawlApp({ apiKey });
    this.maxRetries = maxRetries;
    this.delayMs = delayMs;
    this.rateLimitPauseMs = rateLimitPauseMs;
  }

  /**
   * Check if error is a rate limit (429) error
   */
  private isRateLimitError(error: any): boolean {
    if (!error) return false;
    const message = error.message || error.toString();
    return message.includes('429') || message.includes('rate limit') || error.statusCode === 429;
  }

  /**
   * Handle rate limit with extended pause
   */
  async handleRateLimit(): Promise<void> {
    this.consecutiveRateLimits++;

    if (this.consecutiveRateLimits >= this.maxConsecutiveRateLimits) {
      throw new RateLimitError(
        `Exceeded max consecutive rate limits (${this.maxConsecutiveRateLimits}). Batch should be skipped.`
      );
    }

    const pauseMinutes = Math.round(this.rateLimitPauseMs / 60000);
    console.log(`[Firecrawl] Rate limited. Pausing for ${pauseMinutes} minutes...`);
    await this.delay(this.rateLimitPauseMs);
    console.log(`[Firecrawl] Resuming after rate limit pause`);
  }

  /**
   * Reset consecutive rate limit counter on successful request
   */
  resetRateLimitCounter(): void {
    this.consecutiveRateLimits = 0;
  }

  /**
   * Scrape a single URL and return structured content
   * Includes special handling for 429 rate limit errors
   */
  async scrapeUrl(url: string, handleRateLimitExternally: boolean = false): Promise<CrawlResult> {
    console.log(`[Firecrawl] Scraping: ${url}`);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.client.scrapeUrl(url, {
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          waitFor: 1000, // Wait for dynamic content
        });

        if (!result || !result.success) {
          throw new Error('Firecrawl scrape failed');
        }

        if (!result.markdown) {
          throw new Error('No markdown content returned from Firecrawl');
        }

        console.log(`[Firecrawl] ✓ Scraped successfully (${result.markdown.length} chars)`);

        // Reset rate limit counter on success
        this.resetRateLimitCounter();

        return {
          url,
          markdown: result.markdown,
          html: result.html,
          metadata: result.metadata ? {
            title: result.metadata.title,
            description: result.metadata.description,
            publishedDate: result.metadata.publishedDate,
          } : undefined,
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`[Firecrawl] ✗ Attempt ${attempt}/${this.maxRetries} failed:`, error);

        // Special handling for 429 rate limit errors
        if (this.isRateLimitError(error)) {
          if (handleRateLimitExternally) {
            // Let the caller handle the rate limit (for batch operations)
            throw new RateLimitError(`Rate limited on ${url}`);
          }

          // Handle rate limit internally with extended pause
          try {
            await this.handleRateLimit();
            // Don't count this as a failed attempt - retry immediately
            attempt--;
            continue;
          } catch (rateLimitError) {
            // Too many consecutive rate limits
            throw rateLimitError;
          }
        }

        if (attempt < this.maxRetries) {
          const backoffDelay = this.delayMs * Math.pow(2, attempt - 1);
          console.log(`[Firecrawl] Retrying in ${backoffDelay}ms...`);
          await this.delay(backoffDelay);
        }
      }
    }

    throw new Error(`Failed to scrape ${url} after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Scrape multiple URLs from a source
   * Returns results and errors separately
   */
  async scrapeBatch(
    sources: CrawlSourceType[]
  ): Promise<{ results: CrawlResult[]; errors: { source: CrawlSourceType; error: Error }[] }> {
    const results: CrawlResult[] = [];
    const errors: { source: CrawlSourceType; error: Error }[] = [];

    for (const source of sources) {
      try {
        await this.delay(this.delayMs); // Rate limiting
        const result = await this.scrapeUrl(source.url);
        results.push(result);
      } catch (error) {
        errors.push({
          source,
          error: error as Error,
        });
      }
    }

    console.log(`[Firecrawl] Batch complete: ${results.length} successes, ${errors.length} errors`);

    return { results, errors };
  }

  /**
   * Crawl a website following links
   * Useful for crawling parliamentary debates or news archives
   */
  async crawlWebsite(
    url: string,
    options: {
      maxPages?: number;
      excludePaths?: string[];
      includePaths?: string[];
    } = {}
  ): Promise<CrawlResult[]> {
    console.log(`[Firecrawl] Crawling website: ${url} (limit: ${options.maxPages || 10} pages)`);

    try {
      const crawlResult = await this.client.crawlUrl(url, {
        limit: options.maxPages || 10,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
        excludePaths: options.excludePaths,
        includePaths: options.includePaths,
      });

      if (!crawlResult || !crawlResult.success) {
        throw new Error('Website crawl failed');
      }

      if (!crawlResult.data) {
        throw new Error('No data returned from website crawl');
      }

      const results: CrawlResult[] = crawlResult.data
        .filter((page: any) => page.markdown && page.markdown.length > 100)
        .map((page: any) => ({
          url: page.metadata?.sourceURL || url,
          markdown: page.markdown || '',
          html: page.html,
          metadata: {
            title: page.metadata?.title,
            description: page.metadata?.description,
            publishedDate: page.metadata?.publishedDate,
          },
        }));

      console.log(`[Firecrawl] ✓ Crawled ${results.length} pages with content`);
      return results;
    } catch (error) {
      console.error('[Firecrawl] ✗ Website crawl failed:', error);
      throw error;
    }
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check - verify Firecrawl API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try scraping a simple, reliable page
      await this.scrapeUrl('https://www.gov.ie');
      return true;
    } catch (error) {
      console.error('[Firecrawl] Health check failed:', error);
      return false;
    }
  }
}

/**
 * Factory function to create Firecrawl client from environment
 */
export function createFirecrawlClient(): FirecrawlClient {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  const maxRetries = parseInt(process.env.MAX_RETRIES || '5', 10);
  const delayMs = parseInt(process.env.CRAWL_DELAY_MS || '10000', 10); // 10 seconds default for council scraping
  const rateLimitPauseMs = parseInt(process.env.RATE_LIMIT_PAUSE_MS || '1800000', 10); // 30 minutes

  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }

  return new FirecrawlClient(apiKey, maxRetries, delayMs, rateLimitPauseMs);
}
