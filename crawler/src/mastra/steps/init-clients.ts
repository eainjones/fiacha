/**
 * Init Clients Step
 *
 * Creates DB client, loads politicians, creates matcher, checks budget.
 * Outputs shared context for downstream steps.
 */

import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { createDatabaseClient, DatabaseClient } from '../../database/client.js';
import { PoliticianMatcher } from '../../validators/politician-matcher.js';
import { createExtractor, MastraPromiseExtractor } from '../../extractors/index.js';
import { createFirecrawlClient } from '../../crawlers/firecrawl-client.js';
import { initBudgetDb, checkBudget } from '../../ai/index.js';
import type { IPromiseExtractor } from '../../extractors/llm-interface.js';
import type { DbPolitician } from '../../types/index.js';

/**
 * Shared client context passed between workflow steps via closure.
 * We use a module-level store because Mastra steps communicate via
 * serializable input/output schemas, not object references.
 */
export interface CrawlerClients {
  db: DatabaseClient;
  matcher: PoliticianMatcher;
  extractor: IPromiseExtractor;
  firecrawl: ReturnType<typeof createFirecrawlClient>;
  politicians: DbPolitician[];
}

let _clients: CrawlerClients | null = null;

export function getClients(): CrawlerClients {
  if (!_clients) {
    throw new Error('Clients not initialized. Run initClientsStep first.');
  }
  return _clients;
}

export async function clearClients(): Promise<void> {
  if (_clients) {
    await _clients.db.close();
  }
  _clients = null;
}

export const initClientsStep = createStep({
  id: 'init-clients',
  description: 'Initialize database, matcher, extractor, and firecrawl clients',
  inputSchema: z.object({
    mode: z.string(),
  }),
  outputSchema: z.object({
    politicianCount: z.number(),
    budgetCanProceed: z.boolean(),
    budgetRemaining: z.number(),
  }),
  execute: async ({ inputData }) => {
    console.log(`[init-clients] Initializing for mode: ${inputData.mode}`);

    const db = createDatabaseClient();
    const firecrawl = createFirecrawlClient();
    const extractor = createExtractor();

    // Initialize budget tracking if using Mastra extractor
    if (extractor instanceof MastraPromiseExtractor) {
      const pool = db.getPool();
      if (pool) {
        initBudgetDb(pool);
        extractor.setDatabasePool(pool);
      }
    }

    // Verify DB connection
    const dbHealthy = await db.healthCheck();
    if (!dbHealthy) {
      throw new Error('Database health check failed');
    }

    // Load politicians for matching
    const politicians = await db.getAllPoliticians();
    const matcher = new PoliticianMatcher(politicians);
    console.log(`[init-clients] Loaded ${politicians.length} politicians`);

    // Check budget
    const budgetStatus = await checkBudget();

    // Store clients for downstream steps
    _clients = { db, matcher, extractor, firecrawl, politicians };

    return {
      politicianCount: politicians.length,
      budgetCanProceed: budgetStatus.canProceed,
      budgetRemaining: budgetStatus.remainingUsd,
    };
  },
});
