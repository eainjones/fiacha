/**
 * RSS Workflow
 *
 * Mastra workflow replacing rss-pipeline.ts.
 * Fetches RSS feeds → scrapes articles via Firecrawl → extracts promises → matches → saves.
 */

import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { fetchRSSFeed } from '../../crawlers/rss-parser.js';
import { getRSSSources } from '../../crawlers/source-registry.js';
import { normalizePoliticianName } from '../../validators/politician-matcher.js';
import { insertPromiseReview } from '../../database/queries.js';
import { getClients } from '../steps/init-clients.js';
import { sourceClassifier } from '../agents/source-classifier.js';
import { checkBudget } from '../../ai/tools/budget-checker.js';
import type { CrawlResult } from '../../types/index.js';
import type { SourceResult } from '../steps/aggregate-results.js';

/** Schema for source classifier structured output */
const ClassificationSchema = z.object({
  relevant: z.boolean(),
  score: z.number().min(0).max(100),
  reason: z.string(),
  categories: z.array(z.string()),
  politicians_mentioned: z.array(z.string()),
});

/** Minimum relevance score to proceed with extraction */
const MIN_RELEVANCE_SCORE = 35;

/**
 * Pre-filter content using source classifier agent.
 * Returns true if content is relevant enough for extraction.
 */
async function classifyContent(
  content: string,
  title: string
): Promise<{ relevant: boolean; score: number; reason: string }> {
  try {
    // Use first 2000 chars for classification (cheap & fast)
    const preview = content.substring(0, 2000);

    const response = await sourceClassifier.generate(
      [
        {
          role: 'user',
          content: `Classify whether this Irish news article is likely to contain political promises:\n\nTITLE: ${title}\n\nCONTENT:\n${preview}`,
        },
      ],
      {
        structuredOutput: {
          schema: ClassificationSchema as any,
        },
      }
    );

    const classification = response.object as z.infer<typeof ClassificationSchema>;
    if (classification) {
      return {
        relevant: classification.score >= MIN_RELEVANCE_SCORE,
        score: classification.score,
        reason: classification.reason,
      };
    }
  } catch (error) {
    // On classifier failure, let content through (fail open)
    console.warn(
      `[rss] Classifier error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return { relevant: true, score: 100, reason: 'Classifier unavailable — defaulting to relevant' };
}

/**
 * Load RSS sources from registry
 */
export const loadRssSourcesStep = createStep({
  id: 'load-rss-sources',
  description: 'Load enabled RSS sources from the source registry',
  inputSchema: z.object({}),
  outputSchema: z.object({
    sources: z.array(
      z.object({
        url: z.string(),
        name: z.string(),
      })
    ),
  }),
  execute: async () => {
    const sources = getRSSSources();
    console.log(`[rss] Loaded ${sources.length} RSS sources`);
    return {
      sources: sources.map((s) => ({ url: s.url, name: s.name })),
    };
  },
});

/**
 * Process a single RSS feed: fetch → scrape articles → extract → match → save
 */
export const processFeedStep = createStep({
  id: 'process-rss-feed',
  description: 'Fetch RSS feed, scrape articles, extract promises, match and save',
  inputSchema: z.object({
    url: z.string(),
    name: z.string(),
    maxArticlesPerFeed: z.number().default(15),
    delayMs: z.number().default(2000),
    maxAgeDays: z.number().default(7),
  }),
  outputSchema: z.object({
    articlesScraped: z.number(),
    extracted: z.number(),
    matched: z.number(),
    queued: z.number(),
    errors: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const { extractor, matcher, db, firecrawl } = getClients();
    const { url, name, maxArticlesPerFeed, delayMs, maxAgeDays } = inputData;

    let articlesScraped = 0;
    let extracted = 0;
    let matched = 0;
    let queued = 0;
    const errors: string[] = [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    try {
      console.log(`   [rss] Feed: ${name}`);
      const feed = await fetchRSSFeed(url);

      // Filter to recent articles only
      const recentArticles = feed.items
        .filter((item) => {
          if (!item.pubDate) return true;
          const articleDate = new Date(item.pubDate);
          return articleDate >= cutoffDate;
        })
        .slice(0, maxArticlesPerFeed);

      console.log(
        `      ${feed.items.length} items in feed, ${recentArticles.length} recent`
      );

      // Scrape each article via Firecrawl
      for (const article of recentArticles) {
        try {
          console.log(`      ${article.title.substring(0, 60)}...`);

          const crawlResult = await firecrawl.scrapeUrl(article.link);
          articlesScraped++;

          // Enrich with RSS metadata
          crawlResult.metadata = {
            ...crawlResult.metadata,
            title: article.title,
            description: article.description,
            publishedDate: article.pubDate,
          };

          // Pre-filter with source classifier (saves extraction cost)
          const budgetStatus = await checkBudget();
          if (budgetStatus.canProceed) {
            const classification = await classifyContent(
              crawlResult.markdown || '',
              article.title
            );
            if (!classification.relevant) {
              console.log(
                `         Skipped (score ${classification.score}): ${classification.reason}`
              );
              await new Promise((r) => setTimeout(r, delayMs));
              continue;
            }
          }

          // Extract promises
          const promises = await extractor.extractPromises(crawlResult);
          extracted += promises.length;

          if (promises.length > 0) {
            console.log(`         Found ${promises.length} promises`);

            for (const promise of promises) {
              try {
                const normalizedName = normalizePoliticianName(
                  promise.politician_name
                );
                const match = matcher.findPolitician(
                  normalizedName,
                  promise.party,
                  undefined
                );

                if (match) {
                  matched++;
                }

                await insertPromiseReview(db, promise, match);
                queued++;
              } catch (error) {
                errors.push(
                  `Match/save error: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }
          }

          // Rate limiting between scrapes
          await new Promise((r) => setTimeout(r, delayMs));
        } catch (error) {
          errors.push(
            `Article scrape error (${article.link}): ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      errors.push(
        `RSS feed error (${name}): ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return { articlesScraped, extracted, matched, queued, errors };
  },
});

/**
 * Run the full RSS pipeline as a function (used by orchestrator).
 */
export async function runRssWorkflow(options: {
  maxArticlesPerFeed?: number;
  delayMs?: number;
  maxAgeDays?: number;
}): Promise<SourceResult> {
  const {
    maxArticlesPerFeed = 15,
    delayMs = 2000,
    maxAgeDays = 7,
  } = options;

  console.log('\n   RSS News Pipeline');

  // Step 1: Load sources
  const { sources } = (await loadRssSourcesStep.execute({
    inputData: {},
  } as any)) as { sources: { url: string; name: string }[] };

  console.log(`   Processing ${sources.length} RSS feeds (max ${maxArticlesPerFeed} articles each)`);

  // Step 2: Process each feed
  let totalExtracted = 0;
  let totalMatched = 0;
  let totalQueued = 0;
  const allErrors: string[] = [];

  for (const source of sources) {
    const result = (await processFeedStep.execute({
      inputData: {
        ...source,
        maxArticlesPerFeed,
        delayMs,
        maxAgeDays,
      },
    } as any)) as {
      articlesScraped: number;
      extracted: number;
      matched: number;
      queued: number;
      errors: string[];
    };

    totalExtracted += result.extracted;
    totalMatched += result.matched;
    totalQueued += result.queued;
    allErrors.push(...result.errors);
  }

  console.log(
    `   RSS summary: ${sources.length} feeds -> ${totalExtracted} promises -> ${totalQueued} queued`
  );

  return {
    extracted: totalExtracted,
    matched: totalMatched,
    queued: totalQueued,
    errors: allErrors,
  };
}
