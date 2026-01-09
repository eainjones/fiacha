/**
 * AI Module Index
 *
 * Exports all AI-related functionality for the crawler.
 */

// Configuration
export * from './config';

// Mastra client
export { mastra, isAIConfigured, getAnthropicApiKey } from './mastra-client';

// Schemas
export * from './schemas/promise';

// Tools
export {
  initBudgetDb,
  checkBudget,
  canAfford,
  logUsage,
  getTodaySummary,
  withBudgetGuard,
  type BudgetStatus,
} from './tools/budget-checker';

// Agents
export { extractPromises, extractPromisesBatch } from './agents/promise-extractor';
