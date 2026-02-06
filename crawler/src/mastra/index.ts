/**
 * Mastra Configuration
 *
 * Main entry point for Mastra Studio
 * Run: npx mastra dev
 * Access: http://localhost:4111
 */

import { Mastra } from '@mastra/core';
import { promiseExtractor, evidenceFinder, debateAnalyzer, sourceClassifier } from './agents';

export const mastra = new Mastra({
  agents: {
    promiseExtractor,
    evidenceFinder,
    debateAnalyzer,
    sourceClassifier,
  },
});
