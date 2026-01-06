#!/usr/bin/env npx tsx
/**
 * Council Status Utility
 *
 * Check the current status of councillor data for all councils.
 * Shows last updated, last checked, councillor count, and change history.
 *
 * Usage:
 *   npx tsx council-status.ts              # Show status for all councils
 *   npx tsx council-status.ts dublin       # Show status for specific council
 *   npx tsx council-status.ts --stale      # Show only councils with stale data
 *   npx tsx council-status.ts --changes    # Show only councils with recent changes
 */

import * as fs from 'fs';
import * as path from 'path';

import { getAllCounties } from './src/crawlers/council-urls';
import { loadMetadata, loadCurrentCouncillors, CouncillorMetadata } from './src/crawlers/change-detector';
import { loadConfig, getNextScheduledTime } from './src/crawlers/council-batch-scheduler';

interface CouncilStatus {
  county: string;
  hasData: boolean;
  councillorCount: number;
  lastUpdated: Date | null;
  lastChecked: Date | null;
  daysSinceUpdate: number | null;
  daysSinceCheck: number | null;
  recentChanges: number;
}

/**
 * Format date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return 'Never';
  return date.toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format days ago
 */
function formatDaysAgo(days: number | null): string {
  if (days === null) return '-';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/**
 * Get status for a single council
 */
function getCouncilStatus(county: string): CouncilStatus {
  const metadata = loadMetadata(county);
  const councillors = loadCurrentCouncillors(county);

  const now = new Date();
  const lastUpdated = metadata?.lastUpdated ? new Date(metadata.lastUpdated) : null;
  const lastChecked = metadata?.lastChecked ? new Date(metadata.lastChecked) : null;

  const daysSinceUpdate = lastUpdated
    ? Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const daysSinceCheck = lastChecked
    ? Math.floor((now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Count changes in last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentChanges = (metadata?.changeHistory || []).filter(
    (change) => new Date(change.date) >= thirtyDaysAgo
  ).length;

  return {
    county,
    hasData: councillors.length > 0,
    councillorCount: councillors.length,
    lastUpdated,
    lastChecked,
    daysSinceUpdate,
    daysSinceCheck,
    recentChanges,
  };
}

/**
 * Display status table
 */
function displayStatusTable(statuses: CouncilStatus[]): void {
  console.log('\n=== Council Data Status ===\n');

  // Header
  console.log(
    'County'.padEnd(25) +
    'Count'.padEnd(8) +
    'Last Updated'.padEnd(22) +
    'Last Checked'.padEnd(22) +
    'Changes (30d)'.padEnd(12)
  );
  console.log('-'.repeat(89));

  for (const status of statuses) {
    const countStr = status.hasData ? status.councillorCount.toString() : '-';
    const updatedStr = status.lastUpdated
      ? formatDaysAgo(status.daysSinceUpdate)
      : 'No data';
    const checkedStr = status.lastChecked
      ? formatDaysAgo(status.daysSinceCheck)
      : 'Never';
    const changesStr = status.recentChanges > 0 ? status.recentChanges.toString() : '-';

    console.log(
      status.county.padEnd(25) +
      countStr.padEnd(8) +
      updatedStr.padEnd(22) +
      checkedStr.padEnd(22) +
      changesStr.padEnd(12)
    );
  }
}

/**
 * Display detailed status for a single council
 */
function displayDetailedStatus(status: CouncilStatus): void {
  console.log(`\n=== ${status.county.toUpperCase()} ===\n`);

  console.log(`Councillor Count: ${status.councillorCount || 'No data'}`);
  console.log(`Last Updated: ${formatDate(status.lastUpdated)}`);
  console.log(`Last Checked: ${formatDate(status.lastChecked)}`);
  console.log(`Days Since Update: ${status.daysSinceUpdate ?? 'N/A'}`);
  console.log(`Days Since Check: ${status.daysSinceCheck ?? 'N/A'}`);
  console.log(`Recent Changes (30d): ${status.recentChanges}`);

  // Show change history
  const metadata = loadMetadata(status.county);
  if (metadata?.changeHistory && metadata.changeHistory.length > 0) {
    console.log('\n--- Change History (Last 5) ---');
    const recentHistory = metadata.changeHistory.slice(-5).reverse();
    for (const change of recentHistory) {
      console.log(`\n${new Date(change.date).toLocaleDateString('en-IE')}`);
      if (change.added.length > 0) {
        console.log(`  + Added: ${change.added.join(', ')}`);
      }
      if (change.removed.length > 0) {
        console.log(`  - Removed: ${change.removed.join(', ')}`);
      }
    }
  }

  // Show current councillors
  if (status.councillorCount > 0) {
    console.log('\n--- Current Councillors ---');
    const councillors = loadCurrentCouncillors(status.county);
    for (const name of councillors) {
      console.log(`  • ${name}`);
    }
  }
}

/**
 * Display summary statistics
 */
function displaySummary(statuses: CouncilStatus[]): void {
  const totalCouncils = statuses.length;
  const withData = statuses.filter((s) => s.hasData).length;
  const totalCouncillors = statuses.reduce((sum, s) => sum + s.councillorCount, 0);
  const stale = statuses.filter((s) => (s.daysSinceCheck ?? 999) > 7).length;
  const neverChecked = statuses.filter((s) => s.daysSinceCheck === null).length;
  const withChanges = statuses.filter((s) => s.recentChanges > 0).length;

  console.log('\n=== Summary ===');
  console.log(`Total Councils: ${totalCouncils}`);
  console.log(`With Data: ${withData} (${Math.round((withData / totalCouncils) * 100)}%)`);
  console.log(`Total Councillors: ${totalCouncillors}`);
  console.log(`Stale (>7 days): ${stale}`);
  console.log(`Never Checked: ${neverChecked}`);
  console.log(`With Recent Changes: ${withChanges}`);

  // Next scheduled run
  const nextRun = getNextScheduledTime();
  if (nextRun) {
    console.log(`\nNext Scheduled Crawl: ${formatDate(nextRun)}`);
  }
}

/**
 * Main entry point
 */
function main(): void {
  const args = process.argv.slice(2);

  // Parse flags
  const showStale = args.includes('--stale');
  const showChanges = args.includes('--changes');
  const specificCounty = args.find((arg) => !arg.startsWith('--'));

  // Get all council statuses
  const counties = getAllCounties();
  let statuses = counties.map(getCouncilStatus);

  // Filter if requested
  if (showStale) {
    statuses = statuses.filter((s) => (s.daysSinceCheck ?? 999) > 7);
    console.log('Showing councils with stale data (>7 days since check)');
  }

  if (showChanges) {
    statuses = statuses.filter((s) => s.recentChanges > 0);
    console.log('Showing councils with recent changes');
  }

  // If specific county requested, show detailed view
  if (specificCounty) {
    const status = statuses.find((s) => s.county === specificCounty);
    if (!status) {
      console.error(`Unknown county: ${specificCounty}`);
      console.log(`Available: ${counties.join(', ')}`);
      process.exit(1);
    }
    displayDetailedStatus(status);
    return;
  }

  // Show table view
  displayStatusTable(statuses);
  displaySummary(statuses);
}

main();
