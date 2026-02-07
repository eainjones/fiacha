/**
 * Oireachtas Workflow
 *
 * Mastra workflow replacing oireachtas-pipeline.ts.
 * Fetches Parliamentary Questions → converts to markdown → extracts promises → matches → saves.
 */

import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  fetchQuestionsWithDebates,
  debateToMarkdown,
} from '../../crawlers/oireachtas-api.js';
import { normalizePoliticianName } from '../../validators/politician-matcher.js';
import { insertPromiseReview } from '../../database/queries.js';
import { getClients } from '../steps/init-clients.js';
import { debateAnalyzer } from '../agents/debate-analyzer.js';
import {
  ExtractionResponseSchema,
  type ExtractionResponse,
  filterByConfidence,
  generateTitle,
} from '../../ai/schemas/promise.js';
import { checkBudget, logUsage } from '../../ai/tools/budget-checker.js';
import { AGENT_CONFIG } from '../../ai/config.js';
import type { CrawlResult, ExtractedPromiseType } from '../../types/index.js';
import type { SourceResult } from '../steps/aggregate-results.js';

/**
 * Extract promises from a PQ debate using the specialized debate analyzer agent.
 * Falls back to generic extractor if the agent fails.
 */
async function extractWithDebateAnalyzer(
  markdown: string,
  sourceUrl: string,
  topic: string,
  askedBy: string,
  directedTo: string,
  date: string
): Promise<ExtractedPromiseType[]> {
  const budgetStatus = await checkBudget();
  if (!budgetStatus.canProceed) {
    console.warn('[oireachtas] Budget exceeded, skipping debate analysis');
    return [];
  }

  if (!markdown || markdown.length < 100) {
    return [];
  }

  const maxContentLength = 50000;
  const truncated =
    markdown.length > maxContentLength
      ? markdown.substring(0, maxContentLength) + '\n\n[Content truncated]'
      : markdown;

  try {
    const response = await debateAnalyzer.generate(
      [
        {
          role: 'user',
          content: `Analyze this Oireachtas Parliamentary Question debate and extract any political promises or commitments made by ministers or TDs.

CONTEXT:
- Topic: ${topic}
- Asked by: ${askedBy}
- Directed to: ${directedTo}
- Date: ${date}
- Source: ${sourceUrl}

Return your response as a JSON object with a "promises" array.

DEBATE TRANSCRIPT:
${truncated}`,
        },
      ],
      {
        structuredOutput: {
          schema: ExtractionResponseSchema as any,
        },
      }
    );

    // Log usage
    const usage = response.usage as { inputTokens?: number; outputTokens?: number } | undefined;
    if (usage) {
      await logUsage({
        agentName: AGENT_CONFIG.DEBATE_ANALYZER.id,
        model: AGENT_CONFIG.DEBATE_ANALYZER.model,
        inputTokens: usage.inputTokens || 0,
        outputTokens: usage.outputTokens || 0,
        metadata: { sourceUrl, contentLength: markdown.length },
      });
    }

    const extraction = response.object as ExtractionResponse;
    if (!extraction || !extraction.promises) {
      return [];
    }

    // Filter by confidence and convert to ExtractedPromiseType
    const promises = filterByConfidence(extraction.promises, 40).map((p) => ({
      politician_name: p.politician_name,
      party: p.party || undefined,
      promise_title: p.title || generateTitle(p.promise_text),
      description: p.promise_text,
      category: p.category,
      promise_date: date,
      target_date: p.target_date || null,
      quote: p.promise_text.length <= 300 ? p.promise_text : undefined,
      confidence: p.confidence,
      source_url: sourceUrl,
      source_type: 'parliamentary' as const,
    }));

    return promises;
  } catch (error) {
    console.error(
      `[oireachtas] Debate analyzer failed, falling back to generic extractor: ${error instanceof Error ? error.message : String(error)}`
    );
    // Fall back to generic extractor
    const { extractor } = getClients();
    const crawlResult: CrawlResult = {
      url: sourceUrl,
      markdown,
      metadata: {
        title: `PQ: ${topic}`,
        description: `Question by ${askedBy} to ${directedTo}`,
        publishedDate: date,
      },
    };
    return extractor.extractPromises(crawlResult);
  }
}

/**
 * Fetch questions with debates from Oireachtas API
 */
