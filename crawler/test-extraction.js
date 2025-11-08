#!/usr/bin/env node
const FirecrawlApp = require('@mendable/firecrawl-js').default;
const OpenAI = require('openai').default;
require('dotenv').config();

async function testExtraction() {
  const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const url = 'https://www.gov.ie/en/department-of-housing-local-government-and-heritage/campaigns/housing-for-all/';

  console.log('🔍 Scraping:', url);
  const result = await firecrawl.scrapeUrl(url, { formats: ['markdown'], onlyMainContent: true });

  console.log(`✓ Got ${result.markdown.length} chars\n`);
  console.log('📄 Content preview (first 1000 chars):');
  console.log(result.markdown.substring(0, 1000));
  console.log('\n...\n');

  console.log('🤖 Asking OpenAI to extract promises...\n');

  const prompt = `Analyze this Irish government housing policy page and extract SPECIFIC, MEASURABLE promises.

Look for commitments like:
- "Build X homes by YEAR"
- "Invest €X million"
- "Reduce waiting lists by X%"
- "Introduce new scheme"

Be lenient - if it mentions a specific target or commitment, extract it.

CONTENT:
${result.markdown}

Return JSON array of promises, or [] if none found:
[{
  "politician_name": "Government" or specific minister if mentioned,
  "party": "Coalition Government" or specific party,
  "promise_title": "Brief title with action verb",
  "description": "Full description",
  "category": "Housing",
  "promise_date": "2024-01-01",
  "target_date": null or "YYYY-MM-DD",
  "quote": "direct quote if available",
  "confidence": 0-100,
  "source_url": "${url}",
  "source_type": "press_release"
}]`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });

  const text = response.choices[0].message.content;
  console.log('📋 OpenAI Response:');
  console.log(text);

  try {
    const parsed = JSON.parse(text);
    const promises = Array.isArray(parsed) ? parsed : parsed.promises || [];
    console.log(`\n✓ Extracted ${promises.length} promises`);
    if (promises.length > 0) {
      console.log(JSON.stringify(promises, null, 2));
    }
  } catch (e) {
    console.error('Failed to parse:', e);
  }
}

testExtraction().catch(console.error);
