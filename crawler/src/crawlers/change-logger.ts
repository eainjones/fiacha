import * as fs from 'fs';
import * as path from 'path';
import { ChangeResult } from './change-detector';

export interface CrawlLogEntry {
  timestamp: string;
  county: string;
  status: 'success' | 'no_change' | 'error' | 'suspicious';
  message: string;
  details?: {
    added?: string[];
    removed?: string[];
    councillorCount?: number;
    hash?: string;
    error?: string;
  };
}

export interface WeeklySummary {
  weekStarting: string;
  weekEnding: string;
  totalCouncilsChecked: number;
  councilsWithChanges: number;
  councilsWithErrors: number;
  suspiciousChanges: number;
  changesByCounty: {
    county: string;
    added: string[];
    removed: string[];
    date: string;
  }[];
  errors: {
    county: string;
    error: string;
    date: string;
  }[];
}

const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'council-changes.log');
const JSON_LOG_FILE = path.join(LOGS_DIR, 'council-changes.json');

/**
 * Ensure logs directory exists
 */
function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

/**
 * Format timestamp for log output
 */
function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Append to text log file
 */
function appendToTextLog(message: string): void {
  ensureLogsDir();
  fs.appendFileSync(LOG_FILE, message + '\n');
}

/**
 * Load JSON log entries
 */
function loadJsonLog(): CrawlLogEntry[] {
  ensureLogsDir();

  if (!fs.existsSync(JSON_LOG_FILE)) {
    return [];
  }

  try {
    const content = fs.readFileSync(JSON_LOG_FILE, 'utf-8');
    return JSON.parse(content) as CrawlLogEntry[];
  } catch {
    return [];
  }
}

/**
 * Save JSON log entries
 */
function saveJsonLog(entries: CrawlLogEntry[]): void {
  ensureLogsDir();

  // Keep only last 1000 entries
  if (entries.length > 1000) {
    entries = entries.slice(-1000);
  }

  fs.writeFileSync(JSON_LOG_FILE, JSON.stringify(entries, null, 2));
}

/**
 * Add entry to JSON log
 */
function addJsonLogEntry(entry: CrawlLogEntry): void {
  const entries = loadJsonLog();
  entries.push(entry);
  saveJsonLog(entries);
}

/**
 * Log a successful change detection
 */
export function logChange(county: string, change: ChangeResult): void {
  const timestamp = formatTimestamp();

  let textMessage = `[${timestamp}] ${county}: CHANGE DETECTED\n`;
  if (change.added.length > 0) {
    textMessage += `  Added: ${change.added.join(', ')}\n`;
  }
  if (change.removed.length > 0) {
    textMessage += `  Removed: ${change.removed.join(', ')}\n`;
  }
  textMessage += `  Total: ${change.unchanged.length + change.removed.length} -> ${change.unchanged.length + change.added.length}`;

  appendToTextLog(textMessage);

  addJsonLogEntry({
    timestamp: new Date().toISOString(),
    county,
    status: change.isSuspicious ? 'suspicious' : 'success',
    message: `${change.added.length} added, ${change.removed.length} removed`,
    details: {
      added: change.added,
      removed: change.removed,
      councillorCount: change.unchanged.length + change.added.length,
      hash: change.newHash,
    },
  });
}

/**
 * Log no change detected
 */
export function logNoChange(county: string, hash: string, councillorCount: number): void {
  const timestamp = formatTimestamp();
  const textMessage = `[${timestamp}] ${county}: NO CHANGE (hash: ${hash.substring(0, 12)}..., count: ${councillorCount})`;

  appendToTextLog(textMessage);

  addJsonLogEntry({
    timestamp: new Date().toISOString(),
    county,
    status: 'no_change',
    message: 'No changes detected',
    details: {
      hash,
      councillorCount,
    },
  });
}

/**
 * Log an error
 */
export function logError(county: string, error: Error | string): void {
  const timestamp = formatTimestamp();
  const errorMessage = error instanceof Error ? error.message : error;
  const textMessage = `[${timestamp}] ${county}: ERROR - ${errorMessage}`;

  appendToTextLog(textMessage);

  addJsonLogEntry({
    timestamp: new Date().toISOString(),
    county,
    status: 'error',
    message: errorMessage,
    details: {
      error: errorMessage,
    },
  });
}

/**
 * Log suspicious change
 */
export function logSuspiciousChange(county: string, change: ChangeResult): void {
  const timestamp = formatTimestamp();
  const textMessage = `[${timestamp}] ${county}: SUSPICIOUS CHANGE - ${change.suspiciousReason}\n` +
    `  Added: ${change.added.length}, Removed: ${change.removed.length}\n` +
    `  Manual review required`;

  appendToTextLog(textMessage);

  addJsonLogEntry({
    timestamp: new Date().toISOString(),
    county,
    status: 'suspicious',
    message: change.suspiciousReason || 'Suspicious change detected',
    details: {
      added: change.added,
      removed: change.removed,
      councillorCount: change.unchanged.length + change.added.length,
      hash: change.newHash,
    },
  });
}

/**
 * Log batch start
 */
export function logBatchStart(batchNumber: number, councils: string[]): void {
  const timestamp = formatTimestamp();
  const textMessage = `\n[${timestamp}] === BATCH ${batchNumber} STARTED ===\n` +
    `  Councils: ${councils.join(', ')}`;

  appendToTextLog(textMessage);
}

/**
 * Log batch complete
 */
export function logBatchComplete(batchNumber: number, successCount: number, errorCount: number): void {
  const timestamp = formatTimestamp();
  const textMessage = `[${timestamp}] === BATCH ${batchNumber} COMPLETE ===\n` +
    `  Success: ${successCount}, Errors: ${errorCount}`;

  appendToTextLog(textMessage);
}

/**
 * Generate weekly summary from logs
 */
export function generateWeeklySummary(): WeeklySummary {
  const entries = loadJsonLog();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter entries from the past week
  const weekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= weekAgo && entryDate <= now;
  });

  const councilsChecked = new Set<string>();
  const councilsWithChanges = new Set<string>();
  const councilsWithErrors = new Set<string>();
  const suspiciousChanges = new Set<string>();

  const changesByCounty: WeeklySummary['changesByCounty'] = [];
  const errors: WeeklySummary['errors'] = [];

  for (const entry of weekEntries) {
    councilsChecked.add(entry.county);

    if (entry.status === 'success' || entry.status === 'suspicious') {
      councilsWithChanges.add(entry.county);
      changesByCounty.push({
        county: entry.county,
        added: entry.details?.added || [],
        removed: entry.details?.removed || [],
        date: entry.timestamp,
      });
    }

    if (entry.status === 'suspicious') {
      suspiciousChanges.add(entry.county);
    }

    if (entry.status === 'error') {
      councilsWithErrors.add(entry.county);
      errors.push({
        county: entry.county,
        error: entry.details?.error || entry.message,
        date: entry.timestamp,
      });
    }
  }

  return {
    weekStarting: weekAgo.toISOString().split('T')[0],
    weekEnding: now.toISOString().split('T')[0],
    totalCouncilsChecked: councilsChecked.size,
    councilsWithChanges: councilsWithChanges.size,
    councilsWithErrors: councilsWithErrors.size,
    suspiciousChanges: suspiciousChanges.size,
    changesByCounty,
    errors,
  };
}

/**
 * Clear old log entries (keep last 30 days)
 */
export function cleanOldLogs(): void {
  const entries = loadJsonLog();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const recentEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= thirtyDaysAgo;
  });

  saveJsonLog(recentEntries);
}