export const fetchQuestionsStep = createStep({
  id: 'fetch-oireachtas-questions',
  description: 'Fetch recent parliamentary questions with debate transcripts',
  inputSchema: z.object({
    limit: z.number().default(20),
    dateStart: z.string().optional(),
    dateEnd: z.string().optional(),
    delayMs: z.number().default(1000),
  }),
  outputSchema: z.object({
    questions: z.array(
      z.object({
        questionId: z.string(),
        topic: z.string(),
        askedBy: z.string(),
        directedTo: z.string(),
        date: z.string(),
        sourceUrl: z.string(),
        markdown: z.string(),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    const { limit, dateStart, dateEnd, delayMs } = inputData;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = dateStart || weekAgo.toISOString().split('T')[0];
    const endDate = dateEnd || now.toISOString().split('T')[0];

    console.log(`[oireachtas] Fetching ${limit} PQs (${startDate} to ${endDate})`);

    const questionsWithDebates = await fetchQuestionsWithDebates({
      limit,
      dateStart: startDate,
      dateEnd: endDate,
      delayMs: delayMs,
    });

    console.log(`[oireachtas] Fetched ${questionsWithDebates.length} questions`);

    const questions = questionsWithDebates
      .filter(({ debate }) => debate && debate.speeches.length > 0)
      .map(({ question, debate }) => ({
        questionId: question.id,
        topic: question.topic,
        askedBy: question.askedBy.name,
        directedTo: question.directedTo,
        date: question.date,
        sourceUrl:
          question.xmlUri ||
          `https://www.oireachtas.ie/en/debates/question/${question.id}`,
        markdown: debateToMarkdown(debate!),
      }));

    return { questions };
  },
});

/**
 * Process a single PQ: extract promises, match, save
 */
export const processQuestionStep = createStep({
  id: 'process-oireachtas-question',
  description: 'Extract promises from a PQ debate, match politicians, and save',
  inputSchema: z.object({
    questionId: z.string(),
    topic: z.string(),
    askedBy: z.string(),
    directedTo: z.string(),
    date: z.string(),
    sourceUrl: z.string(),
    markdown: z.string(),
  }),
  outputSchema: z.object({
    extracted: z.number(),
    matched: z.number(),
    queued: z.number(),
    errors: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const { matcher, db } = getClients();
    let extracted = 0;
    let matched = 0;
    let queued = 0;
    const errors: string[] = [];

    try {
      const promises = await extractWithDebateAnalyzer(
        inputData.markdown,
        inputData.sourceUrl,
        inputData.topic,
        inputData.askedBy,
        inputData.directedTo,
        inputData.date
      );
      extracted = promises.length;

      if (promises.length > 0) {
        console.log(`   [oireachtas] ${inputData.topic}: ${promises.length} promises`);
      }

      for (const promise of promises) {
        try {
          const normalizedName = normalizePoliticianName(promise.politician_name);
          const match = matcher.findPolitician(normalizedName, promise.party, undefined);

          if (match) {
            matched++;
            console.log(
              `      [match] ${promise.politician_name} -> ${match.name} (${match.matchScore}%)`
            );
          }

          await insertPromiseReview(db, promise, match);
          queued++;
        } catch (error) {
          errors.push(
            `Match/save error: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      errors.push(
        `PQ extraction error (${inputData.topic}): ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return { extracted, matched, queued, errors };
  },
});

/**
 * Run the full Oireachtas pipeline as a function (used by orchestrator).
 * We don't use Mastra's .then().foreach() chaining because the questions
 * array needs to be processed sequentially with error isolation per PQ.
 */
export async function runOireachtasWorkflow(options: {
  limit?: number;
  dateStart?: string;
  dateEnd?: string;
  delayMs?: number;
}): Promise<SourceResult> {
  const { limit = 20, dateStart, dateEnd, delayMs = 1000 } = options;

  console.log('\n   Oireachtas Parliamentary Questions Pipeline');

  // Step 1: Fetch questions
  const fetchResult = await fetchQuestionsStep.execute({
    inputData: { limit, dateStart, dateEnd, delayMs },
  } as any) as { questions: { questionId: string; topic: string; askedBy: string; directedTo: string; date: string; sourceUrl: string; markdown: string }[] };

  const { questions } = fetchResult;
  console.log(`   Fetched ${questions.length} questions with debates`);

  // Step 2: Process each question
  let totalExtracted = 0;
  let totalMatched = 0;
  let totalQueued = 0;
  const allErrors: string[] = [];

  for (const question of questions) {
    const result = await processQuestionStep.execute({
      inputData: question,
    } as any) as { extracted: number; matched: number; queued: number; errors: string[] };

    totalExtracted += result.extracted;
    totalMatched += result.matched;
    totalQueued += result.queued;
    allErrors.push(...result.errors);
  }

  console.log(
    `   Oireachtas summary: ${questions.length} debates -> ${totalExtracted} promises -> ${totalQueued} queued`
  );

  return {
    extracted: totalExtracted,
    matched: totalMatched,
    queued: totalQueued,
    errors: allErrors,
  };
}
