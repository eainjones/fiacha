import { pgTable, serial, text, varchar, date, integer, timestamp } from 'drizzle-orm/pg-core'

export const promises = pgTable('promises', {
  id: serial('id').primaryKey(),
  politicianId: integer('politician_id'),
  title: text('title').notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  promiseDate: date('promise_date'),
  targetDate: date('target_date'),
  status: varchar('status', { length: 50 }).default('pending'),
  score: integer('score'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type PromiseRecord = typeof promises.$inferSelect
export type PromiseInsert = typeof promises.$inferInsert
