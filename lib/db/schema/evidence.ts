import { pgTable, serial, integer, varchar, text, date, timestamp } from 'drizzle-orm/pg-core'

export const evidence = pgTable('evidence', {
  id: serial('id').primaryKey(),
  promiseId: integer('promise_id'),
  sourceType: varchar('source_type', { length: 50 }),
  sourceUrl: text('source_url'),
  title: text('title'),
  description: text('description'),
  publishedDate: date('published_date'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Evidence = typeof evidence.$inferSelect
export type EvidenceInsert = typeof evidence.$inferInsert
