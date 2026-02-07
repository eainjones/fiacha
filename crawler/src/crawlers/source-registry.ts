import { CrawlSource, CrawlSourceType } from '../types/index.js';

/**
 * Registry of sources to crawl for political promises
 * Based on RESEARCHER-GUIDE.md tiers
 *
 * Source types:
 *  - 'firecrawl': Scrape via Firecrawl (default)
 *  - 'rss': Fetch RSS feed, then scrape individual articles via Firecrawl
 *  - 'oireachtas-api': Fetch via Oireachtas Open Data API
 */

// ============================================================================
// TIER 1: Most Reliable — Official Government & Parliamentary Sources
// ============================================================================

const TIER1_SOURCES: CrawlSourceType[] = [
  // --- Oireachtas (fetched via API, not Firecrawl) ---
  {
    url: 'https://api.oireachtas.ie/v1/questions',
    name: 'Oireachtas Parliamentary Questions',
    tier: 'tier1',
    sourceType: 'parliamentary',
    enabled: true,
    priority: 10,
    deepCrawl: false,
    maxPages: 20,
  },
  {
    url: 'https://www.oireachtas.ie/en/debates/debate/dail/',
    name: 'Dáil Debates',
    tier: 'tier1',
    sourceType: 'parliamentary',
    enabled: true,
    priority: 9,
    deepCrawl: true,
    maxPages: 5,
    includePaths: ['/en/debates/debate/dail/2026-', '/en/debates/debate/dail/2025-'],
    excludePaths: ['/pdf/', '/xml/', '/members/'],
  },
  {
    url: 'https://www.oireachtas.ie/en/debates/debate/seanad/',
    name: 'Seanad Debates',
    tier: 'tier1',
    sourceType: 'parliamentary',
    enabled: true,
    priority: 8,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/en/debates/debate/seanad/2026-', '/en/debates/debate/seanad/2025-'],
    excludePaths: ['/pdf/', '/xml/', '/members/'],
  },

  // --- Government Press Releases ---
  {
    url: 'https://www.gov.ie/en/press-releases/',
    name: 'Government Press Releases',
    tier: 'tier1',
    sourceType: 'press_release',
    enabled: true,
    priority: 9,
    deepCrawl: true,
    maxPages: 10,
    includePaths: ['/en/press-release/'],
    excludePaths: ['/pdf/', '/search/', '/organisation/'],
  },

  // --- Programme for Government ---
  {
    url: 'https://www.gov.ie/en/publication/d4e4f-mission-government-a-new-approach/',
    name: 'Programme for Government 2025',
    tier: 'tier1',
    sourceType: 'manifesto',
    enabled: true,
    priority: 10,
    deepCrawl: false,
    maxPages: 1,
  },

  // --- Key Policy Pages ---
  {
    url: 'https://www.gov.ie/en/campaigns/dfc50-housing-for-all/',
    name: 'Housing for All - Action Plan',
    tier: 'tier1',
    sourceType: 'press_release',
    enabled: true,
    priority: 8,
    deepCrawl: true,
    maxPages: 5,
    includePaths: ['/en/publication/', '/en/press-release/'],
    excludePaths: ['/pdf/'],
  },
  {
    url: 'https://www.gov.ie/en/publication/055810-budget-2026/',
    name: 'Budget 2026',
    tier: 'tier1',
    sourceType: 'press_release',
    enabled: true,
    priority: 9,
    deepCrawl: true,
    maxPages: 5,
    includePaths: ['/en/publication/', '/en/press-release/'],
    excludePaths: ['/pdf/'],
  },

  // --- Northern Ireland Assembly ---
  {
    url: 'http://aims.niassembly.gov.uk/plenary/plenary.aspx',
    name: 'NI Assembly Plenary Sessions',
    tier: 'tier1',
    sourceType: 'parliamentary',
    enabled: true,
    priority: 7,
    deepCrawl: false,
    maxPages: 5,
  },
  {
    url: 'https://www.northernireland.gov.uk/news',
    name: 'NI Executive Press Releases',
    tier: 'tier1',
    sourceType: 'press_release',
    enabled: true,
    priority: 7,
    deepCrawl: true,
    maxPages: 5,
    includePaths: ['/news/'],
    excludePaths: ['/pdf/'],
  },
];

// ============================================================================
// TIER 2: Reliable News — RSS Feeds for Irish Political News
// ============================================================================

