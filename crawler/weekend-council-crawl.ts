#!/usr/bin/env npx tsx
/**
 * Weekend Council Crawl
 *
 * Staggered weekend crawl system for detecting councillor changes on council websites.
 * Designed to run as cron jobs on weekends to avoid rate limits while keeping data current.
 *
 * Usage:
 *   npx tsx weekend-council-crawl.ts                    # Auto-detect which batch to run
 *   npx tsx weekend-council-crawl.ts --batch 1          # Run specific batch
 *   npx tsx weekend-council-crawl.ts --batch all        # Run all batches (testing)
 *   npx tsx weekend-council-crawl.ts --dry-run          # Show what would run without scraping
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

import { createFirecrawlClient, RateLimitError } from './src/crawlers/firecrawl-client';
import { COUNCIL_URLS, getCouncilByCounty } from './src/crawlers/council-urls';
import { extractCouncillors } from './src/crawlers/councillor-extractor';
import { detectChanges, updateMetadataAfterCrawl } from './src/crawlers/change-detector';
import {
  logChange,
  logNoChange,
  logError,
  logSuspiciousChange,
  logBatchStart,
  logBatchComplete,
  generateWeeklySummary,
  cleanOldLogs,
} from './src/crawlers/change-logger';
import {
  loadConfig,
  createWeekendSchedule,
  findBatchForTime,
  findBatchByNumber,
  isLastBatch,
  isWeekend,
  sleep,
  formatDuration,
  ScheduledBatch,
  BatchResult,
} from './src/crawlers/council-batch-scheduler';
import { EmailNotifier } from './src/notifications/email-notifier';

const DATA_DIR = path.join(__dirname, '..', 'data');

interface CrawlOptions {
  batchNumber?: number | 'all';
  dryRun: boolean;
  force: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): CrawlOptions {
  const args = process.argv.slice(2);
  const options: CrawlOptions = {
    dryRun: false,
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch' && args[i + 1]) {
      const value = args[i + 1];
      options.batchNumber = value === 'all' ? 'all' : parseInt(value, 10);
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (args[i] === '--force') {
      options.force = true;
    }
  }

  return options;
}

/**
 * Save councillors to CSV file
 */
function saveToCSV(county: string, councillors: string[]): void {
  const dirPath = path.join(DATA_DIR, county, 'structured');
  fs.mkdirSync(dirPath, { recursive: true });

  const csvPath = path.join(dirPath, 'councillors_canonical.csv');
  const content = 'councillor_name\n' + councillors.join('\n') + '\n';

  fs.writeFileSync(csvPath, content);
  console.log(`  [Save] Wrote ${councillors.length} councillors to CSV`);
}

/**
 * Process a single council
 */
