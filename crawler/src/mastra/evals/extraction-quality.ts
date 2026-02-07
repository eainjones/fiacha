/**
 * Extraction Quality Scorer
 *
 * LLM-as-judge scorer that evaluates promise extraction quality.
 * Uses Haiku to score 0-1 based on: promises found, false positive rate, detail accuracy.
 */

import { createScorer } from '@mastra/core/evals';
import { z } from 'zod';
import { AI_MODELS } from '../../ai/config.js';

export const extractionQualityScorer = createScorer({
  id: 'extraction-quality',
  description:
    'Evaluate the quality of promise extraction from political content',
  judge: {
    model: AI_MODELS.HAIKU,
    instructions:
      'You are an expert evaluator of political promise extraction. Score the quality of extracted promises from Irish political content.',
  },
})
  .preprocess(({ run }) => {
    const output = run.output as {
      content: string;
      promises: Array<{
        politician_name: string;
        promise_title: string;
        description: string;
        confidence: number;
      }>;
    };

    return {
      contentLength: output.content?.length || 0,
      promiseCount: output.promises?.length || 0,
      averageConfidence:
        output.promises && output.promises.length > 0
          ? output.promises.reduce((sum, p) => sum + p.confidence, 0) /
            output.promises.length
          : 0,
      hasSpecificNames: output.promises?.every(
        (p) => p.politician_name && p.politician_name.length > 3
      ) ?? false,
      hasDescriptions: output.promises?.every(
        (p) => p.description && p.description.length > 20
      ) ?? false,
    };
  })
  .generateScore({
    description: 'Score the extraction quality from 0 to 1',
    createPrompt: ({ run, results }) => {
      const output = run.output as {
        content: string;
        promises: Array<{
          politician_name: string;
          promise_title: string;
          description: string;
          confidence: number;
        }>;
      };
      const groundTruth = run.groundTruth as {
        expectedPromiseCount?: number;
        expectedPoliticians?: string[];
      } | undefined;

      const preprocessResult = results.preprocessStepResult as {
        contentLength: number;
        promiseCount: number;
        averageConfidence: number;
        hasSpecificNames: boolean;
        hasDescriptions: boolean;
      };

      return `Evaluate the quality of these extracted promises on a scale from 0 to 1.

CONTENT LENGTH: ${preprocessResult.contentLength} characters
PROMISES EXTRACTED: ${preprocessResult.promiseCount}
AVERAGE CONFIDENCE: ${preprocessResult.averageConfidence.toFixed(1)}
ALL HAVE SPECIFIC NAMES: ${preprocessResult.hasSpecificNames}
ALL HAVE DESCRIPTIONS: ${preprocessResult.hasDescriptions}

${groundTruth?.expectedPromiseCount !== undefined ? `EXPECTED PROMISE COUNT: ${groundTruth.expectedPromiseCount}` : ''}
${groundTruth?.expectedPoliticians ? `EXPECTED POLITICIANS: ${groundTruth.expectedPoliticians.join(', ')}` : ''}

EXTRACTED PROMISES:
${output.promises?.map((p, i) => `${i + 1}. [${p.politician_name}] "${p.promise_title}" (confidence: ${p.confidence})\n   ${p.description}`).join('\n\n') || 'None'}

SCORING CRITERIA:
- 0.9-1.0: Correct number of promises, all politicians named correctly, specific and verifiable
- 0.7-0.89: Most promises found, minor naming issues or missing details
- 0.5-0.69: Some promises found but significant omissions or false positives
- 0.3-0.49: Major issues - many false positives or missed promises
- 0.0-0.29: Extraction largely failed

Return ONLY a number between 0 and 1.`;
    },
  })
  .generateReason({
    description: 'Explain the score',
    createPrompt: ({ run, score }) => {
      const output = run.output as {
        promises: Array<{ politician_name: string; promise_title: string }>;
      };

      return `You scored the extraction ${score}/1.0.
${output.promises?.length || 0} promises were extracted.
Briefly explain why this score was given (1-2 sentences).`;
    },
  });
