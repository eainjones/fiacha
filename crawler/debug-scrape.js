#!/usr/bin/env node
const FirecrawlApp = require('@mendable/firecrawl-js').default;
require('dotenv').config();

async function debugScrape() {
  const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

  const testUrls = [
    'https://www.gov.ie/en/press-release/d4c78-budget-2024/',
    'https://www.gov.ie/en/publication/7cd13-housing-for-all/',
    'https://www.rte.ie/news/politics/2024/1009/1473829-budget-2024/',
  ];

  for (const url of testUrls) {
    console.log(`\n🔍 Testing: ${url}`);
    try {
      const result = await firecrawl.scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true
      });

      console.log(`✓ Scraped ${result.markdown.length} characters`);
      console.log(`\nFirst 500 chars:\n${result.markdown.substring(0, 500)}\n`);
      console.log(`Last 500 chars:\n${result.markdown.substring(result.markdown.length - 500)}\n`);
    } catch (error) {
      console.error(`✗ Error:`, error.message);
    }
  }
}

debugScrape();
