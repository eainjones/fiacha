/**
 * Mastra Configuration
 *
 * Main entry point for Mastra Studio
 * Run: npx mastra dev
 * Access: http://localhost:4111
 */

import { Mastra } from '@mastra/core';
import { Observability } from '@mastra/observability';
import { promiseExtractor, evidenceFinder, debateAnalyzer, sourceClassifier } from './agents/index.js';
import {
  politicianLookupTool,
  promiseSaveTool,
  budgetCheckTool,
  dedupCheckTool,
} from './tools/index.js';
import { extractionQualityScorer, matchingAccuracyScorer } from './evals/index.js';

export const mastra = new Mastra({
  agents: {
    promiseExtractor,
    evidenceFinder,
    debateAnalyzer,
    sourceClassifier,
  },
  tools: {
    politicianLookupTool,
    promiseSaveTool,
    budgetCheckTool,
    dedupCheckTool,
  },
  scorers: {
    extractionQuality: extractionQualityScorer,
    matchingAccuracy: matchingAccuracyScorer,
  },
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'fiacha-crawler',
      },
    },
  }),
});
