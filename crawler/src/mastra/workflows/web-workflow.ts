/**
 * Web Workflow
 *
 * Mastra workflow for web crawling sources (gov.ie, party sites, etc.).
 * Handles both single-page scrapes and deep crawls via Firecrawl.
 */

import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { getWebSources } from '../../crawlers/source-registry.js';
import { normalizePoliticianName } from '../../validators/politician-matcher.js';
import { insertPromiseReview } from '../../database/queries.js';
import { getClients } from '../steps/init-clients.js';
import type { SourceResult } from '../steps/aggregate-results.js';

/**
 * Load web sources from registry, optionally filtered by tier
 */
export const loadWebSourcesStep = createStep({
  id: 'load-web-sources',
  description: 'Load enabled web sources from the source registry',
  inputSchema: z.object({
    tier: z.string().optional(),
  }),
  outputSchema: z.object({
    sources: z.array(
      z.object({
        url: z.string(),
        name: z.string(),
        deepCrawl: z.boolean(),
        maxPages: z.number(),
        includePaths: z.array(z.string()).optional(),
        excludePaths: z.array(z.string()).optional(),
        sourceType: z.string(),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    let webSources = getWebSources();

    // Filter by tier if specified
    if (inputData.tier) {
      webSources = webSources.filter((s) => s.tier === inputData.tier);
    }

    // Exclude Oireachtas debate pages (handled by oireachtas workflow)
    webSources = webSources.filter(
      (s) => !s.url.includes('oireachtas.ie/en/debates/')
    );

    console.log(`[web] Loaded ${webSources.length} web sources`);

    return {
      sources: webSources.map((s) => ({
        url: s.url,
        name: s.name,
        deepCrawl: s.deepCrawl ?? false,
        maxPages: s.maxPages ?? 5,
        includePaths: s.includePaths,
        excludePaths: s.excludePaths,
        sourceType: s.sourceType,
      })),
    };
  },
});

/**
 * Process a single web source: scrape/crawl → extract → match → save
 */
export const processWebSourceStep = createStep({
  id: 'process-web-source',
  description:
    'Crawl or scrape a web source, extract promises, match and save',
  inputSchema: z.object({
    url: z.string(),
    name: z.string(),
    deepCrawl: z.boolean(),
    maxPages: z.number(),
    includePaths: z.array(z.string()).optional(),
    excludePaths: z.array(z.string()).optional(),
    sourceType: z.string(),
  }),
  outputSchema: z.object({
    pagesCrawled: z.number(),
    extracted: z.number(),
    matched: z.number(),
    queued: z.number(),
    errors: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const { extractor, matcher, db, firecrawl } = getClients();
    const { url, name, deepCrawl, maxPages, includePaths, excludePaths, sourceType } =
      inputData;

    let pagesCrawled = 0;
    let extracted = 0;
    let matched = 0;
    let queued = 0;
    const errors: string[] = [];

    try {
      console.log(`   [web] Crawling: ${name}`);

      let crawlResults;

      if (deepCrawl) {
        crawlResults = await firecrawl.crawlWebsite(url, {
          maxPages,
          includePaths,
          excludePaths,
        });
        pagesCrawled = crawlResults.length;
      } else {
        const singleResult = await firecrawl.scrapeUrl(url);
        crawlResults = [singleResult];
        pagesCrawled = 1;
      }

      for (const crawlResult of crawlResults) {
        try {
          const enrichedResult = { ...crawlResult, sourceType };
          const promises = await extractor.extractPromises(
            enrichedResult as any
          );
          extracted += promises.length;

          if (promises.length === 0) continue;

          console.log(
            `      ${crawlResult.url}: ${promises.length} promises`
          );

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
        } catch (error) {
          errors.push(
            `Extraction error (${crawlResult.url}): ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      errors.push(
        `Web crawl error (${name}): ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return { pagesCrawled, extracted, matched, queued, errors };
  },
});

/**
 * Run the full web pipeline as a function (used by orchestrator).
 */
export async function runWebWorkflow(options: {
  tier?: string;
}): Promise<SourceResult> {
  const { tier } = options;

  console.log('\n   Web Crawl Pipeline');

  // Step 1: Load sources
  const { sources } = (await loadWebSourcesStep.execute({
    inputData: { tier },
  } as any)) as {
    sources: {
      url: string;
      name: string;
      deepCrawl: boolean;
      maxPages: number;
      includePaths?: string[];
      excludePaths?: string[];
      sourceType: string;
    }[];
  };

  console.log(`   Processing ${sources.length} web sources`);

  // Step 2: Process each source
  let totalExtracted = 0;
  let totalMatched = 0;
  let totalQueued = 0;
  const allErrors: string[] = [];

  for (const source of sources) {
    const result = (await processWebSourceStep.execute({
      inputData: source,
    } as any)) as {
      pagesCrawled: number;
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
    `   Web summary: ${sources.length} sources -> ${totalExtracted} promises -> ${totalQueued} queued`
  );

  return {
    extracted: totalExtracted,
    matched: totalMatched,
    queued: totalQueued,
    errors: allErrors,
  };
}
