/**
 * Match and Save Step
 *
 * For each extracted promise: normalize name, find politician, insert to review queue.
 * Returns per-batch results (matched count, queued count, errors).
 */

import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { normalizePoliticianName } from '../../validators/politician-matcher.js';
import { insertPromiseReview } from '../../database/queries.js';
import { getClients } from './init-clients.js';
import type { ExtractedPromiseType } from '../../types/index.js';

export const matchAndSaveStep = createStep({
  id: 'match-and-save',
  description: 'Match extracted promises to politicians and save to review queue',
  inputSchema: z.object({
    promises: z.array(
      z.object({
        politician_name: z.string(),
        party: z.string().optional(),
        promise_title: z.string(),
        description: z.string(),
        category: z.string(),
        promise_date: z.string().or(z.date()),
        target_date: z.string().or(z.date()).nullable(),
        quote: z.string().optional(),
        confidence: z.number(),
        source_url: z.string(),
        source_type: z.string(),
      })
    ),
    sourceLabel: z.string().optional(),
  }),
  outputSchema: z.object({
    matched: z.number(),
    queued: z.number(),
    errors: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const { db, matcher } = getClients();
    let matched = 0;
    let queued = 0;
    const errors: string[] = [];

    for (const promise of inputData.promises) {
      try {
        const normalizedName = normalizePoliticianName(promise.politician_name);
        const match = matcher.findPolitician(normalizedName, promise.party, undefined);

        if (match) {
          matched++;
          console.log(
            `   [match] ${promise.politician_name} -> ${match.name} (${match.matchScore}%)`
          );
        }

        await insertPromiseReview(db, promise as ExtractedPromiseType, match);
        queued++;
      } catch (error) {
        const msg = `Match/save error for "${promise.politician_name}": ${error instanceof Error ? error.message : String(error)}`;
        errors.push(msg);
      }
    }

    return { matched, queued, errors };
  },
});
