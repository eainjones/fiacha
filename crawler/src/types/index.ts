import { z } from 'zod';

// Import shared types from main app's generated database types
// Run `npm run types:update` in root to regenerate
import type { Database } from '../../../lib/database.types';

// Re-export database row types for convenience
export type DbPolitician = Database['public']['Tables']['politicians']['Row'];
export type DbPromise = Database['public']['Tables']['promises']['Row'];
export type DbEvidence = Database['public']['Tables']['evidence']['Row'];

/**
 * Promise categories matching the main Fiacha database
 */
export const PromiseCategory = z.enum([
  'Housing',
  'Health',
  'Childcare',
  'Education',
  'Transport',
  'Climate',
  'Employment',
  'Taxation',
  'Social Welfare',
  'Law & Order',
  'Infrastructure',
  'Other'
]);

export type PromiseCategoryType = z.infer<typeof PromiseCategory>;

/**
 * Source tiers based on RESEARCHER-GUIDE.md
 */
export const SourceTier = z.enum(['tier1', 'tier2', 'tier3']);
export type SourceTierType = z.infer<typeof SourceTier>;

export const SourceType = z.enum(['media', 'parliamentary', 'manifesto', 'press_release']);
export type SourceTypeType = z.infer<typeof SourceType>;

/**
 * Crawl source configuration
 */
export const CrawlSource = z.object({
  url: z.string().url(),
  name: z.string(),
  tier: SourceTier,
  sourceType: SourceType,
  enabled: z.boolean().default(true),
  priority: z.number().default(1),
  lastCrawled: z.date().optional(),
  // Deep crawl settings (optional)
  deepCrawl: z.boolean().default(false),
  maxPages: z.number().default(5),
  includePaths: z.array(z.string()).optional(),
  excludePaths: z.array(z.string()).optional(),
});

export type CrawlSourceType = z.infer<typeof CrawlSource>;

/**
 * Extracted promise from LLM (before validation)
 */
export const ExtractedPromise = z.object({
  politician_name: z.string().min(1), // Allow "Government" or single-letter names
  party: z.string().optional(),
  promise_title: z.string().min(5).max(200), // Reduced from 10 to 5
  description: z.string().min(10), // Reduced from 20 to 10
  category: PromiseCategory,
  promise_date: z.string().or(z.date()),
  target_date: z.string().or(z.date()).nullable(),
  quote: z.string().optional(),
  confidence: z.number().min(0).max(100),
  source_url: z.string().url(),
  source_type: SourceType,
});

export type ExtractedPromiseType = z.infer<typeof ExtractedPromise>;

/**
 * Politician match result from fuzzy matching
 */
export interface PoliticianMatch {
  id: number;
  name: string;
  party: string;
  constituency: string | null;
  matchScore: number;
  isExactMatch: boolean;
}

/**
 * Promise in review queue
 */
export interface PromiseReview {
  id: number;
  extracted_promise: ExtractedPromiseType;
  politician_match: PoliticianMatch | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  reviewed_at: Date | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

/**
 * LLM Provider configuration
 */
export type LLMProvider = 'claude' | 'openai';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

/**
 * Crawl result from Firecrawl
 */
export interface CrawlResult {
  url: string;
  markdown: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    publishedDate?: string;
  };
}

// DbPolitician is now imported from shared database types above

/**
 * Promise to insert into database
 */
export interface DbPromiseInsert {
  politician_id: number;
  title: string;
  description: string;
  category: PromiseCategoryType;
  promise_date: Date;
  target_date: Date | null;
  status: 'pending';
  score: number;
}

/**
 * Evidence to insert into database
 */
export interface DbEvidenceInsert {
  promise_id: number;
  source_type: SourceTypeType;
  source_url: string;
  title: string;
  description: string;
  published_date: Date | null;
}
