/**
 * RSS Pipeline
 *
 * Fetches articles from RSS feeds (RTÉ, etc.), then scrapes each article
 * via Firecrawl for full content, and runs promise extraction.
 *
 * This is the primary way to get news articles — RSS gives us structured
 * article URLs with dates, which we then scrape for full text.
 */

import { fetchRSSFeed, RSSItem } from '../crawlers/rss-parser.js';
import { IPromiseExtractor } from '../extractors/llm-interface.js';
import { PoliticianMatcher, normalizePoliticianName } from '../validators/politician-matcher.js';
import { insertPromiseReview } from '../database/queries.js';
import { DatabaseClient } from '../database/client.js';
import { CrawlSourceType, CrawlResult } from '../types/index.js';
import { MetricsCollector } from '../metrics/crawler-metrics.js';

interface FirecrawlClient {
  scrapeUrl(url: string): Promise<CrawlResult>;
}

export interface RSSPipelineOptions {
  /** Max articles to process per feed (default: 10) */
  maxArticlesPerFeed?: number;
  /** Delay between Firecrawl requests in ms (default: 2000) */
  delayMs?: number;
  /** Skip articles older than this many days (default: 7) */
  maxAgeDays?: number;
}

export interface RSSPipelineResult {
  feedsProcessed: number;
  articlesScraped: number;
  promisesExtracted: number;
  politiciansMatched: number;
  queuedForReview: number;
  errors: string[];
}

/**
 * Run the RSS pipeline for a list of RSS sources
 */
export async function runRSSPipeline(
  sources: CrawlSourceType[],
  firecrawl: FirecrawlClient,
  extractor: IPromiseExtractor,
  matcher: PoliticianMatcher,
  db: DatabaseClient,
  metrics: MetricsCollector,
  options: RSSPipelineOptions = {}
): Promise<RSSPipelineResult> {
  const {
    maxArticlesPerFeed = 10,
    delayMs = 2000,
    maxAgeDays = 7,
  } = options;

  const result: RSSPipelineResult = {
    feedsProcessed: 0,
    articlesScraped: 0,
    promisesExtracted: 0,
    politiciansMatched: 0,
    queuedForReview: 0,
    errors: [],
  };

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  console.log('\n   📰 RSS News Pipeline');
  console.log(`      Processing ${sources.length} RSS feeds (max ${maxArticlesPerFeed} articles each)`);
  console.log(`      Article cutoff: ${cutoffDate.toISOString().split('T')[0]}`);

  for (const source of sources) {
    console.log(`\n      📡 Feed: ${source.name}`);
    metrics.startSource(source.name);

    try {
      const feed = await fetchRSSFeed(source.url);
      result.feedsProcessed++;

      // Filter to recent articles only
      const recentArticles = feed.items
        .filter(item => {
          if (!item.pubDate) return true; // Include if no date
          const articleDate = new Date(item.pubDate);
          return articleDate >= cutoffDate;
        })
        .slice(0, maxArticlesPerFeed);

      console.log(`         ${feed.items.length} items in feed, ${recentArticles.length} recent`);

      // Scrape each article via Firecrawl
      for (const article of recentArticles) {
        try {
          console.log(`         🔗 ${article.title.substring(0, 60)}...`);

          const crawlResult = await firecrawl.scrapeUrl(article.link);
          result.articlesScraped++;
          metrics.recordPagesCrawled(1);

          // Enrich with RSS metadata
          crawlResult.metadata = {
            ...crawlResult.metadata,
            title: article.title,
            description: article.description,
            publishedDate: article.pubDate,
          };

          // Extract promises
          const promises = await extractor.extractPromises(crawlResult);
          result.promisesExtracted += promises.length;
          metrics.recordExtraction(promises.length);

          if (promises.length > 0) {
            console.log(`            Found ${promises.length} promises`);

            for (const promise of promises) {
              const normalizedName = normalizePoliticianName(promise.politician_name);
              const match = matcher.findPolitician(normalizedName, promise.party, undefined);

              metrics.recordMatch(
                match ? match.matchScore : null,
                match ? match.isExactMatch : false
              );

              if (match) {
                result.politiciansMatched++;
              }

              await insertPromiseReview(db, promise, match);
              result.queuedForReview++;
              metrics.recordQueueInsertion();
            }
          }

          // Rate limiting between scrapes
          await new Promise(r => setTimeout(r, delayMs));
        } catch (error) {
          const msg = `Article scrape error (${article.link}): ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(msg);
          metrics.recordError();
        }
      }
    } catch (error) {
      const msg = `RSS feed error (${source.name}): ${error instanceof Error ? error.message : String(error)}`;
      console.error(`         ✗ ${msg}`);
      result.errors.push(msg);
      metrics.recordError();
    }
  }

  console.log(`\n      RSS Summary: ${result.feedsProcessed} feeds → ${result.articlesScraped} articles → ${result.promisesExtracted} promises → ${result.queuedForReview} queued`);
  return result;
}
