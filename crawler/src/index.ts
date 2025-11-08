#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { createFirecrawlClient } from './crawlers/firecrawl-client';
import { getEnabledSources } from './crawlers/source-registry';
import { createExtractor } from './extractors';
import { createDatabaseClient } from './database/client';
import { PoliticianMatcher, normalizePoliticianName } from './validators/politician-matcher';
import { insertPromiseReview } from './database/queries';
import { ExtractedPromiseType } from './types';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Main crawler orchestrator
 * Crawls sources → Extracts promises → Matches politicians → Saves to review queue
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Fiacha Promise Crawler - Main Pipeline      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // 1. Initialize clients
    console.log('[1/6] Initializing clients...');
    const firecrawl = createFirecrawlClient();
    const extractor = createExtractor();
    const db = createDatabaseClient();

    console.log(`   • Firecrawl: ✓`);
    console.log(`   • LLM Extractor: ${extractor.getProvider().toUpperCase()} (${extractor.getModelName()})`);
    console.log(`   • Database: ✓`);

    // 2. Verify connections
    console.log('\n[2/6] Verifying connections...');
    const dbHealthy = await db.healthCheck();
    if (!dbHealthy) {
      throw new Error('Database health check failed');
    }

    // 3. Load politicians for matching
    console.log('\n[3/6] Loading politicians...');
    const politicians = await db.getAllPoliticians();
    const matcher = new PoliticianMatcher(politicians);
    const matcherStats = matcher.getStats();
    console.log(`   • Total politicians: ${matcherStats.total}`);
    console.log(`   • Active: ${matcherStats.active}`);
    console.log(`   • TDs: ${matcherStats.byPositionType['TD'] || 0}`);
    console.log(`   • Councillors: ${matcherStats.byPositionType['Councillor'] || 0}`);

    // 4. Get sources to crawl
    console.log('\n[4/6] Loading crawl sources...');
    const sources = getEnabledSources();
    console.log(`   • Found ${sources.length} enabled sources`);

    if (sources.length === 0) {
      console.log('\n⚠️  No enabled sources found. Update source-registry.ts');
      return;
    }

    for (const source of sources) {
      console.log(`   • [${source.tier}] ${source.name}`);
    }

    // 5. Crawl and extract
    console.log('\n[5/6] Crawling sources and extracting promises...');
    let totalExtracted = 0;
    let totalMatched = 0;
    let totalQueued = 0;

    for (const source of sources) {
      console.log(`\n   📡 Crawling: ${source.name}`);

      try {
        let crawlResults = [];

        // Use deep crawl or single page scrape
        if (source.deepCrawl) {
          console.log(`      🔍 Deep crawling (max ${source.maxPages} pages)...`);
          crawlResults = await firecrawl.crawlWebsite(source.url, {
            maxPages: source.maxPages,
            includePaths: source.includePaths,
            excludePaths: source.excludePaths,
          });
          console.log(`      ✓ Crawled ${crawlResults.length} pages`);
        } else {
          // Single page scrape
          const singleResult = await firecrawl.scrapeUrl(source.url);
          crawlResults = [singleResult];
        }

        // Extract promises from each crawled page
        for (const crawlResult of crawlResults) {
          // Update source type in crawl result
          const enrichedResult = {
            ...crawlResult,
            sourceType: source.sourceType,
          };

          const promises = await extractor.extractPromises(enrichedResult as any);
          totalExtracted += promises.length;

          if (promises.length === 0) {
            continue;
          }

          console.log(`      📄 Found ${promises.length} promises in ${crawlResult.url}`);

          // Match politicians and queue for review
          for (const promise of promises) {
            // Normalize and match politician
            const normalizedName = normalizePoliticianName(promise.politician_name);
            const match = matcher.findPolitician(
              normalizedName,
              promise.party,
              undefined
            );

            if (match) {
              console.log(`      ✓ Matched: "${promise.politician_name}" → ${match.name} (${match.matchScore}%)`);
              totalMatched++;
            } else {
              console.log(`      ⚠️  No match: "${promise.politician_name}"`);
            }

            // Insert into review queue
            const reviewId = await insertPromiseReview(db, promise, match);
            console.log(`      📝 Queued for review (ID: ${reviewId})`);
            totalQueued++;
          }
        }

        if (totalExtracted === 0) {
          console.log('      No promises found in this source');
        }
      } catch (error) {
        console.error(`      ✗ Error processing ${source.name}:`, error);
      }
    }

    // 6. Summary
    console.log('\n[6/6] Summary');
    console.log('═'.repeat(50));
    console.log(`   Sources crawled: ${sources.length}`);
    console.log(`   Promises extracted: ${totalExtracted}`);
    console.log(`   Politicians matched: ${totalMatched}`);
    console.log(`   Queued for review: ${totalQueued}`);
    console.log(`   Unmatched: ${totalExtracted - totalMatched}`);
    console.log('═'.repeat(50));

    console.log('\n✅ Crawl complete! Run "npm run review" to review extracted promises.\n');

    // Cleanup
    await db.close();
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main };
