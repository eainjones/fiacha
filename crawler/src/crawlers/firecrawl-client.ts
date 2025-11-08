import FirecrawlApp from '@mendable/firecrawl-js';
import { CrawlResult, CrawlSourceType } from '../types';

/**
 * Firecrawl client wrapper with retry logic and error handling
 */
export class FirecrawlClient {
  private client: FirecrawlApp;
  private maxRetries: number;
  private delayMs: number;

  constructor(apiKey: string, maxRetries: number = 3, delayMs: number = 2000) {
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is required');
    }

    this.client = new FirecrawlApp({ apiKey });
    this.maxRetries = maxRetries;
    this.delayMs = delayMs;
  }

  /**
   * Scrape a single URL and return structured content
   */
  async scrapeUrl(url: string): Promise<CrawlResult> {
    console.log(`[Firecrawl] Scraping: ${url}`);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.client.scrapeUrl(url, {
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          waitFor: 1000, // Wait for dynamic content
        });

        if (!result || !result.markdown) {
          throw new Error('No markdown content returned from Firecrawl');
        }

        console.log(`[Firecrawl] ✓ Scraped successfully (${result.markdown.length} chars)`);

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

      if (!crawlResult || !crawlResult.data) {
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
  const maxRetries = parseInt(process.env.MAX_RETRIES || '3', 10);
  const delayMs = parseInt(process.env.CRAWL_DELAY_MS || '2000', 10);

  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }

  return new FirecrawlClient(apiKey, maxRetries, delayMs);
}
