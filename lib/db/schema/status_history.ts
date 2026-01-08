import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const statusHistory = pgTable('status_history', {
  id: serial('id').primaryKey(),
  promiseId: integer('promise_id'),
  status: varchar('status', { length: 50 }).notNull(),
  score: integer('score'),
  rationale: text('rationale'),
  evidenceIds: integer('evidence_ids').array(),
  changedBy: varchar('changed_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export type StatusHistoryEntry = typeof statusHistory.$inferSelect
export type StatusHistoryInsert = typeof statusHistory.$inferInsert
