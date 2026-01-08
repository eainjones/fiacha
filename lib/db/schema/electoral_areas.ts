import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core'

export const electoralAreas = pgTable('electoral_areas', {
  id: serial('id').primaryKey(),
  localAuthorityId: integer('local_authority_id'),
  name: varchar('name', { length: 150 }).notNull(),
  areaType: varchar('area_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export type ElectoralArea = typeof electoralAreas.$inferSelect
export type ElectoralAreaInsert = typeof electoralAreas.$inferInsert
