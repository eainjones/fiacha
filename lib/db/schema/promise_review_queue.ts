import { pgTable, serial, varchar, jsonb, timestamp, text } from 'drizzle-orm/pg-core'

export const promiseReviewQueue = pgTable('promise_review_queue', {
  id: serial('id').primaryKey(),
  extractedPromise: jsonb('extracted_promise').notNull(),
  politicianMatch: jsonb('politician_match'),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: varchar('reviewed_by', { length: 100 }),
  rejectionReason: text('rejection_reason'),
})

export type PromiseReviewQueueItem = typeof promiseReviewQueue.$inferSelect
export type PromiseReviewQueueInsert = typeof promiseReviewQueue.$inferInsert
