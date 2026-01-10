/**
 * Promise Submissions Database Functions
 *
 * Save AI-extracted promises to the review queue for human approval
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase client
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
  }

  return createClient(url, key);
}

export interface PromiseSubmission {
  politician_name: string;
  politician_id?: number | null;
  party?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  target_date?: string | null;
  source_url: string;
  source_type: 'oireachtas' | 'rss' | 'manual' | 'firecrawl';
  source_title?: string | null;
  confidence_score?: number | null;
  extraction_metadata?: Record<string, any> | null;
}

/**
 * Save a single promise submission to the review queue
 */
export async function saveSubmission(submission: PromiseSubmission): Promise<number | null> {
  const supabase = getSupabaseClient();

  // Try to match politician by name
  let politician_id: number | null = null;
  if (submission.politician_name) {
    const { data: politicians } = await supabase
      .from('politicians')
      .select('id, name')
      .ilike('name', `%${submission.politician_name}%`)
      .limit(1);

    if (politicians && politicians.length > 0) {
      politician_id = politicians[0].id;
      console.log(`[DB] Matched "${submission.politician_name}" to politician #${politician_id}`);
    } else {
      console.log(`[DB] No match found for "${submission.politician_name}"`);
    }
  }

  const { data, error } = await supabase
    .from('promise_submissions')
    .insert({
      politician_name: submission.politician_name,
      politician_id,
      party: submission.party,
      title: submission.title,
      description: submission.description,
      category: submission.category,
      target_date: submission.target_date,
      source_url: submission.source_url,
      source_type: submission.source_type,
      source_title: submission.source_title,
      confidence_score: submission.confidence_score,
      extraction_metadata: submission.extraction_metadata,
      status: 'pending_review',
    })
    .select('id')
    .single();

  if (error) {
    console.error(`[DB] Failed to save submission: ${error.message}`);
    return null;
  }

  console.log(`[DB] Saved submission #${data.id}: "${submission.title.substring(0, 50)}..."`);
  return data.id;
}

/**
 * Save multiple promise submissions in batch
 */
export async function saveSubmissions(submissions: PromiseSubmission[]): Promise<number[]> {
  const savedIds: number[] = [];

  for (const submission of submissions) {
    const id = await saveSubmission(submission);
    if (id) savedIds.push(id);
  }

  return savedIds;
}

/**
 * Check if a similar submission already exists (by source_url and politician)
 */
export async function isDuplicateSubmission(
  source_url: string,
  politician_name: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('promise_submissions')
    .select('id')
    .eq('source_url', source_url)
    .ilike('politician_name', `%${politician_name}%`)
    .limit(1);

  if (error) {
    console.error(`[DB] Duplicate check failed: ${error.message}`);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Get pending submissions for review
 */
export async function getPendingSubmissions(limit = 50): Promise<any[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('promise_submissions')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`[DB] Failed to get pending submissions: ${error.message}`);
    return [];
  }

  return data || [];
}
