import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BatchConfig {
  batchNumber: number;
  day: 'saturday' | 'sunday';
  hour: number;
  councils: string[];
}

export interface RateLimitConfig {
  interRequestDelayMs: number;
  rateLimitPauseMs: number;
  maxRetries: number;
  backoffMultiplier: number;
  initialBackoffMs: number;
}

export interface CrawlConfig {
  batches: BatchConfig[];
  rateLimit: RateLimitConfig;
  changeDetection: {
    suspiciousChangeThreshold: number;
    requireManualConfirmationAboveThreshold: boolean;
  };
  notifications: {
    sendWeeklySummary: boolean;
    sendImmediateAlertOnSuspiciousChange: boolean;
  };
}

export interface ScheduledBatch extends BatchConfig {
  scheduledTime: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface BatchResult {
  batchNumber: number;
  councils: {
    county: string;
    status: 'success' | 'no_change' | 'error' | 'suspicious' | 'skipped';
    councillorCount?: number;
    error?: string;
    changesDetected?: boolean;
  }[];
  startTime: Date;
  endTime: Date;
  successCount: number;
  errorCount: number;
}

const CONFIG_PATH = path.join(__dirname, '..', '..', 'council-crawl-config.json');

/**
 * Load crawl configuration
 */
export function loadConfig(): CrawlConfig {
  const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(content) as CrawlConfig;
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Check if a date is Saturday
 */
function isSaturday(date: Date): boolean {
  return getDayOfWeek(date) === 6;
}

/**
 * Check if a date is Sunday
 */
function isSunday(date: Date): boolean {
  return getDayOfWeek(date) === 0;
}

/**
 * Check if a date is a weekend day
 */
export function isWeekend(date: Date = new Date()): boolean {
  return isSaturday(date) || isSunday(date);
}

/**
 * Create weekend schedule starting from the given date
 * Returns batches with scheduled times
 */
export function createWeekendSchedule(startDate: Date = new Date()): ScheduledBatch[] {
  const config = loadConfig();
  const scheduledBatches: ScheduledBatch[] = [];

  // Find the next Saturday
  let saturday = new Date(startDate);
  while (!isSaturday(saturday)) {
    saturday.setDate(saturday.getDate() + 1);
  }
  saturday.setHours(0, 0, 0, 0);

  // Find Sunday
  const sunday = new Date(saturday);
  sunday.setDate(sunday.getDate() + 1);

  for (const batch of config.batches) {
    const baseDate = batch.day === 'saturday' ? saturday : sunday;
    const scheduledTime = new Date(baseDate);
    scheduledTime.setHours(batch.hour, 0, 0, 0);

    scheduledBatches.push({
      ...batch,
      scheduledTime,
      status: 'pending',
    });
  }

  return scheduledBatches.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
}

/**
 * Find the batch that should run at the current time
 * Returns null if no batch is scheduled for the current time window
 */
export function findBatchForTime(
  schedule: ScheduledBatch[],
  currentTime: Date = new Date()
): ScheduledBatch | null {
  // Find batch where current time is within 1 hour of scheduled time
  const oneHourMs = 60 * 60 * 1000;

  for (const batch of schedule) {
    const timeDiff = Math.abs(currentTime.getTime() - batch.scheduledTime.getTime());
    if (timeDiff < oneHourMs) {
      return batch;
    }
  }

  return null;
}

/**
 * Find batch by number
 */
export function findBatchByNumber(
  schedule: ScheduledBatch[],
  batchNumber: number
): ScheduledBatch | null {
  return schedule.find(b => b.batchNumber === batchNumber) || null;
}

/**
 * Check if this is the last batch of the weekend
 */
export function isLastBatch(schedule: ScheduledBatch[], batch: ScheduledBatch): boolean {
  const sortedSchedule = [...schedule].sort(
    (a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime()
  );
  return sortedSchedule[0].batchNumber === batch.batchNumber;
}

/**
 * Get next scheduled batch time
 */
export function getNextScheduledTime(currentTime: Date = new Date()): Date | null {
  const schedule = createWeekendSchedule(currentTime);

  for (const batch of schedule) {
    if (batch.scheduledTime > currentTime) {
      return batch.scheduledTime;
    }
  }

  // If no batches left this weekend, get next weekend's first batch
  const nextWeekend = new Date(currentTime);
  nextWeekend.setDate(nextWeekend.getDate() + 7);
  const nextSchedule = createWeekendSchedule(nextWeekend);

  return nextSchedule.length > 0 ? nextSchedule[0].scheduledTime : null;
}

/**
 * Calculate delay with exponential backoff
 */
export function calculateBackoff(
  attempt: number,
  config: RateLimitConfig
): number {
  return config.initialBackoffMs * Math.pow(config.backoffMultiplier, attempt - 1);
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

/**
 * Get all councils from config
 */
export function getAllCouncils(): string[] {
  const config = loadConfig();
  const councils: string[] = [];

  for (const batch of config.batches) {
    councils.push(...batch.councils);
  }

  return councils;
}
