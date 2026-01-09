#!/usr/bin/env npx tsx
/**
 * Test script to verify Mastra AI extraction works correctly
 */
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Override to use staging database
process.env.DATABASE_URL = process.env.STAGING_DATABASE_URL || process.env.DATABASE_URL;

import { isAIConfigured, extractPromises, checkBudget, getTodaySummary } from './src/ai';

const TEST_CONTENT = `
Housing Minister Darragh O'Brien has announced that the government will deliver 30,000 new homes by 2025.

"We are committed to solving the housing crisis," Minister O'Brien said at a press conference today.
"By the end of 2025, we will have built or acquired 30,000 affordable homes across Ireland."

The plan includes:
- 10,000 social housing units in Dublin
- 5,000 affordable purchase homes nationwide
- 15,000 cost rental properties

Taoiseach Simon Harris welcomed the announcement, saying: "This government will ensure every family has a place to call home. We will also invest €500 million in housing infrastructure."

Opposition TD Mary Lou McDonald criticised the plan, stating: "Fine Gael has been making these promises for years. We in Sinn Féin will hold them accountable."
`;

async function main() {
  console.log('\\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Mastra AI Extraction Test                            ║');
  console.log('╚════════════════════════════════════════════════════════╝\\n');

  // Check AI configuration
  console.log('[1/4] Checking AI configuration...');
  const configured = isAIConfigured();
  if (!configured) {
    console.error('   ✗ AI not configured - ANTHROPIC_API_KEY missing');
    console.log('   Set ANTHROPIC_API_KEY in crawler/.env');
    process.exit(1);
  }
  console.log('   ✓ AI configured with ANTHROPIC_API_KEY');

  // Check budget
  console.log('\\n[2/4] Checking AI budget...');
  const budget = await checkBudget();
  console.log(`   • Total spent today: $${budget.totalSpent.toFixed(4)}`);
  console.log(`   • Budget limit: $${budget.budgetLimit.toFixed(2)}`);
  console.log(`   • Can proceed: ${budget.canProceed ? '✓' : '✗'}`);

  if (!budget.canProceed) {
    console.error('   ✗ Budget exceeded - cannot run extraction');
    process.exit(1);
  }

  // Run extraction
  console.log('\\n[3/4] Running extraction on test content...');
  console.log('   Content length:', TEST_CONTENT.length, 'characters');

  try {
    const startTime = Date.now();
    const promises = await extractPromises(TEST_CONTENT, 'https://test.example.com/housing-announcement', 50);
    const duration = Date.now() - startTime;

    console.log(`\\n   ✓ Extraction completed in ${duration}ms`);
    console.log(`   Found ${promises.length} promise(s):\\n`);

    for (const promise of promises) {
      console.log('   ─────────────────────────────────────────');
      console.log(`   Politician: ${promise.politician_name}`);
      console.log(`   Party: ${promise.party || 'Not specified'}`);
      console.log(`   Category: ${promise.category}`);
      console.log(`   Confidence: ${promise.confidence}%`);
      console.log(`   Promise: ${promise.promise_text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('   ✗ Extraction failed:', error);
    process.exit(1);
  }

  // Check updated budget
  console.log('\\n[4/4] Updated budget status...');
  const summary = await getTodaySummary();
  if (summary) {
    console.log(`   • Total cost today: $${summary.totalCost.toFixed(4)}`);
    console.log(`   • Total requests: ${summary.requestCount}`);
    for (const [agent, stats] of Object.entries(summary.byAgent)) {
      console.log(`   • ${agent}: $${stats.cost.toFixed(4)} (${stats.requests} requests)`);
    }
  } else {
    console.log('   No usage logged yet (or budget tracking not initialized)');
  }

  console.log('\\n✅ Mastra extraction test completed successfully!\\n');
}

main().catch(console.error);