const TIER2_SOURCES: CrawlSourceType[] = [
  // --- RTÉ News (RSS feeds) ---
  {
    url: 'https://www.rte.ie/feeds/rss/?index=/news/politics/&limit=15',
    name: 'RTÉ News - Politics',
    tier: 'tier2',
    sourceType: 'media',
    enabled: true,
    priority: 8,
    deepCrawl: false,
    maxPages: 15,
  },
  {
    url: 'https://www.rte.ie/feeds/rss/?index=/news/ireland/&limit=10',
    name: 'RTÉ News - Ireland',
    tier: 'tier2',
    sourceType: 'media',
    enabled: true,
    priority: 6,
    deepCrawl: false,
    maxPages: 10,
  },

  // --- Irish Times Politics ---
  {
    url: 'https://www.irishtimes.com/politics/',
    name: 'Irish Times - Politics',
    tier: 'tier2',
    sourceType: 'media',
    enabled: true,
    priority: 7,
    deepCrawl: true,
    maxPages: 5,
    includePaths: ['/politics/'],
    excludePaths: ['/subscriber-only/', '/crosswords/'],
  },

  // --- The Journal.ie ---
  {
    url: 'https://www.thejournal.ie/politics/',
    name: 'The Journal - Politics',
    tier: 'tier2',
    sourceType: 'media',
    enabled: true,
    priority: 6,
    deepCrawl: true,
    maxPages: 5,
    includePaths: ['/politics/'],
    excludePaths: [],
  },

  // --- Irish Examiner ---
  {
    url: 'https://www.irishexaminer.com/news/politics/',
    name: 'Irish Examiner - Politics',
    tier: 'tier2',
    sourceType: 'media',
    enabled: true,
    priority: 6,
    deepCrawl: true,
    maxPages: 5,
    includePaths: ['/news/politics/'],
    excludePaths: [],
  },

  // --- Northern Ireland News ---
  {
    url: 'https://www.bbc.co.uk/news/northern_ireland',
    name: 'BBC News Northern Ireland',
    tier: 'tier2',
    sourceType: 'media',
    enabled: true,
    priority: 6,
    deepCrawl: false,
    maxPages: 5,
  },
  {
    url: 'https://www.belfasttelegraph.co.uk/news/politics/',
    name: 'Belfast Telegraph - Politics',
    tier: 'tier2',
    sourceType: 'media',
    enabled: true,
    priority: 5,
    deepCrawl: false,
    maxPages: 5,
  },
];

// ============================================================================
// TIER 3: Party Sources & Local Government
// ============================================================================

const TIER3_SOURCES: CrawlSourceType[] = [
  // --- Political Party Pages ---
  {
    url: 'https://www.finegael.ie/news/',
    name: 'Fine Gael - News',
    tier: 'tier3',
    sourceType: 'press_release',
    enabled: true,
    priority: 4,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/news/'],
    excludePaths: [],
  },
  {
    url: 'https://www.fiannafail.ie/news/',
    name: 'Fianna Fáil - News',
    tier: 'tier3',
    sourceType: 'press_release',
    enabled: true,
    priority: 4,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/news/'],
    excludePaths: [],
  },
  {
    url: 'https://www.sinnfein.ie/news',
    name: 'Sinn Féin - News',
    tier: 'tier3',
    sourceType: 'press_release',
    enabled: true,
    priority: 4,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/news'],
    excludePaths: [],
  },
  {
    url: 'https://www.labour.ie/news/',
    name: 'Labour Party - News',
    tier: 'tier3',
    sourceType: 'press_release',
    enabled: true,
    priority: 3,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/news/'],
    excludePaths: [],
  },
  {
    url: 'https://www.greenparty.ie/news/',
    name: 'Green Party - News',
    tier: 'tier3',
    sourceType: 'press_release',
    enabled: true,
    priority: 3,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/news/'],
    excludePaths: [],
  },
  {
    url: 'https://www.socialdemocrats.ie/news/',
    name: 'Social Democrats - News',
    tier: 'tier3',
    sourceType: 'press_release',
    enabled: true,
    priority: 3,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/news/'],
    excludePaths: [],
  },
  {
    url: 'https://www.pbp.ie/news/',
    name: 'People Before Profit - News',
    tier: 'tier3',
    sourceType: 'press_release',
    enabled: true,
    priority: 2,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/news/'],
    excludePaths: [],
  },
  {
    url: 'https://aontu.ie/news/',
    name: 'Aontú - News',
    tier: 'tier3',
    sourceType: 'press_release',
    enabled: true,
    priority: 2,
    deepCrawl: true,
    maxPages: 3,
    includePaths: ['/news/'],
    excludePaths: [],
  },
];

// ============================================================================
// Registry Functions
// ============================================================================

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
 * Get only RSS-based sources (RTÉ feeds)
 */
export function getRSSSources(): CrawlSourceType[] {
  return getEnabledSources().filter(s =>
    s.url.includes('/feeds/rss/') || s.url.includes('/rss/')
  );
}

/**
 * Get only Oireachtas API sources
 */
export function getOireachtasSources(): CrawlSourceType[] {
  return getEnabledSources().filter(s =>
    s.url.includes('api.oireachtas.ie') || s.url.includes('oireachtas.ie/en/debates/')
  );
}

/**
 * Get web-crawlable sources (everything except RSS and Oireachtas API)
 */
export function getWebSources(): CrawlSourceType[] {
  return getEnabledSources().filter(s =>
    !s.url.includes('/feeds/rss/') &&
    !s.url.includes('/rss/') &&
    !s.url.includes('api.oireachtas.ie')
  );
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
