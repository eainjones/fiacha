/**
 * AI Module Index
 *
 * Exports all AI-related functionality for the crawler.
 */

// Configuration
export * from './config.js';

// Mastra client
export { mastra, isAIConfigured, getAnthropicApiKey } from './mastra-client.js';

// Schemas
export * from './schemas/promise.js';

// Tools
export {
  initBudgetDb,
  checkBudget,
  canAfford,
  logUsage,
  getTodaySummary,
  withBudgetGuard,
  type BudgetStatus,
} from './tools/budget-checker.js';

// Agents
export { extractPromises, extractPromisesBatch } from './agents/promise-extractor.js';
