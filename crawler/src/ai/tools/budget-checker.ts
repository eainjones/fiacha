/**
 * Budget Checker Tool
 *
 * Manages AI API cost tracking and budget enforcement.
 * Checks remaining budget before API calls and logs usage after.
 */

import { Pool } from 'pg';
import { BUDGET_CONFIG, calculateCost } from '../config';

// Database connection (reuse from main crawler)
let dbPool: Pool | null = null;

/**
 * Initialize database connection for budget tracking
 */
export function initBudgetDb(pool: Pool): void {
  dbPool = pool;
}

/**
 * Budget status returned by checkBudget
 */
export interface BudgetStatus {
  remainingUsd: number;
  isExceeded: boolean;
  totalSpent: number;
  budgetLimit: number;
  canProceed: boolean;
}

/**
 * Check current daily budget status
 * Returns budget info and whether we can proceed with API calls
 */
export async function checkBudget(): Promise<BudgetStatus> {
  if (!dbPool) {
    // No database - allow but warn
    console.warn('[Budget] No database connection - budget not enforced');
    return {
      remainingUsd: BUDGET_CONFIG.DAILY_LIMIT_USD,
      isExceeded: false,
      totalSpent: 0,
      budgetLimit: BUDGET_CONFIG.DAILY_LIMIT_USD,
      canProceed: true,
    };
  }

  try {
    const result = await dbPool.query(`SELECT * FROM check_ai_budget(CURRENT_DATE)`);

    if (result.rows.length === 0) {
      // No budget record yet - full budget available
      return {
        remainingUsd: BUDGET_CONFIG.DAILY_LIMIT_USD,
        isExceeded: false,
        totalSpent: 0,
        budgetLimit: BUDGET_CONFIG.DAILY_LIMIT_USD,
        canProceed: true,
      };
    }

    const row = result.rows[0];
    const status: BudgetStatus = {
      remainingUsd: Number(row.remaining_usd),
      isExceeded: row.is_exceeded,
      totalSpent: Number(row.total_spent),
      budgetLimit: Number(row.budget_limit),
      canProceed: !row.is_exceeded,
    };

    // Check alert threshold
    const usagePercent = status.totalSpent / status.budgetLimit;
    if (usagePercent >= BUDGET_CONFIG.ALERT_THRESHOLD && usagePercent < BUDGET_CONFIG.HARD_STOP_THRESHOLD) {
      console.warn(
        `[Budget] WARNING: ${(usagePercent * 100).toFixed(1)}% of daily budget used ($${status.totalSpent.toFixed(2)}/$${status.budgetLimit.toFixed(2)})`
      );
    }

    return status;
  } catch (error) {
    console.error('[Budget] Error checking budget:', error);
    // On error, be conservative and allow (but log)
    return {
      remainingUsd: BUDGET_CONFIG.DAILY_LIMIT_USD,
      isExceeded: false,
      totalSpent: 0,
      budgetLimit: BUDGET_CONFIG.DAILY_LIMIT_USD,
      canProceed: true,
    };
  }
}

/**
 * Estimated cost check before making an API call
 * Returns whether the estimated cost would exceed the remaining budget
 */
export async function canAfford(
  model: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): Promise<{ canAfford: boolean; estimatedCost: number; remaining: number }> {
  const estimatedCost = calculateCost(model, estimatedInputTokens, estimatedOutputTokens);
  const status = await checkBudget();

  return {
    canAfford: status.remainingUsd >= estimatedCost,
    estimatedCost,
    remaining: status.remainingUsd,
  };
}

/**
 * Log AI usage after an API call
 * Updates both usage log and daily budget
 */
export async function logUsage(params: {
  agentName: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  metadata?: Record<string, unknown>;
}): Promise<number | null> {
  const { agentName, model, inputTokens, outputTokens, metadata } = params;
  const costUsd = calculateCost(model, inputTokens, outputTokens);

  console.log(
    `[Budget] Logging usage: ${agentName} - ${inputTokens} in / ${outputTokens} out = $${costUsd.toFixed(6)}`
  );

  if (!dbPool) {
    console.warn('[Budget] No database connection - usage not logged');
    return null;
  }

  try {
    const result = await dbPool.query(
      `SELECT log_ai_usage($1, $2, $3, $4, $5, $6)`,
      [agentName, model, inputTokens, outputTokens, costUsd, metadata ? JSON.stringify(metadata) : null]
    );

    return result.rows[0]?.log_ai_usage ?? null;
  } catch (error) {
    console.error('[Budget] Error logging usage:', error);
    return null;
  }
}

/**
 * Get today's usage summary
 */
export async function getTodaySummary(): Promise<{
  totalCost: number;
  requestCount: number;
  byAgent: Record<string, { cost: number; requests: number }>;
} | null> {
  if (!dbPool) {
    return null;
  }

  try {
    // Get total from budget table
    const budgetResult = await dbPool.query(
      `SELECT total_cost_usd, requests_count FROM ai_budget WHERE date = CURRENT_DATE`
    );

    // Get breakdown by agent
    const agentResult = await dbPool.query(`
      SELECT
        agent_name,
        SUM(cost_usd) as total_cost,
        COUNT(*) as request_count
      FROM ai_usage_log
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY agent_name
    `);

    const byAgent: Record<string, { cost: number; requests: number }> = {};
    for (const row of agentResult.rows) {
      byAgent[row.agent_name] = {
        cost: Number(row.total_cost),
        requests: Number(row.request_count),
      };
    }

    return {
      totalCost: budgetResult.rows[0]?.total_cost_usd ?? 0,
      requestCount: budgetResult.rows[0]?.requests_count ?? 0,
      byAgent,
    };
  } catch (error) {
    console.error('[Budget] Error getting summary:', error);
    return null;
  }
}

/**
 * Budget guard - wraps an async function with budget checking
 * Throws if budget is exceeded
 */
export function withBudgetGuard<T>(
  fn: () => Promise<T>,
  description: string = 'AI operation'
): () => Promise<T> {
  return async () => {
    const status = await checkBudget();

    if (!status.canProceed) {
      throw new Error(
        `[Budget] Daily budget exceeded ($${status.totalSpent.toFixed(2)}/$${status.budgetLimit.toFixed(2)}). ${description} blocked.`
      );
    }

    return fn();
  };
}
