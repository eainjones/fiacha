import { CrawlSource, CrawlSourceType } from '../types';

/**
 * Registry of sources to crawl for political promises
 * Based on RESEARCHER-GUIDE.md tiers
 */

/**
 * Tier 1: Most Reliable Sources
 * - Official party manifestos
 * - Oireachtas debates
 * - Ministerial statements
 * - Government press releases
 */
const TIER1_SOURCES: CrawlSourceType[] = [
  // Real, working URLs from gov.ie homepage
  {
    url: 'https://www.gov.ie/en/department-of-housing-local-government-and-heritage/campaigns/housing-for-all/',
    name: 'Housing for All Campaign',
    tier: 'tier1',
    sourceType: 'press_release',
    enabled: true,
    priority: 10,
    deepCrawl: false,
  },
  {
    url: 'https://www.gov.ie/en/department-of-finance/campaigns/budget/',
    name: 'Budget 2026 Information',
    tier: 'tier1',
    sourceType: 'press_release',
    enabled: true,
    priority: 9,
    deepCrawl: false,
  },
  // Deep crawl sources (disabled for now to save API costs)
  {
    url: 'https://www.oireachtas.ie/en/debates/debate/',
    name: 'Oireachtas Debates - Latest',
    tier: 'tier1',
    sourceType: 'parliamentary',
    enabled: false, // Disabled - enable after testing specific URLs
    priority: 7,
    deepCrawl: true,
    maxPages: 5,
    includePaths: ['/en/debates/debate/dail/2024-', '/en/debates/debate/dail/2023-'],
    excludePaths: ['/pdf/', '/xml/', '/members/'],
  },
  {
    url: 'https://www.gov.ie/en/press-release/',
    name: 'Government Press Releases Archive',
    tier: 'tier1',
    sourceType: 'press_release',
    enabled: false, // Disabled - enable after testing specific URLs
    priority: 6,
    deepCrawl: true,
    maxPages: 10,
    includePaths: ['/en/press-release/'],
    excludePaths: ['/pdf/', '/search/', '/organisation/'],
  },
];

/**
 * Tier 2: Reliable with Citation
 * - RTÉ News reports
 * - The Irish Times
 * - The Irish Independent
 * - The Journal.ie
 * - Local newspapers
 */
const TIER2_SOURCES: CrawlSourceType[] = [
  {
    url: 'https://www.rte.ie/news/politics/',
    name: 'RTÉ News - Politics',
    tier: 'tier2',
    sourceType: 'media',
    enabled: false, // Disabled for initial POC
    priority: 7,
  },
  {
    url: 'https://www.irishtimes.com/politics/',
    name: 'The Irish Times - Politics',
    tier: 'tier2',
    sourceType: 'media',
    enabled: false, // Disabled for initial POC
    priority: 6,
  },
  {
    url: 'https://www.thejournal.ie/section/politics-2/',
    name: 'The Journal.ie - Politics',
    tier: 'tier2',
    sourceType: 'media',
    enabled: false, // Disabled for initial POC
    priority: 5,
  },
];

/**
 * Tier 3: Use with Caution
 * - Social media (only direct quotes from verified accounts)
 * - Campaign materials
 * - Party websites
 */
const TIER3_SOURCES: CrawlSourceType[] = [
  // Disabled for initial implementation
  // Will add county council sites later
];

/**
 * Get all enabled sources sorted by priority
 */
export function getEnabledSources(): CrawlSourceType[] {
  const allSources = [...TIER1_SOURCES, ...TIER2_SOURCES, ...TIER3_SOURCES];
  return allSources
    .filter(source => source.enabled)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get sources by tier
 */
export function getSourcesByTier(tier: 'tier1' | 'tier2' | 'tier3'): CrawlSourceType[] {
  const tierSources = {
    tier1: TIER1_SOURCES,
    tier2: TIER2_SOURCES,
    tier3: TIER3_SOURCES,
  };
  return tierSources[tier].filter(source => source.enabled);
}

/**
 * Validate source configuration
 */
export function validateSource(source: unknown): CrawlSourceType {
  return CrawlSource.parse(source);
}

/**
 * Add custom source (for testing or one-off crawls)
 */
export function createCustomSource(
  url: string,
  name: string,
  tier: 'tier1' | 'tier2' | 'tier3',
  sourceType: 'media' | 'parliamentary' | 'manifesto' | 'press_release'
): CrawlSourceType {
  return validateSource({
    url,
    name,
    tier,
    sourceType,
    enabled: true,
    priority: 1,
  });
}