async function processCouncil(
  county: string,
  client: ReturnType<typeof createFirecrawlClient>,
  config: ReturnType<typeof loadConfig>,
  dryRun: boolean
): Promise<{ status: 'success' | 'no_change' | 'error' | 'suspicious' | 'skipped'; councillorCount?: number; error?: string; changesDetected?: boolean }> {
  const council = getCouncilByCounty(county);
  if (!council) {
    return { status: 'error', error: `Unknown county: ${county}` };
  }

  console.log(`\n[${county}] Processing ${council.authority}...`);

  if (dryRun) {
    console.log(`  [Dry Run] Would scrape: ${council.url}`);
    return { status: 'skipped' };
  }

  try {
    // Scrape the council website
    const result = await client.scrapeUrl(council.url, true); // Handle rate limits externally
    const councillors = extractCouncillors(result.markdown, council.authority);

    if (councillors.length === 0) {
      const error = 'No councillors extracted from content';
      console.log(`  [Warning] ${error}`);
      logError(county, error);
      return { status: 'error', error };
    }

    console.log(`  [Extract] Found ${councillors.length} councillors`);

    // Detect changes
    const changeResult = detectChanges(county, councillors, config.changeDetection.suspiciousChangeThreshold);

    if (!changeResult.hasChanges) {
      console.log(`  [No Change] Content hash unchanged`);
      logNoChange(county, changeResult.newHash, councillors.length);
      updateMetadataAfterCrawl(county, changeResult, councillors.length);
      return { status: 'no_change', councillorCount: councillors.length };
    }

    // Changes detected
    console.log(`  [Change] +${changeResult.added.length} added, -${changeResult.removed.length} removed`);

    if (changeResult.isSuspicious) {
      console.log(`  [Suspicious] ${changeResult.suspiciousReason}`);
      logSuspiciousChange(county, changeResult);

      // Send immediate alert if configured
      if (config.notifications.sendImmediateAlertOnSuspiciousChange) {
        try {
          const notifier = new EmailNotifier();
          await notifier.sendSuspiciousChangeAlert(
            county,
            changeResult.added,
            changeResult.removed,
            changeResult.suspiciousReason || 'Large change detected'
          );
        } catch (emailError) {
          console.error(`  [Email] Failed to send alert:`, emailError);
        }
      }

      // Don't auto-apply suspicious changes
      updateMetadataAfterCrawl(county, changeResult, councillors.length);
      return {
        status: 'suspicious',
        councillorCount: councillors.length,
        changesDetected: true,
      };
    }

    // Apply normal changes
    logChange(county, changeResult);
    saveToCSV(county, councillors);
    updateMetadataAfterCrawl(county, changeResult, councillors.length);

    return {
      status: 'success',
      councillorCount: councillors.length,
      changesDetected: true,
    };

  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error; // Re-throw rate limit errors for batch handler
    }

    const errorMessage = (error as Error).message;
    console.error(`  [Error] ${errorMessage}`);
    logError(county, error as Error);
    return { status: 'error', error: errorMessage };
  }
}

/**
 * Run a single batch of councils
 */
async function runBatch(
  batch: ScheduledBatch,
  client: ReturnType<typeof createFirecrawlClient>,
  config: ReturnType<typeof loadConfig>,
  dryRun: boolean
): Promise<BatchResult> {
  const startTime = new Date();
  console.log(`\n=== BATCH ${batch.batchNumber} ===`);
  console.log(`Councils: ${batch.councils.join(', ')}`);
  console.log(`Scheduled for: ${batch.scheduledTime.toLocaleString()}`);

  logBatchStart(batch.batchNumber, batch.councils);

  const results: BatchResult['councils'] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < batch.councils.length; i++) {
    const county = batch.councils[i];

    // Inter-request delay (except for first request)
    if (i > 0) {
      const delayMs = config.rateLimit.interRequestDelayMs;
      console.log(`\n[Delay] Waiting ${formatDuration(delayMs)}...`);
      await sleep(delayMs);
    }

    try {
      const result = await processCouncil(county, client, config, dryRun);
      results.push({
        county,
        status: result.status,
        councillorCount: result.councillorCount,
        error: result.error,
        changesDetected: result.changesDetected,
      });

      if (result.status === 'success' || result.status === 'no_change') {
        successCount++;
      } else if (result.status === 'error') {
        errorCount++;
      }

    } catch (error) {
      if (error instanceof RateLimitError) {
        console.log(`\n[Rate Limit] Pausing for ${formatDuration(config.rateLimit.rateLimitPauseMs)}...`);
        await sleep(config.rateLimit.rateLimitPauseMs);

        // Retry this council
        i--; // Decrement to retry
        continue;
      }

      results.push({
        county,
        status: 'error',
        error: (error as Error).message,
      });
      errorCount++;
    }
  }

  const endTime = new Date();
  logBatchComplete(batch.batchNumber, successCount, errorCount);

  console.log(`\n=== BATCH ${batch.batchNumber} COMPLETE ===`);
  console.log(`Duration: ${formatDuration(endTime.getTime() - startTime.getTime())}`);
  console.log(`Success: ${successCount}, Errors: ${errorCount}`);

  return {
    batchNumber: batch.batchNumber,
    councils: results,
    startTime,
    endTime,
    successCount,
    errorCount,
  };
}

