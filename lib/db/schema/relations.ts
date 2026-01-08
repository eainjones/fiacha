import { relations } from 'drizzle-orm'
import { politicians } from './politicians'
import { promises } from './promises'
import { evidence } from './evidence'
import { statusHistory } from './status_history'
import { milestones } from './milestones'
import { counties } from './counties'
import { localAuthorities } from './local_authorities'
import { electoralAreas } from './electoral_areas'
import { parties } from './parties'

export const politicianRelations = relations(politicians, ({ many, one }) => ({
  promises: many(promises),
  county: one(counties, {
    fields: [politicians.countyId],
    references: [counties.id],
  }),
  localAuthority: one(localAuthorities, {
    fields: [politicians.localAuthorityId],
    references: [localAuthorities.id],
  }),
  electoralArea: one(electoralAreas, {
    fields: [politicians.electoralAreaId],
    references: [electoralAreas.id],
  }),
  party: one(parties, {
    fields: [politicians.partyId],
    references: [parties.id],
  }),
}))

export const promiseRelations = relations(promises, ({ many, one }) => ({
  politician: one(politicians, {
    fields: [promises.politicianId],
    references: [politicians.id],
  }),
  evidence: many(evidence),
  statusHistory: many(statusHistory),
  milestones: many(milestones),
}))

export const evidenceRelations = relations(evidence, ({ one }) => ({
  promise: one(promises, {
    fields: [evidence.promiseId],
    references: [promises.id],
  }),
}))

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  promise: one(promises, {
    fields: [statusHistory.promiseId],
    references: [promises.id],
  }),
}))

export const milestoneRelations = relations(milestones, ({ one }) => ({
  promise: one(promises, {
    fields: [milestones.promiseId],
    references: [promises.id],
  }),
}))

export const countyRelations = relations(counties, ({ many }) => ({
  politicians: many(politicians),
  localAuthorities: many(localAuthorities),
}))

export const localAuthorityRelations = relations(localAuthorities, ({ one, many }) => ({
  county: one(counties, {
    fields: [localAuthorities.countyId],
    references: [counties.id],
  }),
  politicians: many(politicians),
  electoralAreas: many(electoralAreas),
}))

export const electoralAreaRelations = relations(electoralAreas, ({ one, many }) => ({
  localAuthority: one(localAuthorities, {
    fields: [electoralAreas.localAuthorityId],
    references: [localAuthorities.id],
  }),
  politicians: many(politicians),
}))

export const partyRelations = relations(parties, ({ many }) => ({
  politicians: many(politicians),
}))
