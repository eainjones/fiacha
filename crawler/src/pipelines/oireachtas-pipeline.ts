/**
 * Oireachtas Pipeline
 *
 * Fetches Parliamentary Questions via the Oireachtas Open Data API,
 * converts debate transcripts to markdown, then runs promise extraction.
 *
 * This is the highest-value source for promises — ministers respond to
 * PQs with specific commitments on the official Dáil/Seanad record.
 */

import {
  fetchQuestionsWithDebates,
  debateToMarkdown,
  OireachtasQuestion,
  OireachtasDebateSection,
} from '../crawlers/oireachtas-api.js';
import { IPromiseExtractor } from '../extractors/llm-interface.js';
import { PoliticianMatcher, normalizePoliticianName } from '../validators/politician-matcher.js';
import { insertPromiseReview } from '../database/queries.js';
import { DatabaseClient } from '../database/client.js';
import { ExtractedPromiseType, CrawlResult } from '../types/index.js';
import { MetricsCollector } from '../metrics/crawler-metrics.js';

export interface OireachtasPipelineOptions {
  /** Number of recent PQs to fetch (default: 20) */
  limit?: number;
  /** Start date filter YYYY-MM-DD */
  dateStart?: string;
  /** End date filter YYYY-MM-DD */
  dateEnd?: string;
  /** Delay between API calls in ms (default: 1000) */
  delayMs?: number;
}

export interface OireachtasPipelineResult {
  questionsProcessed: number;
  debatesFetched: number;
  promisesExtracted: number;
  politiciansMatched: number;
  queuedForReview: number;
  errors: string[];
}

/**
 * Run the Oireachtas PQ pipeline
 */
export async function runOireachtasPipeline(
  extractor: IPromiseExtractor,
  matcher: PoliticianMatcher,
  db: DatabaseClient,
  metrics: MetricsCollector,
  options: OireachtasPipelineOptions = {}
): Promise<OireachtasPipelineResult> {
  const {
    limit = 20,
    dateStart,
    dateEnd,
    delayMs = 1000,
  } = options;

  const result: OireachtasPipelineResult = {
    questionsProcessed: 0,
    debatesFetched: 0,
    promisesExtracted: 0,
    politiciansMatched: 0,
    queuedForReview: 0,
    errors: [],
  };

  console.log('\n   📜 Oireachtas Parliamentary Questions Pipeline');
  console.log(`      Fetching ${limit} recent PQs...`);

  try {
    // Calculate default date range: last 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = dateStart || weekAgo.toISOString().split('T')[0];
    const endDate = dateEnd || now.toISOString().split('T')[0];

    console.log(`      Date range: ${startDate} to ${endDate}`);

    const questionsWithDebates = await fetchQuestionsWithDebates({
      limit,
      dateStart: startDate,
      dateEnd: endDate,
      delayMs,
    });

    console.log(`      ✓ Fetched ${questionsWithDebates.length} questions`);
    result.questionsProcessed = questionsWithDebates.length;

    // Process each question with its debate transcript
    for (const { question, debate } of questionsWithDebates) {
      if (!debate || debate.speeches.length === 0) {
        continue;
      }

      result.debatesFetched++;
      metrics.recordPagesCrawled(1);

      // Convert debate to markdown for the extractor
      const markdown = debateToMarkdown(debate);
      const sourceUrl = question.xmlUri || `https://www.oireachtas.ie/en/debates/question/${question.id}`;

      const crawlResult: CrawlResult = {
        url: sourceUrl,
        markdown,
        metadata: {
          title: `PQ: ${question.topic}`,
          description: `${question.questionType} question by ${question.askedBy.name} to ${question.directedTo}`,
          publishedDate: question.date,
        },
      };

      try {
        const promises = await extractor.extractPromises(crawlResult);
        result.promisesExtracted += promises.length;
        metrics.recordExtraction(promises.length);

        if (promises.length === 0) continue;

        console.log(`      📄 ${question.topic}: ${promises.length} promises`);

        // Match and queue
        for (const promise of promises) {
          const normalizedName = normalizePoliticianName(promise.politician_name);
          const match = matcher.findPolitician(normalizedName, promise.party, undefined);

          metrics.recordMatch(
            match ? match.matchScore : null,
            match ? match.isExactMatch : false
          );

          if (match) {
            result.politiciansMatched++;
            console.log(`         ✓ ${promise.politician_name} → ${match.name} (${match.matchScore}%)`);
          }

          const reviewId = await insertPromiseReview(db, promise, match);
          result.queuedForReview++;
          metrics.recordQueueInsertion();
        }
      } catch (error) {
        const msg = `PQ extraction error (${question.topic}): ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(msg);
        metrics.recordError();
      }
    }
  } catch (error) {
    const msg = `Oireachtas pipeline error: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`      ✗ ${msg}`);
    result.errors.push(msg);
  }

  console.log(`      Summary: ${result.debatesFetched} debates → ${result.promisesExtracted} promises → ${result.queuedForReview} queued`);
  return result;
}
