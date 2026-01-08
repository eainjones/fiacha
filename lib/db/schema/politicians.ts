import { pgTable, serial, varchar, boolean, timestamp, integer, date, text } from 'drizzle-orm/pg-core'

export const politicians = pgTable('politicians', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  party: varchar('party', { length: 100 }),
  partyId: integer('party_id'),
  constituency: varchar('constituency', { length: 100 }),
  role: varchar('role', { length: 100 }),
  active: boolean('active').default(true),
  countyId: integer('county_id'),
  localAuthorityId: integer('local_authority_id'),
  electoralAreaId: integer('electoral_area_id'),
  positionType: varchar('position_type', { length: 50 }),
  termStart: date('term_start'),
  termEnd: date('term_end'),
  website: text('website'),
  email: text('email'),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Politician = typeof politicians.$inferSelect
export type PoliticianInsert = typeof politicians.$inferInsert
