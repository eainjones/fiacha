/**
 * RSS Feed Parser for Irish News Sources
 *
 * Parses RSS feeds to get article URLs and metadata.
 * Much more reliable than scraping listing pages.
 */

import { CrawlResult } from '../types';

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category?: string;
}

export interface RSSFeed {
  title: string;
  link: string;
  items: RSSItem[];
}

/**
 * Known Irish news RSS feeds
 */
export const RSS_FEEDS = {
  RTE_POLITICS: 'https://www.rte.ie/feeds/rss/?index=/news/politics/&limit=10',
  RTE_NEWS: 'https://www.rte.ie/feeds/rss/?index=/news/&limit=20',
  RTE_IRELAND: 'https://www.rte.ie/feeds/rss/?index=/news/ireland/&limit=10',
} as const;

/**
 * Parse RSS XML into structured data
 */
export function parseRSS(xml: string): RSSFeed {
  const items: RSSItem[] = [];

  // Extract channel title
  const titleMatch = xml.match(/<channel>[\s\S]*?<title>([^<]+)<\/title>/);
  const title = titleMatch?.[1] || 'Unknown Feed';

  // Extract channel link
  const linkMatch = xml.match(/<channel>[\s\S]*?<link>([^<]+)<\/link>/);
  const link = linkMatch?.[1] || '';

  // Extract items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const itemTitle = itemXml.match(/<title>([^<]+)<\/title>/)?.[1] || '';
    const itemLink = itemXml.match(/<link>([^<]+)<\/link>/)?.[1] || '';
    const itemDesc = itemXml.match(/<description>([^<]*)<\/description>/)?.[1] || '';
    const itemDate = itemXml.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] || '';
    const itemCategory = itemXml.match(/<category>([^<]+)<\/category>/)?.[1];

    if (itemLink) {
      items.push({
        title: decodeHTMLEntities(itemTitle),
        link: itemLink,
        description: decodeHTMLEntities(itemDesc),
        pubDate: itemDate,
        category: itemCategory,
      });
    }
  }

  return { title, link, items };
}

/**
 * Decode HTML entities in RSS content
 */
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Fetch and parse an RSS feed
 */
export async function fetchRSSFeed(url: string): Promise<RSSFeed> {
  console.log(`[RSS] Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Fiacha-Crawler/1.0 (Political Promise Tracker)',
      'Accept': 'application/rss+xml, application/xml, text/xml',
    },
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const feed = parseRSS(xml);

  console.log(`[RSS] ✓ Parsed ${feed.items.length} items from "${feed.title}"`);

  return feed;
}

/**
 * Convert RSS items to CrawlResult format (with just metadata, no content yet)
 */
export function rssItemToCrawlResult(item: RSSItem): Partial<CrawlResult> {
  return {
    url: item.link,
    metadata: {
      title: item.title,
      description: item.description,
      publishedDate: item.pubDate,
    },
  };
}
