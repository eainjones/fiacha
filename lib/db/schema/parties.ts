import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'

export const parties = pgTable('parties', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  shortName: varchar('short_name', { length: 20 }),
  slug: varchar('slug', { length: 50 }).unique(),
  color: varchar('color', { length: 7 }),
  logo: text('logo'),
  website: text('website'),
  foundedYear: integer('founded_year'),
  leader: varchar('leader', { length: 100 }),
  headquarters: varchar('headquarters', { length: 200 }),
  ideology: text('ideology'),
  politicalPosition: varchar('political_position', { length: 50 }),
  keyPolicies: text('key_policies'),
  euParliamentGroup: varchar('eu_parliament_group', { length: 100 }),
  euParty: varchar('eu_party', { length: 100 }),
  description: text('description'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Party = typeof parties.$inferSelect
export type PartyInsert = typeof parties.$inferInsert
