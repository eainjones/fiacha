import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'

export const localAuthorities = pgTable('local_authorities', {
  id: serial('id').primaryKey(),
  countyId: integer('county_id'),
  name: varchar('name', { length: 150 }).notNull(),
  authorityType: varchar('authority_type', { length: 50 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export type LocalAuthority = typeof localAuthorities.$inferSelect
export type LocalAuthorityInsert = typeof localAuthorities.$inferInsert
