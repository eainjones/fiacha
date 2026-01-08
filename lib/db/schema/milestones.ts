import { pgTable, serial, integer, text, date, boolean, timestamp } from 'drizzle-orm/pg-core'

export const milestones = pgTable('milestones', {
  id: serial('id').primaryKey(),
  promiseId: integer('promise_id'),
  title: text('title').notNull(),
  description: text('description'),
  milestoneDate: date('milestone_date'),
  achieved: boolean('achieved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Milestone = typeof milestones.$inferSelect
export type MilestoneInsert = typeof milestones.$inferInsert
