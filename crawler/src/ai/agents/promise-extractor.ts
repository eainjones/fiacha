/**
 * Promise Extraction Agent
 *
 * AI agent that extracts political promises from news articles and documents.
 * Uses Claude Haiku for cost-efficient extraction with structured output.
 */

import { Agent } from '@mastra/core/agent';
import { AGENT_CONFIG, PROMISE_CATEGORIES } from '../config.js';
import { ExtractionResponseSchema, type ExtractedPromise, type ExtractionResponse, filterByConfidence, generateTitle } from '../schemas/promise.js';
import { checkBudget, logUsage } from '../tools/budget-checker.js';

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `You are an expert political analyst specializing in identifying and extracting political promises from Irish news articles, council documents, and political speeches.

## Your Task
Extract specific, verifiable political promises from the provided text. A promise is a commitment by a politician to take a specific action or achieve a specific outcome.

## What Constitutes a Promise
INCLUDE:
- Explicit commitments: "I will...", "We pledge to...", "I promise to..."
- Policy announcements: "The government will introduce...", "We plan to..."
- Specific targets: "We will build 10,000 homes by 2025"
- Funding commitments: "€50 million will be allocated to..."

EXCLUDE:
- Vague aspirations: "We hope to...", "We'd like to see..."
- Past achievements (already completed)
- Opinions or beliefs without action commitment
- Promises by non-politicians (activists, commentators)
- Hypotheticals: "If elected, we might..."

## Output Requirements
For each promise, extract:
1. **politician_name**: Full name (e.g., "Micheál Martin", not "Martin" or "the Taoiseach")
2. **party**: Political party if mentioned (Fianna Fáil, Fine Gael, Sinn Féin, Labour, Green Party, Social Democrats, People Before Profit, Aontú, Independent Ireland, DUP, UUP, Alliance, SDLP, TUV, Independent, or null)
3. **constituency**: Electoral area if mentioned (Dublin Bay South, Cork North-Central, etc.)
4. **promise_text**: The exact promise, preferably as a direct quote. Keep under 500 characters.
5. **title**: A short (5-10 word) summary of the promise
6. **category**: One of these EXACT values: ${PROMISE_CATEGORIES.join(', ')}
7. **target_date**: If a deadline is mentioned, in YYYY-MM-DD format. Otherwise null.
8. **confidence**: Your confidence (0-100) that this is a real, verifiable promise
9. **source_context**: Brief context (when/where the promise was made)

## Confidence Scoring Guide
- 90-100: Direct quote with clear commitment and specific details
- 70-89: Clear commitment but paraphrased or lacking some details
- 50-69: Implied commitment or ambiguous wording
- 40-49: Weak signal but worth human review
- Below 40: Don't include - too uncertain

## Important Notes
- Focus on IRISH politics (Republic of Ireland and Northern Ireland)
- Politicians include TDs, Senators, MEPs, MLAs, Councillors, and Ministers
- If the same promise appears multiple times, only extract it once
- If no promises are found, return an empty array
- Be conservative - it's better to miss a promise than extract something that isn't one`;

// ============================================================================
// AGENT DEFINITION
// ============================================================================

/**
 * Create the Promise Extraction Agent
 * Note: Agent is created fresh for each extraction to ensure clean state
 */
function createPromiseExtractorAgent(): Agent {
  return new Agent({
    id: AGENT_CONFIG.PROMISE_EXTRACTOR.id,
    name: AGENT_CONFIG.PROMISE_EXTRACTOR.name,
    instructions: SYSTEM_PROMPT,
    model: AGENT_CONFIG.PROMISE_EXTRACTOR.model,
  });
}

// ============================================================================
// EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract promises from a document
 *
 * @param content - The text content to analyze
 * @param sourceUrl - URL of the source document (for logging)
 * @param minConfidence - Minimum confidence threshold (default 50)
 * @returns Array of extracted promises, or empty array if none found
 */
export async function extractPromises(
  content: string,
  sourceUrl?: string,
  minConfidence: number = 40
): Promise<ExtractedPromise[]> {
  // Check budget before proceeding
  const budgetStatus = await checkBudget();
  if (!budgetStatus.canProceed) {
    console.warn('[PromiseExtractor] Budget exceeded, skipping extraction');
    return [];
  }

  // Truncate very long content to avoid excessive token usage
  const maxContentLength = 50000; // ~12.5k tokens
  const truncatedContent =
    content.length > maxContentLength
      ? content.substring(0, maxContentLength) + '\n\n[Content truncated due to length]'
      : content;

  console.log(
    `[PromiseExtractor] Extracting from ${sourceUrl || 'unknown source'} (${truncatedContent.length} chars)`
  );

  try {
    const agent = createPromiseExtractorAgent();

    const response = await agent.generate(
      [
        {
          role: 'user',
          content: `Please analyze the following text and extract any political promises made by Irish politicians. Return your response as a JSON object with a "promises" array.

SOURCE URL: ${sourceUrl || 'Not provided'}

DOCUMENT CONTENT:
${truncatedContent}`,
        },
      ],
      {
        structuredOutput: {
          schema: ExtractionResponseSchema as any,
        },
      }
    );

    // Log usage - Mastra uses inputTokens/outputTokens
    const usage = response.usage as { inputTokens?: number; outputTokens?: number } | undefined;
    if (usage) {
      await logUsage({
        agentName: AGENT_CONFIG.PROMISE_EXTRACTOR.id,
        model: AGENT_CONFIG.PROMISE_EXTRACTOR.model,
        inputTokens: usage.inputTokens || 0,
        outputTokens: usage.outputTokens || 0,
        metadata: {
          sourceUrl,
          contentLength: content.length,
          truncated: content.length > maxContentLength,
        },
      });
    }

    // Parse response - the object is typed by Mastra
    const extraction = response.object as ExtractionResponse;

    if (!extraction || !extraction.promises) {
      console.log('[PromiseExtractor] No promises found or invalid response');
      return [];
    }

    // Filter by confidence and add generated titles
    const promises = filterByConfidence(extraction.promises, minConfidence).map((p) => ({
      ...p,
      title: p.title || generateTitle(p.promise_text),
    }));

    console.log(
      `[PromiseExtractor] Extracted ${promises.length} promises (${extraction.promises.length} before confidence filter)`
    );

    return promises;
  } catch (error) {
    console.error('[PromiseExtractor] Extraction failed:', error);
    return [];
  }
}

/**
 * Extract promises from multiple documents in batch
 * Useful for processing crawl results efficiently
 */
export async function extractPromisesBatch(
  documents: Array<{ content: string; url: string }>,
  minConfidence: number = 40
): Promise<Array<{ url: string; promises: ExtractedPromise[] }>> {
  const results: Array<{ url: string; promises: ExtractedPromise[] }> = [];

  for (const doc of documents) {
    // Check budget before each extraction
    const budgetStatus = await checkBudget();
    if (!budgetStatus.canProceed) {
      console.warn('[PromiseExtractor] Budget exceeded during batch extraction, stopping');
      break;
    }

    const promises = await extractPromises(doc.content, doc.url, minConfidence);
    results.push({ url: doc.url, promises });

    // Small delay between extractions to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}
