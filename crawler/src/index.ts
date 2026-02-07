#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables BEFORE any other imports that read env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { runPipeline, CrawlMode } from './pipelines/run-pipeline.js';
import { EmailNotifier } from './notifications/email-notifier.js';
/**
 * CLI entry point for the crawler.
 * Delegates to the shared runPipeline function and adds CLI-specific
 * features (banner, email notifications, exit codes).
 */
async function main() {
  const mode = (process.argv[2] || 'all') as CrawlMode;
  const validModes: CrawlMode[] = ['all', 'oireachtas', 'rss', 'web', 'tier1', 'tier2', 'tier3'];
  if (!validModes.includes(mode)) {
    console.error(`Invalid mode: ${mode}. Valid modes: ${validModes.join(', ')}`);
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Fiacha Promise Crawler - Main Pipeline      ║');
  console.log(`║   Mode: ${mode.padEnd(39)}║`);
  console.log('╚════════════════════════════════════════════════╝\n');

  const result = await runPipeline(mode);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log(`   Mode: ${result.mode}`);
  console.log(`   Promises extracted: ${result.promisesExtracted}`);
  console.log(`   Politicians matched: ${result.politiciansMatched}`);
  console.log(`   Queued for review: ${result.queuedForReview}`);
  console.log(`   Errors: ${result.errors.length}`);
  console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
  console.log('═'.repeat(50));

  console.log('\n✅ Crawl complete! Run "npm run review" to review extracted promises.\n');

  // Send email notification
  try {
    const emailNotifier = new EmailNotifier();
    await emailNotifier.sendDailySummary({
      timestamp: new Date(),
      sourcesCrawled: 0,
      promisesExtracted: result.promisesExtracted,
      politiciansMatched: result.politiciansMatched,
      queuedForReview: result.queuedForReview,
      unmatched: result.promisesExtracted - result.politiciansMatched,
      promises: [],
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
  }

  if (!result.success) {
    process.exit(1);
  }
}

// Run if executed directly (ESM pattern)
main();

export { main };
