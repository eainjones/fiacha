/**
 * Shared Pipeline Runner
 *
 * Encapsulates the core crawl logic from index.ts into a reusable function.
 * Used by both the CLI (index.ts) and Vercel cron API routes.
 */

import { createFirecrawlClient } from '../crawlers/firecrawl-client';
import { getEnabledSources, getRSSSources, getOireachtasSources, getWebSources } from '../crawlers/source-registry';
import { createExtractor, MastraPromiseExtractor } from '../extractors';
import { createDatabaseClient } from '../database/client';
import { PoliticianMatcher, normalizePoliticianName } from '../validators/politician-matcher';
import { insertPromiseReview } from '../database/queries';
import { ExtractedPromiseType } from '../types';
import { MetricsCollector } from '../metrics/crawler-metrics';
import { initBudgetDb } from '../ai';
import { runOireachtasPipeline, OireachtasPipelineOptions } from './oireachtas-pipeline';
import { runRSSPipeline, RSSPipelineOptions } from './rss-pipeline';

export type CrawlMode = 'all' | 'oireachtas' | 'rss' | 'web' | 'tier1' | 'tier2' | 'tier3';

export interface PipelineOptions {
  /** Override default options for Oireachtas pipeline */
  oireachtas?: OireachtasPipelineOptions;
  /** Override default options for RSS pipeline */
  rss?: RSSPipelineOptions;
  /** Skip email notification (useful for cron runs) */
  skipEmail?: boolean;
}

export interface PipelineResult {
  success: boolean;
  mode: CrawlMode;
  promisesExtracted: number;
  politiciansMatched: number;
  queuedForReview: number;
  errors: string[];
  duration: number;
}

/**
 * Run a crawl pipeline for the given mode.
 *
 * This is the shared core logic used by both CLI and API routes.
 * It initializes clients, loads politicians, runs the appropriate
 * pipelines, and returns a structured result.
 */
export async function runPipeline(
  mode: CrawlMode,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let totalExtracted = 0;
  let totalMatched = 0;
  let totalQueued = 0;

  console.log(`[Pipeline] Starting ${mode} pipeline`);

  const db = createDatabaseClient();

  try {
    // Initialize clients
    const firecrawl = createFirecrawlClient();
    const extractor = createExtractor();

    // Initialize budget tracking if using Mastra extractor
    if (extractor instanceof MastraPromiseExtractor) {
      const pool = db.getPool();
      if (pool) {
        initBudgetDb(pool);
        extractor.setDatabasePool(pool);
      }
    }

    // Verify DB connection
    const dbHealthy = await db.healthCheck();
    if (!dbHealthy) {
      throw new Error('Database health check failed');
    }

    // Load politicians for matching
    const politicians = await db.getAllPoliticians();
    const matcher = new PoliticianMatcher(politicians);
    console.log(`[Pipeline] Loaded ${politicians.length} politicians`);

    const metricsCollector = new MetricsCollector();

    // --- Oireachtas Pipeline ---
    if (mode === 'all' || mode === 'oireachtas' || mode === 'tier1') {
      const oireachtasOpts = options.oireachtas ?? { limit: 20, delayMs: 1000 };
      const result = await runOireachtasPipeline(
        extractor, matcher, db, metricsCollector, oireachtasOpts
      );
      totalExtracted += result.promisesExtracted;
      totalMatched += result.politiciansMatched;
      totalQueued += result.queuedForReview;
      errors.push(...result.errors);
    }

    // --- RSS Pipeline ---
    if (mode === 'all' || mode === 'rss' || mode === 'tier2') {
      const rssSources = getRSSSources();
      if (rssSources.length > 0) {
        const rssOpts = options.rss ?? { maxArticlesPerFeed: 5, delayMs: 2000, maxAgeDays: 7 };
        const result = await runRSSPipeline(
          rssSources, firecrawl, extractor, matcher, db, metricsCollector, rssOpts
        );
        totalExtracted += result.promisesExtracted;
        totalMatched += result.politiciansMatched;
        totalQueued += result.queuedForReview;
        errors.push(...result.errors);
      }
    }

    // --- Web Crawl Pipeline ---
    if (mode === 'all' || mode === 'web' || mode === 'tier1' || mode === 'tier2' || mode === 'tier3') {
      let webSources = getWebSources();

      if (mode === 'tier1') webSources = webSources.filter(s => s.tier === 'tier1');
      if (mode === 'tier2') webSources = webSources.filter(s => s.tier === 'tier2');
      if (mode === 'tier3') webSources = webSources.filter(s => s.tier === 'tier3');

      // Exclude Oireachtas debate pages (handled by API pipeline)
      webSources = webSources.filter(s => !s.url.includes('oireachtas.ie/en/debates/'));

      for (const source of webSources) {
        console.log(`[Pipeline] Crawling: ${source.name}`);
        metricsCollector.startSource(source.name);

        try {
          let crawlResults = [];

          if (source.deepCrawl) {
            crawlResults = await firecrawl.crawlWebsite(source.url, {
              maxPages: source.maxPages,
              includePaths: source.includePaths,
              excludePaths: source.excludePaths,
            });
            metricsCollector.recordPagesCrawled(crawlResults.length);
          } else {
            const singleResult = await firecrawl.scrapeUrl(source.url);
            crawlResults = [singleResult];
            metricsCollector.recordPagesCrawled(1);
          }

          for (const crawlResult of crawlResults) {
            const enrichedResult = { ...crawlResult, sourceType: source.sourceType };
            const promises = await extractor.extractPromises(enrichedResult as any);
            totalExtracted += promises.length;
            metricsCollector.recordExtraction(promises.length);

            if (promises.length === 0) continue;

            for (const promise of promises) {
              const normalizedName = normalizePoliticianName(promise.politician_name);
              const match = matcher.findPolitician(normalizedName, promise.party, undefined);

              metricsCollector.recordMatch(
                match ? match.matchScore : null,
                match ? match.isExactMatch : false
              );

              if (match) totalMatched++;

              await insertPromiseReview(db, promise, match);
              totalQueued++;
              metricsCollector.recordQueueInsertion();
            }
          }
        } catch (error) {
          const errorMsg = `Error processing ${source.name}: ${error instanceof Error ? error.message : String(error)}`;
          errors.push(errorMsg);
          metricsCollector.recordError();
        }
      }
    }

    console.log(`[Pipeline] Complete: ${totalExtracted} extracted, ${totalMatched} matched, ${totalQueued} queued, ${errors.length} errors`);

    return {
      success: errors.length === 0,
      mode,
      promisesExtracted: totalExtracted,
      politiciansMatched: totalMatched,
      queuedForReview: totalQueued,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Pipeline] Fatal error: ${msg}`);
    return {
      success: false,
      mode,
      promisesExtracted: totalExtracted,
      politiciansMatched: totalMatched,
      queuedForReview: totalQueued,
      errors: [...errors, msg],
      duration: Date.now() - startTime,
    };
  } finally {
    await db.close();
  }
}
