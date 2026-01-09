/**
 * Mastra Client Initialization
 *
 * Sets up the Mastra framework with Anthropic provider.
 * Handles API key configuration and provides the base client.
 */

import { Mastra } from '@mastra/core';

// Validate API key is present
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[Mastra] ANTHROPIC_API_KEY not set - AI features will be disabled');
}

/**
 * Mastra instance configured for Fiacha
 *
 * Note: We don't use extensive Mastra features like workflows or integrations
 * for Phase 1. We use it primarily for agent orchestration with Anthropic.
 */
export const mastra = new Mastra({});

/**
 * Check if AI features are properly configured
 */
export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Get the Anthropic API key
 * Throws if not configured (call isAIConfigured first)
 */
export function getAnthropicApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return key;
}
