/**
 * Drizzle ORM Schema Definitions
 *
 * This module exports all database table definitions and their types.
 * Use these for type-safe database queries with Drizzle ORM.
 */

// Table definitions
export { politicians, type Politician, type PoliticianInsert } from './politicians'
export { promises, type PromiseRecord, type PromiseInsert } from './promises'
export { evidence, type Evidence, type EvidenceInsert } from './evidence'
export { counties, type County, type CountyInsert } from './counties'
export { localAuthorities, type LocalAuthority, type LocalAuthorityInsert } from './local_authorities'
export { electoralAreas, type ElectoralArea, type ElectoralAreaInsert } from './electoral_areas'
export { parties, type Party, type PartyInsert } from './parties'
export { promiseReviewQueue, type PromiseReviewQueueItem, type PromiseReviewQueueInsert } from './promise_review_queue'
export { promiseSubmissions, type PromiseSubmission, type PromiseSubmissionInsert } from './promise_submissions'
export { statusHistory, type StatusHistoryEntry, type StatusHistoryInsert } from './status_history'
export { milestones, type Milestone, type MilestoneInsert } from './milestones'

// Relations
export {
  politicianRelations,
  promiseRelations,
  evidenceRelations,
  statusHistoryRelations,
  milestoneRelations,
  countyRelations,
  localAuthorityRelations,
  electoralAreaRelations,
  partyRelations,
} from './relations'
