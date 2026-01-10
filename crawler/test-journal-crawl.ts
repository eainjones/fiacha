#!/usr/bin/env npx tsx
/**
 * Test crawl using RTÉ RSS feeds
 *
 * Uses RSS to discover articles, then Firecrawl to get content
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import { createFirecrawlClient } from './src/crawlers/firecrawl-client';
import { extractPromises, checkBudget, isAIConfigured } from './src/ai';
import { fetchRSSFeed, RSS_FEEDS } from './src/crawlers/rss-parser';

const SOURCE_NAME = 'RTÉ Politics (RSS)';

// Rate limiting config - be respectful to the site
const RATE_LIMIT = {
  delayBetweenRequests: 3000, // 3 seconds between requests
  maxArticles: 2,             // Only crawl 2 articles
};

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log(`║   ${SOURCE_NAME} Crawl Test                              ║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Check configuration
  if (!isAIConfigured()) {
    console.error('✗ ANTHROPIC_API_KEY not configured');
    process.exit(1);
  }

  const budget = await checkBudget();
  console.log(`Budget: $${budget.totalSpent.toFixed(4)} / $${budget.budgetLimit.toFixed(2)}`);

  if (!budget.canProceed) {
    console.error('✗ Budget exceeded');
    process.exit(1);
  }

  const startTime = Date.now();

  // Fetch RSS feed to get article URLs
  console.log(`\n[1/4] Fetching RSS feed...`);
  const feed = await fetchRSSFeed(RSS_FEEDS.RTE_POLITICS);

  // Get article URLs from RSS items
  const articleUrls = feed.items.slice(0, RATE_LIMIT.maxArticles).map(item => item.link);
  console.log(`\n   Found ${feed.items.length} articles, crawling ${articleUrls.length}:`);
  feed.items.slice(0, RATE_LIMIT.maxArticles).forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.title.substring(0, 60)}...`);
  });

  const firecrawl = createFirecrawlClient();

  // Crawl each article
  console.log(`\n[2/4] Crawling articles...`);
  const allPromises: any[] = [];

  for (const url of articleUrls) {
    console.log(`\n   📄 ${url}`);
    try {
      const result = await firecrawl.scrapeUrl(url);
      console.log(`      Content: ${result.markdown?.length || 0} chars`);

      if (!result.markdown || result.markdown.length < 200) {
        console.log(`      ⚠️ Skipping - content too short`);
        continue;
      }

      // Extract promises
      console.log(`      🤖 Extracting promises...`);
      const promises = await extractPromises(result.markdown, url, 50);
      console.log(`      Found ${promises.length} promise(s)`);

      allPromises.push(...promises.map(p => ({ ...p, source_url: url })));

      // Rate limiting - be respectful to the site
      console.log(`      ⏳ Waiting ${RATE_LIMIT.delayBetweenRequests / 1000}s before next request...`);
      await new Promise(r => setTimeout(r, RATE_LIMIT.delayBetweenRequests));
    } catch (error) {
      console.error(`      ✗ Error: ${error}`);
    }
  }

  console.log(`\n[3/4] Summary`);
  console.log(`   Total promises extracted: ${allPromises.length}`);

  // Display results
  console.log('\n[4/4] Extracted Promises');
  console.log('═'.repeat(60));

  if (allPromises.length === 0) {
    console.log('   No promises found in the current articles.');
    console.log('   This is normal - not every article contains political promises.');
  } else {
    for (const promise of allPromises) {
      console.log(`\n   Politician: ${promise.politician_name}`);
      console.log(`   Party: ${promise.party || 'Not specified'}`);
      console.log(`   Category: ${promise.category}`);
      console.log(`   Confidence: ${promise.confidence}%`);
      console.log(`   Promise: ${promise.promise_text.substring(0, 150)}...`);
      console.log(`   Source: ${promise.source_url}`);
      if (promise.target_date) {
        console.log(`   Target Date: ${promise.target_date}`);
      }
      console.log('   ' + '─'.repeat(50));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`Total time: ${Date.now() - startTime}ms`);
  console.log('✅ Crawl complete!\n');
}

main().catch(console.error);
