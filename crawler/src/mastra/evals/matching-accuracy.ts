/**
 * Matching Accuracy Scorer
 *
 * Deterministic scorer that evaluates politician matching quality.
 * No LLM cost — purely based on match confidence scores.
 */

import { createScorer } from '@mastra/core/evals';

export const matchingAccuracyScorer = createScorer({
  id: 'matching-accuracy',
  description:
    'Evaluate the accuracy of politician name matching (deterministic, no LLM cost)',
}).generateScore(({ run }) => {
  const output = run.output as {
    matches: Array<{
      inputName: string;
      matchedName: string | null;
      matchScore: number;
      isExactMatch: boolean;
    }>;
  };

  if (!output.matches || output.matches.length === 0) {
    return 0;
  }

  // Score = percentage of high-confidence matches (>= 90)
  const highConfidenceMatches = output.matches.filter(
    (m) => m.matchScore >= 90
  );

  const score = highConfidenceMatches.length / output.matches.length;

  return score;
});
