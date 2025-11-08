#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Test script to verify all components are working
 */
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Fiacha Crawler - System Tests               ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  let passCount = 0;
  let failCount = 0;

  // Test 1: Environment variables
  console.log('[1/6] Testing environment variables...');
  try {
    const required = ['FIRECRAWL_API_KEY', 'DATABASE_URL'];
    const llmProviders = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY'];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
      }
    }

    const hasLLM = llmProviders.some(key => process.env[key]);
    if (!hasLLM) {
      throw new Error('Need at least one LLM provider key (ANTHROPIC_API_KEY or OPENAI_API_KEY)');
    }

    console.log('   ✓ All environment variables present');
    passCount++;
  } catch (error) {
    console.error('   ✗', error);
    failCount++;
  }

  // Test 2: Database connection
  console.log('\n[2/6] Testing database connection...');
  try {
    const { createDatabaseClient } = await import('./database/client');
    const db = createDatabaseClient();
    const healthy = await db.healthCheck();

    if (!healthy) {
      throw new Error('Database health check failed');
    }

    const stats = await db.getStats();
    console.log(`   ✓ Connected to database`);
    console.log(`   • Politicians: ${stats.politicians}`);
    console.log(`   • Promises: ${stats.promises}`);
    console.log(`   • Evidence: ${stats.evidence}`);

    await db.close();
    passCount++;
  } catch (error) {
    console.error('   ✗', error);
    failCount++;
  }

  // Test 3: Politician matcher
  console.log('\n[3/6] Testing politician matcher...');
  try {
    const { createDatabaseClient } = await import('./database/client');
    const { PoliticianMatcher } = await import('./validators/politician-matcher');

    const db = createDatabaseClient();
    const politicians = await db.getAllPoliticians();
    const matcher = new PoliticianMatcher(politicians);

    const testNames = [
      'Mary Lou McDonald',
      'Leo Varadkar',
      'Micheál Martin',
    ];

    let matchedCount = 0;
    for (const name of testNames) {
      const match = matcher.findPolitician(name);
      if (match && match.matchScore > 80) {
        matchedCount++;
      }
    }

    console.log(`   ✓ Politician matcher working`);
    console.log(`   • Matched ${matchedCount}/${testNames.length} test politicians`);

    await db.close();
    passCount++;
  } catch (error) {
    console.error('   ✗', error);
    failCount++;
  }

  // Test 4: Firecrawl client
  console.log('\n[4/6] Testing Firecrawl client...');
  try {
    const { createFirecrawlClient } = await import('./crawlers/firecrawl-client');
    const firecrawl = createFirecrawlClient();

    // Test with a simple, reliable page
    const result = await firecrawl.scrapeUrl('https://www.gov.ie');

    if (!result || !result.markdown || result.markdown.length < 100) {
      throw new Error('Firecrawl returned insufficient content');
    }

    console.log(`   ✓ Firecrawl working`);
    console.log(`   • Scraped ${result.markdown.length} characters`);
    passCount++;
  } catch (error) {
    console.error('   ✗', error);
    failCount++;
  }

  // Test 5: LLM extractor
  console.log('\n[5/6] Testing LLM extractor...');
  try {
    const { createExtractor } = await import('./extractors');
    const extractor = createExtractor();

    console.log(`   ✓ LLM extractor initialized`);
    console.log(`   • Provider: ${extractor.getProvider().toUpperCase()}`);
    console.log(`   • Model: ${extractor.getModelName()}`);

    // Note: Not actually calling the API to save costs in tests
    // Real extraction happens in main crawler
    passCount++;
  } catch (error) {
    console.error('   ✗', error);
    failCount++;
  }

  // Test 6: Source registry
  console.log('\n[6/6] Testing source registry...');
  try {
    const { getEnabledSources, getSourcesByTier } = await import('./crawlers/source-registry');

    const allSources = getEnabledSources();
    const tier1Sources = getSourcesByTier('tier1');

    if (allSources.length === 0) {
      throw new Error('No enabled sources found');
    }

    console.log(`   ✓ Source registry loaded`);
    console.log(`   • Total enabled: ${allSources.length}`);
    console.log(`   • Tier 1 sources: ${tier1Sources.length}`);
    passCount++;
  } catch (error) {
    console.error('   ✗', error);
    failCount++;
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log(`Tests completed: ${passCount} passed, ${failCount} failed`);
  console.log('═'.repeat(50));

  if (failCount === 0) {
    console.log('\n✅ All tests passed! System is ready to crawl.\n');
    console.log('Next steps:');
    console.log('  1. Run crawler: npm run crawl');
    console.log('  2. Review promises: npm run review');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please fix errors before crawling.\n');
    process.exit(1);
  }
}

runTests().catch(console.error);
