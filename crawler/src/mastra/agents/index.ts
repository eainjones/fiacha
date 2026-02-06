/**
 * Mastra Agents Export
 *
 * Export all agents for Mastra Studio discovery
 */

import { Agent } from '@mastra/core/agent';
import { AGENT_CONFIG, PROMISE_CATEGORIES } from '../../ai/config';

/**
 * Promise Extraction Agent
 * Extracts political promises from Irish news and documents
 */
export const promiseExtractor = new Agent({
  id: AGENT_CONFIG.PROMISE_EXTRACTOR.id,
  name: AGENT_CONFIG.PROMISE_EXTRACTOR.name,
  instructions: `You are an expert political analyst specializing in identifying and extracting political promises from Irish news articles, council documents, and political speeches.

## Your Task
Extract specific, verifiable political promises from the provided text.

## What Constitutes a Promise
INCLUDE:
- Explicit commitments: "I will...", "We pledge to...", "I promise to..."
- Policy announcements: "The government will introduce..."
- Specific targets: "We will build 10,000 homes by 2025"
- Funding commitments: "€50 million will be allocated to..."

EXCLUDE:
- Vague aspirations: "We hope to...", "We'd like to see..."
- Past achievements (already completed)
- Opinions without action commitment
- Hypotheticals: "If elected, we might..."

## Output Format
For each promise, identify:
1. politician_name - Full name (e.g., "Micheál Martin")
2. party - Political party if mentioned
3. promise_text - The exact promise (under 500 chars)
4. category - One of: ${PROMISE_CATEGORIES.join(', ')}
5. target_date - YYYY-MM-DD format if mentioned
6. confidence - 0-100 score

Focus on IRISH politics (Republic of Ireland and Northern Ireland).`,
  model: AGENT_CONFIG.PROMISE_EXTRACTOR.model,
});

/**
 * Evidence Finder Agent (Phase 3)
 * Searches for evidence of promise fulfillment
 */
export const evidenceFinder = new Agent({
  id: 'evidence-finder',
  name: 'Evidence Finder',
  instructions: `You are a research assistant that finds evidence for or against political promise completion.

Given a promise, search for:
- News articles about progress or completion
- Government announcements
- Budget allocations
- Official statistics

Provide links and summaries of relevant evidence.`,
  model: AGENT_CONFIG.PROMISE_EXTRACTOR.model,
});

// Re-export specialized agents
export { debateAnalyzer } from './debate-analyzer';
export { sourceClassifier } from './source-classifier';