/**
 * Send weekend summary email
 */
async function sendWeekendSummary(config: ReturnType<typeof loadConfig>): Promise<void> {
  if (!config.notifications.sendWeeklySummary) {
    console.log('[Email] Weekend summary disabled in config');
    return;
  }

  try {
    const summary = generateWeeklySummary();
    const notifier = new EmailNotifier();

    await notifier.sendWeekendCouncilSummary({
      ...summary,
      nextScheduledRun: 'Next weekend',
    });

    console.log('[Email] Weekend summary sent');
  } catch (error) {
    console.error('[Email] Failed to send weekend summary:', error);
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('=== Weekend Council Crawl ===');
  console.log(`Time: ${new Date().toLocaleString()}`);

  const options = parseArgs();
  const config = loadConfig();
  const schedule = createWeekendSchedule();

  // Determine which batch to run
  let batchesToRun: ScheduledBatch[] = [];

  if (options.batchNumber === 'all') {
    batchesToRun = schedule;
    console.log(`\nRunning all ${schedule.length} batches`);
  } else if (typeof options.batchNumber === 'number') {
    const batch = findBatchByNumber(schedule, options.batchNumber);
    if (!batch) {
      console.error(`Batch ${options.batchNumber} not found`);
      process.exit(1);
    }
    batchesToRun = [batch];
    console.log(`\nRunning batch ${options.batchNumber}`);
  } else {
    // Auto-detect based on current time
    if (!isWeekend() && !options.force) {
      console.log('\nNot a weekend. Use --force to run anyway.');
      process.exit(0);
    }

    const batch = findBatchForTime(schedule);
    if (!batch) {
      console.log('\nNo batch scheduled for current time.');
      console.log('Use --batch N to run a specific batch.');
      console.log('\nSchedule:');
      for (const b of schedule) {
        console.log(`  Batch ${b.batchNumber}: ${b.scheduledTime.toLocaleString()} - ${b.councils.join(', ')}`);
      }
      process.exit(0);
    }
    batchesToRun = [batch];
    console.log(`\nAuto-detected batch ${batch.batchNumber}`);
  }

  if (options.dryRun) {
    console.log('\n[DRY RUN MODE] No actual scraping will occur\n');
  }

  // Initialize Firecrawl client (skip if dry run)
  let client: ReturnType<typeof createFirecrawlClient> | null = null;
  if (!options.dryRun) {
    try {
      client = createFirecrawlClient();
    } catch (error) {
      console.error('Failed to initialize Firecrawl client:', error);
      process.exit(1);
    }
  }

  // Run batches
  const allResults: BatchResult[] = [];
  for (const batch of batchesToRun) {
    const result = await runBatch(batch, client!, config, options.dryRun);
    allResults.push(result);

    // If this is the last batch, send weekend summary
    if (isLastBatch(schedule, batch) && !options.dryRun) {
      console.log('\n[Summary] This was the last batch - sending weekend summary...');
      await sendWeekendSummary(config);

      // Clean old logs
      cleanOldLogs();
    }

    // Delay between batches if running all
    if (batchesToRun.length > 1 && batch !== batchesToRun[batchesToRun.length - 1]) {
      console.log('\n[Delay] Waiting 5 minutes between batches...');
      await sleep(5 * 60 * 1000);
    }
  }

  // Final summary
  console.log('\n=== FINAL SUMMARY ===');
  let totalSuccess = 0;
  let totalErrors = 0;
  for (const result of allResults) {
    console.log(`Batch ${result.batchNumber}: ${result.successCount} success, ${result.errorCount} errors`);
    totalSuccess += result.successCount;
    totalErrors += result.errorCount;
  }
  console.log(`Total: ${totalSuccess} success, ${totalErrors} errors`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
