import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const crawlRuns = pgTable('crawl_runs', {
  id: serial('id').primaryKey(),
  pipeline: text('pipeline').notNull(),
  status: text('status').notNull().default('running'),
  promisesFound: integer('promises_found').default(0),
  politiciansMatched: integer('politicians_matched').default(0),
  queuedForReview: integer('queued_for_review').default(0),
  errorCount: integer('error_count').default(0),
  errorMessage: text('error_message'),
  durationMs: integer('duration_ms'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export type CrawlRun = typeof crawlRuns.$inferSelect
export type CrawlRunInsert = typeof crawlRuns.$inferInsert
