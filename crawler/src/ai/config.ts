/**
 * AI Configuration
 *
 * Centralized configuration for AI models, costs, and limits.
 * See docs/AI-FEATURES-TECHNICAL-SPEC.md for full specification.
 */

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

export const AI_MODELS = {
  // Primary model for all AI features
  HAIKU: 'anthropic/claude-3-5-haiku-20241022',

  // Fallback/upgrade option (not used by default due to cost)
  SONNET: 'anthropic/claude-3-5-sonnet-20241022',
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

// ============================================================================
// COST CONFIGURATION
// ============================================================================

// Costs per 1 million tokens (in USD)
export const MODEL_COSTS = {
  'anthropic/claude-3-5-haiku-20241022': {
    input: 0.80,   // $0.80 per 1M input tokens
    output: 4.00,  // $4.00 per 1M output tokens
  },
  'anthropic/claude-3-5-sonnet-20241022': {
    input: 3.00,   // $3.00 per 1M input tokens
    output: 15.00, // $15.00 per 1M output tokens
  },
} as const;

/**
 * Calculate cost for a given model and token usage
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
  if (!costs) {
    console.warn(`Unknown model for cost calculation: ${model}, using Haiku costs`);
    return calculateCost(AI_MODELS.HAIKU, inputTokens, outputTokens);
  }

  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;

  return Number((inputCost + outputCost).toFixed(6));
}

// ============================================================================
// BUDGET CONFIGURATION
// ============================================================================

export const BUDGET_CONFIG = {
  // Daily budget limit in USD
  DAILY_LIMIT_USD: Number(process.env.AI_DAILY_BUDGET_USD) || 50.00,

  // Monthly budget limit in USD
  MONTHLY_LIMIT_USD: Number(process.env.AI_MONTHLY_BUDGET_USD) || 500.00,

  // Alert threshold (percentage of daily budget)
  ALERT_THRESHOLD: 0.80, // Alert at 80% of daily budget

  // Hard stop threshold
  HARD_STOP_THRESHOLD: 1.00, // Stop at 100% of daily budget
} as const;

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export const AGENT_CONFIG = {
  // Promise Extractor Agent
  PROMISE_EXTRACTOR: {
    id: 'promise-extractor',
    name: 'Promise Extractor',
    model: AI_MODELS.HAIKU,
    maxTokensPerRequest: 4096, // Max output tokens
  },

  // Evidence Finder Agent
  EVIDENCE_FINDER: {
    id: 'evidence-finder',
    name: 'Evidence Finder',
    model: AI_MODELS.HAIKU,
    maxTokensPerRequest: 2048,
  },

  // Chatbot Agent
  CHATBOT: {
    id: 'chatbot',
    name: 'Fiacha Assistant',
    model: AI_MODELS.HAIKU,
    maxTokensPerRequest: 1024,
    maxMessagesPerDay: 50, // Rate limit for chatbot
  },

  // Summarizer Agent
  SUMMARIZER: {
    id: 'summarizer',
    name: 'Content Summarizer',
    model: AI_MODELS.HAIKU,
    maxTokensPerRequest: 2048,
  },

  // Debate Analyzer Agent
  DEBATE_ANALYZER: {
    id: 'debate-analyzer',
    name: 'Debate Analyzer',
    model: AI_MODELS.HAIKU,
    maxTokensPerRequest: 4096,
  },

  // Source Classifier Agent
  SOURCE_CLASSIFIER: {
    id: 'source-classifier',
    name: 'Source Classifier',
    model: AI_MODELS.HAIKU,
    maxTokensPerRequest: 512,
  },
} as const;

// ============================================================================
// CANONICAL CATEGORIES
// ============================================================================

/**
 * Canonical promise categories aligned with the app's UI
 * These MUST be used exactly as written in AI prompts
 */
export const PROMISE_CATEGORIES = [
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
  'Trade',
  'Agriculture',
  'Foreign Affairs',
  'Other',
] as const;

export type PromiseCategory = (typeof PROMISE_CATEGORIES)[number];

// ============================================================================
// EMBEDDING CONFIGURATION
// ============================================================================

export const EMBEDDING_CONFIG = {
  // Model for generating embeddings
  MODEL: 'all-MiniLM-L6-v2',

  // Embedding dimension (must match database schema)
  DIMENSION: 384,

  // Similarity threshold for duplicate detection
  DUPLICATE_THRESHOLD: 0.85, // 85% similarity = likely duplicate

  // Low similarity threshold for flagging
  LOW_SIMILARITY_THRESHOLD: 0.50,
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  // Enable AI-powered promise extraction
  AI_EXTRACTION: process.env.ENABLE_AI_EXTRACTION === 'true',

  // Enable AI chatbot
  AI_CHATBOT: process.env.ENABLE_AI_CHATBOT === 'true',

  // Enable AI evidence finder
  AI_EVIDENCE_FINDER: process.env.ENABLE_AI_EVIDENCE_FINDER === 'true',

  // Enable AI summarization
  AI_SUMMARIZATION: process.env.ENABLE_AI_SUMMARIZATION === 'true',
} as const;
