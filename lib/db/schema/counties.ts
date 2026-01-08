import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'

export const counties = pgTable('counties', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  province: varchar('province', { length: 50 }),
  country: varchar('country', { length: 50 }).default('Ireland'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export type County = typeof counties.$inferSelect
export type CountyInsert = typeof counties.$inferInsert
