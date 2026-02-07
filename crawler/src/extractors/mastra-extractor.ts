/**
 * Mastra-based Promise Extractor
 *
 * Uses the Mastra AI framework for promise extraction with structured output.
 * This is the recommended extractor for production use.
 */

import { BasePromiseExtractor, type IPromiseExtractor } from './llm-interface.js';
import { CrawlResult, ExtractedPromiseType, SourceTypeType } from '../types/index.js';
import {
  extractPromises as aiExtractPromises,
  type ExtractedPromise as AIExtractedPromise,
  isAIConfigured,
  initBudgetDb,
  checkBudget,
  getTodaySummary,
  AGENT_CONFIG,
} from '../ai/index.js';
import { Pool } from 'pg';

/**
 * Mastra-based Promise Extractor using Claude Haiku via Mastra framework
 */
export class MastraPromiseExtractor extends BasePromiseExtractor implements IPromiseExtractor {
  private dbPool: Pool | null = null;
  private sourceType: SourceTypeType = 'media';

  constructor() {
    super(0.2, AGENT_CONFIG.PROMISE_EXTRACTOR.maxTokensPerRequest);
  }

  /**
   * Set database pool for budget tracking
   */
  setDatabasePool(pool: Pool): void {
    this.dbPool = pool;
    initBudgetDb(pool);
  }

  /**
   * Set default source type for extracted promises
   */
  setSourceType(sourceType: SourceTypeType): void {
    this.sourceType = sourceType;
  }

  getProvider(): 'claude' {
    return 'claude';
  }

  getModelName(): string {
    return 'claude-3-5-haiku-20241022 (via Mastra)';
  }

  /**
   * Extract promises from a crawl result
   */
  async extractPromises(crawlResult: CrawlResult): Promise<ExtractedPromiseType[]> {
    // Check if AI is configured
    if (!isAIConfigured()) {
      console.warn('[MastraExtractor] AI not configured - ANTHROPIC_API_KEY missing');
      return [];
    }

    // Check budget before extraction
    const budgetStatus = await checkBudget();
    if (!budgetStatus.canProceed) {
      console.warn(
        `[MastraExtractor] Daily budget exceeded ($${budgetStatus.totalSpent.toFixed(2)}/$${budgetStatus.budgetLimit.toFixed(2)})`
      );
      return [];
    }

    const content = crawlResult.markdown || crawlResult.html || '';
    if (!content || content.length < 100) {
      console.log('[MastraExtractor] Content too short, skipping extraction');
      return [];
    }

    try {
      // Use AI module's extraction function
      const aiPromises = await aiExtractPromises(content, crawlResult.url, 50);

      if (aiPromises.length === 0) {
        return [];
      }

      // Convert AI promises to ExtractedPromiseType format
      const promises = this.convertToExtractedPromises(aiPromises, crawlResult);

      // Validate promises using base class method
      return this.validatePromises(promises);
    } catch (error) {
      console.error('[MastraExtractor] Extraction failed:', error);
      return [];
    }
  }

  /**
   * Convert AI module's ExtractedPromise to the crawler's ExtractedPromiseType
   */
  private convertToExtractedPromises(
    aiPromises: AIExtractedPromise[],
    crawlResult: CrawlResult
  ): ExtractedPromiseType[] {
    const today = new Date().toISOString().split('T')[0];
    const publishedDate = crawlResult.metadata?.publishedDate || today;

    return aiPromises.map((p) => ({
      politician_name: p.politician_name,
      party: p.party || undefined,
      promise_title: p.title || this.generateTitle(p.promise_text),
      description: p.promise_text,
      category: p.category,
      promise_date: publishedDate,
      target_date: p.target_date || null,
      quote: p.promise_text.length <= 300 ? p.promise_text : undefined,
      confidence: p.confidence,
      source_url: crawlResult.url,
      source_type: this.sourceType,
    }));
  }

  /**
   * Generate a title from promise text
   */
  private generateTitle(promiseText: string): string {
    // Find action verb patterns
    const actionPatterns = [
      /^(will|to|we will|i will|the government will)\s+(\w+\s+){1,8}/i,
      /^(\w+\s+){1,6}/,
    ];

    for (const pattern of actionPatterns) {
      const match = promiseText.match(pattern);
      if (match && match[0].length >= 10 && match[0].length <= 100) {
        return match[0].trim();
      }
    }

    // Fallback: first N characters
    const maxLength = 100;
    if (promiseText.length <= maxLength) {
      return promiseText;
    }
    return promiseText.substring(0, maxLength - 3).trim() + '...';
  }

  /**
   * Log current budget status
   */
  async logBudgetStatus(): Promise<void> {
    const summary = await getTodaySummary();
    if (summary) {
      console.log('[MastraExtractor] Today\'s AI usage:');
      console.log(`  Total cost: $${summary.totalCost.toFixed(4)}`);
      console.log(`  Total requests: ${summary.requestCount}`);
      for (const [agent, stats] of Object.entries(summary.byAgent)) {
        console.log(`  ${agent}: $${stats.cost.toFixed(4)} (${stats.requests} requests)`);
      }
    }
  }
}

/**
 * Factory function to create Mastra extractor
 */
export function createMastraExtractor(): MastraPromiseExtractor {
  return new MastraPromiseExtractor();
}
