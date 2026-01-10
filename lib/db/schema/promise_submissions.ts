import { pgTable, serial, varchar, integer, text, timestamp, jsonb, date } from 'drizzle-orm/pg-core'
import { politicians } from './politicians'
import { promises } from './promises'

export const promiseSubmissions = pgTable('promise_submissions', {
  id: serial('id').primaryKey(),
  politicianName: text('politician_name').notNull(),
  politicianId: integer('politician_id').references(() => politicians.id),
  party: text('party'),
  title: text('title').notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  targetDate: date('target_date'),
  sourceUrl: text('source_url').notNull(),
  sourceType: varchar('source_type', { length: 50 }).notNull(),
  sourceTitle: text('source_title'),
  confidenceScore: integer('confidence_score'),
  extractionMetadata: jsonb('extraction_metadata'),
  status: varchar('status', { length: 50 }).default('pending_review'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  approvedPromiseId: integer('approved_promise_id').references(() => promises.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type PromiseSubmission = typeof promiseSubmissions.$inferSelect
export type PromiseSubmissionInsert = typeof promiseSubmissions.$inferInsert
