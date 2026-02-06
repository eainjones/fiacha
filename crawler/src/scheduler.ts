#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { runPipeline, CrawlMode } from './pipelines/run-pipeline';

/**
 * Local development scheduler
 *
 * Runs the same staggered pipeline schedule locally using simple setInterval.
 * Matches the Vercel cron schedule defined in vercel.json:
 *
 * | UTC  | Pipeline    | Why                              |
 * |------|-------------|----------------------------------|
 * | 02:00| RSS         | Catch overnight news             |
 * | 06:00| Oireachtas  | Parliamentary data morning       |
 * | 10:00| RSS         | Midday news cycle                |
 * | 14:00| Web         | Government press releases        |
 * | 18:00| RSS         | Evening news roundup             |
 * | 22:00| Oireachtas  | End-of-day filings               |
 *
 * Usage:
 *   npm run crawl:schedule           # Run scheduler
 *   npm run crawl:schedule -- --now  # Run all pipelines immediately then schedule
 */

interface ScheduleEntry {
  hour: number;
  mode: CrawlMode;
  label: string;
}

const SCHEDULE: ScheduleEntry[] = [
  { hour: 2, mode: 'rss', label: 'RSS (overnight news)' },
  { hour: 6, mode: 'oireachtas', label: 'Oireachtas (morning)' },
  { hour: 10, mode: 'rss', label: 'RSS (midday)' },
  { hour: 14, mode: 'web', label: 'Web (afternoon)' },
  { hour: 18, mode: 'rss', label: 'RSS (evening)' },
  { hour: 22, mode: 'oireachtas', label: 'Oireachtas (end-of-day)' },
];

let isRunning = false;

async function runScheduledPipeline(entry: ScheduleEntry) {
  if (isRunning) {
    console.log(`[Scheduler] Skipping ${entry.label} — previous pipeline still running`);
    return;
  }

  isRunning = true;
  console.log(`\n[Scheduler] ${new Date().toISOString()} — Starting: ${entry.label}`);

  try {
    const result = await runPipeline(entry.mode, { skipEmail: true });
    console.log(
      `[Scheduler] ${entry.label} complete: ` +
      `${result.promisesExtracted} extracted, ${result.queuedForReview} queued, ` +
      `${result.errors.length} errors, ${(result.duration / 1000).toFixed(1)}s`
    );
  } catch (error) {
    console.error(`[Scheduler] ${entry.label} failed:`, error);
  } finally {
    isRunning = false;
  }
}

function getNextRun(): { entry: ScheduleEntry; delayMs: number } | null {
  const now = new Date();
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  // Find the next scheduled entry
  for (const entry of SCHEDULE) {
    const entryMinutes = entry.hour * 60;
    if (entryMinutes > currentMinutes) {
      return {
        entry,
        delayMs: (entryMinutes - currentMinutes) * 60 * 1000,
      };
    }
  }

  // Wrap to first entry tomorrow
  const firstEntry = SCHEDULE[0];
  const minutesUntilMidnight = (24 * 60) - currentMinutes;
  return {
    entry: firstEntry,
    delayMs: (minutesUntilMidnight + firstEntry.hour * 60) * 60 * 1000,
  };
}

function scheduleNext() {
  const next = getNextRun();
  if (!next) return;

  const hours = Math.floor(next.delayMs / (1000 * 60 * 60));
  const minutes = Math.floor((next.delayMs % (1000 * 60 * 60)) / (1000 * 60));
  console.log(`[Scheduler] Next: ${next.entry.label} in ${hours}h ${minutes}m`);

  setTimeout(async () => {
    await runScheduledPipeline(next.entry);
    scheduleNext();
  }, next.delayMs);
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Fiacha Crawler — Local Scheduler            ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log('Schedule (UTC):');
  for (const entry of SCHEDULE) {
    console.log(`  ${String(entry.hour).padStart(2, '0')}:00 — ${entry.label}`);
  }
  console.log('');

  // --now flag: run all pipelines immediately
  if (process.argv.includes('--now')) {
    console.log('[Scheduler] --now flag: running all pipelines immediately\n');
    for (const entry of SCHEDULE) {
      await runScheduledPipeline(entry);
    }
  }

  scheduleNext();

  // Keep process alive
  console.log('[Scheduler] Running... Press Ctrl+C to stop.\n');
}

main().catch((error) => {
  console.error('[Scheduler] Fatal error:', error);
  process.exit(1);
});
