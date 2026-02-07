import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CouncillorMetadata {
  lastUpdated: string;
  lastChecked: string;
  contentHash: string;
  councillorCount: number;
  changeHistory: ChangeHistoryEntry[];
}

export interface ChangeHistoryEntry {
  date: string;
  added: string[];
  removed: string[];
  unchangedCount: number;
}

export interface ChangeResult {
  hasChanges: boolean;
  added: string[];
  removed: string[];
  unchanged: string[];
  previousHash: string | null;
  newHash: string;
  isSuspicious: boolean;
  suspiciousReason?: string;
}

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');

/**
 * Normalize councillor names for consistent comparison
 */
function normalizeNames(councillors: string[]): string[] {
  return councillors
    .map(name => name.trim().toLowerCase())
    .filter(name => name.length > 0)
    .sort();
}

/**
 * Compute SHA-256 hash of councillor list
 */
export function computeCouncillorHash(councillors: string[]): string {
  const normalized = normalizeNames(councillors);
  const content = normalized.join('\n');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get path to metadata file for a county
 */
function getMetadataPath(county: string): string {
  return path.join(DATA_DIR, county, 'structured', 'councillors_metadata.json');
}

/**
 * Load metadata for a county
 */
export function loadMetadata(county: string): CouncillorMetadata | null {
  const metadataPath = getMetadataPath(county);

  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(content) as CouncillorMetadata;
  } catch (error) {
    console.error(`Error loading metadata for ${county}:`, error);
    return null;
  }
}

/**
 * Save metadata for a county
 */
export function saveMetadata(county: string, metadata: CouncillorMetadata): void {
  const metadataPath = getMetadataPath(county);
  const dir = path.dirname(metadataPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Load current councillors from CSV
 */
export function loadCurrentCouncillors(county: string): string[] {
  const csvPath = path.join(DATA_DIR, county, 'structured', 'councillors_canonical.csv');

  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');

  // Skip header
  return lines.slice(1).map(line => line.trim()).filter(line => line.length > 0);
}

/**
 * Detect changes between current and new councillor lists
 */
export function detectChanges(
  county: string,
  newCouncillors: string[],
  suspiciousThreshold: number = 0.5
): ChangeResult {
  const metadata = loadMetadata(county);
  const currentCouncillors = loadCurrentCouncillors(county);

  const newHash = computeCouncillorHash(newCouncillors);
  const previousHash = metadata?.contentHash || null;

  // If hashes match, no changes
  if (previousHash && previousHash === newHash) {
    return {
      hasChanges: false,
      added: [],
      removed: [],
      unchanged: newCouncillors,
      previousHash,
      newHash,
      isSuspicious: false,
    };
  }

  // Calculate differences
  const currentSet = new Set(normalizeNames(currentCouncillors));
  const newSet = new Set(normalizeNames(newCouncillors));

  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  // Find added councillors
  for (const councillor of newCouncillors) {
    const normalized = councillor.trim().toLowerCase();
    if (!currentSet.has(normalized)) {
      added.push(councillor);
    } else {
      unchanged.push(councillor);
    }
  }

  // Find removed councillors
  for (const councillor of currentCouncillors) {
    const normalized = councillor.trim().toLowerCase();
    if (!newSet.has(normalized)) {
      removed.push(councillor);
    }
  }

  // Check if changes are suspicious (>50% change)
  const totalPrevious = currentCouncillors.length || 1;
  const changeRatio = (added.length + removed.length) / totalPrevious;
  const isSuspicious = changeRatio > suspiciousThreshold && currentCouncillors.length > 0;

  let suspiciousReason: string | undefined;
  if (isSuspicious) {
    suspiciousReason = `${Math.round(changeRatio * 100)}% of councillors changed (${added.length} added, ${removed.length} removed out of ${totalPrevious})`;
  }

  return {
    hasChanges: added.length > 0 || removed.length > 0,
    added,
    removed,
    unchanged,
    previousHash,
    newHash,
    isSuspicious,
    suspiciousReason,
  };
}

/**
 * Update metadata after a successful crawl
 */
export function updateMetadataAfterCrawl(
  county: string,
  changeResult: ChangeResult,
  councillorCount: number
): void {
  const existingMetadata = loadMetadata(county);
  const now = new Date().toISOString();

  const changeHistory: ChangeHistoryEntry[] = existingMetadata?.changeHistory || [];

  // Add new change entry if there were changes
  if (changeResult.hasChanges) {
    changeHistory.push({
      date: now,
      added: changeResult.added,
      removed: changeResult.removed,
      unchangedCount: changeResult.unchanged.length,
    });

    // Keep only last 50 changes
    if (changeHistory.length > 50) {
      changeHistory.splice(0, changeHistory.length - 50);
    }
  }

  const metadata: CouncillorMetadata = {
    lastUpdated: changeResult.hasChanges ? now : (existingMetadata?.lastUpdated || now),
    lastChecked: now,
    contentHash: changeResult.newHash,
    councillorCount,
    changeHistory,
  };

  saveMetadata(county, metadata);
}
