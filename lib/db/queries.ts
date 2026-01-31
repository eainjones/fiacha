/**
 * Centralized Query Layer
 *
 * All database queries should go through this module for:
 * - Type safety with Drizzle ORM
 * - Consistent error handling
 * - Easy testing and mocking
 * - Single source of truth for data access patterns
 */

import { db, schema } from './client'
import { eq, desc, asc, sql, and, or, ilike, count, isNull, isNotNull } from 'drizzle-orm'
import type { Politician, PromiseRecord, Evidence, County, LocalAuthority, Party, Milestone, StatusHistoryEntry, PromiseReviewQueueItem, PromiseSubmission } from './schema'

// ============================================================================
// Promise Queries
// ============================================================================

export type PromiseFilters = {
  status?: string
  category?: string
  politicianId?: number
  search?: string
}

export type PromiseWithPolitician = PromiseRecord & {
  politician_name: string | null
  party: string | null
  party_color: string | null
  party_short_name: string | null
}

/**
 * Get promises with optional filters, pagination, and politician info
 */
export async function getPromises(
  filters: PromiseFilters = {},
  limit = 20,
  offset = 0
): Promise<PromiseWithPolitician[]> {
  const conditions = []

  if (filters.status) {
    conditions.push(eq(schema.promises.status, filters.status))
  }
  if (filters.category) {
    conditions.push(eq(schema.promises.category, filters.category))
  }
  if (filters.politicianId) {
    conditions.push(eq(schema.promises.politicianId, filters.politicianId))
  }
  if (filters.search) {
    const searchPattern = `%${filters.search}%`
    conditions.push(
      or(
        ilike(schema.promises.title, searchPattern),
        ilike(schema.promises.description, searchPattern),
        ilike(schema.politicians.name, searchPattern)
      )
    )
  }

  const result = await db
    .select({
      id: schema.promises.id,
      politicianId: schema.promises.politicianId,
      title: schema.promises.title,
      description: schema.promises.description,
      category: schema.promises.category,
      promiseDate: schema.promises.promiseDate,
      targetDate: schema.promises.targetDate,
      status: schema.promises.status,
      score: schema.promises.score,
      createdAt: schema.promises.createdAt,
      updatedAt: schema.promises.updatedAt,
      politician_name: schema.politicians.name,
      party: schema.politicians.party,
      party_color: schema.parties.color,
      party_short_name: schema.parties.shortName,
    })
    .from(schema.promises)
    .leftJoin(schema.politicians, eq(schema.promises.politicianId, schema.politicians.id))
    .leftJoin(schema.parties, eq(schema.politicians.partyId, schema.parties.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.promises.createdAt))
    .limit(limit)
    .offset(offset)

  return result as PromiseWithPolitician[]
}

/**
 * Get total count of promises matching filters
 */
export async function getPromiseCount(filters: PromiseFilters = {}): Promise<number> {
  const conditions = []

  if (filters.status) {
    conditions.push(eq(schema.promises.status, filters.status))
  }
  if (filters.category) {
    conditions.push(eq(schema.promises.category, filters.category))
  }
  if (filters.politicianId) {
    conditions.push(eq(schema.promises.politicianId, filters.politicianId))
  }
  if (filters.search) {
    const searchPattern = `%${filters.search}%`
    conditions.push(
      or(
        ilike(schema.promises.title, searchPattern),
        ilike(schema.promises.description, searchPattern),
        ilike(schema.politicians.name, searchPattern)
      )
    )
  }

  const result = await db
    .select({ total: count() })
    .from(schema.promises)
    .leftJoin(schema.politicians, eq(schema.promises.politicianId, schema.politicians.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  return result[0]?.total ?? 0
}

/**
 * Get recent promises for homepage
 */
export async function getRecentPromises(limit = 6): Promise<PromiseWithPolitician[]> {
  return getPromises({}, limit, 0)
}

/**
 * Get promise status counts for dashboard
 */
export async function getPromiseStatusCounts(): Promise<{
  total: number
  kept: number
  broken: number
  in_progress: number
  pending: number
}> {
  const result = await db
    .select({
      total: count(),
      kept: count(sql`CASE WHEN ${schema.promises.status} = 'kept' THEN 1 END`),
      broken: count(sql`CASE WHEN ${schema.promises.status} = 'broken' THEN 1 END`),
      in_progress: count(sql`CASE WHEN ${schema.promises.status} = 'in_progress' THEN 1 END`),
      pending: count(sql`CASE WHEN ${schema.promises.status} = 'pending' THEN 1 END`),
    })
    .from(schema.promises)

  const row = result[0]
  return {
    total: Number(row?.total) || 0,
    kept: Number(row?.kept) || 0,
    broken: Number(row?.broken) || 0,
    in_progress: Number(row?.in_progress) || 0,
    pending: Number(row?.pending) || 0,
  }
}

/**
 * Get distinct promise categories
 */
export async function getPromiseCategories(): Promise<string[]> {
  const result = await db
    .selectDistinct({ category: schema.promises.category })
    .from(schema.promises)
    .where(isNotNull(schema.promises.category))
    .orderBy(asc(schema.promises.category))

  return result.map((r) => r.category).filter((c): c is string => c !== null)
}

export type PromiseDetail = PromiseRecord & {
  politician_name: string | null
  party: string | null
  constituency: string | null
}

/**
 * Get full promise details by ID including politician info
 */
export async function getPromiseById(id: number): Promise<PromiseDetail | null> {
  const result = await db
    .select({
      id: schema.promises.id,
      politicianId: schema.promises.politicianId,
      title: schema.promises.title,
      description: schema.promises.description,
      category: schema.promises.category,
      promiseDate: schema.promises.promiseDate,
      targetDate: schema.promises.targetDate,
      status: schema.promises.status,
      score: schema.promises.score,
      createdAt: schema.promises.createdAt,
      updatedAt: schema.promises.updatedAt,
      politician_name: schema.politicians.name,
      party: schema.politicians.party,
      constituency: schema.politicians.constituency,
    })
    .from(schema.promises)
    .leftJoin(schema.politicians, eq(schema.promises.politicianId, schema.politicians.id))
    .where(eq(schema.promises.id, id))
    .limit(1)

  return (result[0] as PromiseDetail) ?? null
}

/**
 * Get evidence for a promise
 */
export async function getEvidenceForPromise(promiseId: number): Promise<Evidence[]> {
  return db
    .select()
    .from(schema.evidence)
    .where(eq(schema.evidence.promiseId, promiseId))
    .orderBy(desc(schema.evidence.publishedDate))
}

/**
 * Get milestones for a promise
 */
export async function getMilestonesForPromise(promiseId: number): Promise<Milestone[]> {
  return db
    .select()
    .from(schema.milestones)
    .where(eq(schema.milestones.promiseId, promiseId))
    .orderBy(desc(schema.milestones.milestoneDate))
}

/**
 * Get status history for a promise
 */
export async function getStatusHistoryForPromise(promiseId: number): Promise<StatusHistoryEntry[]> {
  return db
    .select()
    .from(schema.statusHistory)
    .where(eq(schema.statusHistory.promiseId, promiseId))
    .orderBy(desc(schema.statusHistory.createdAt))
}

/**
 * Create a new promise
 */
export async function createPromise(data: {
  politicianId: number
  title: string
  description?: string | null
  category?: string | null
  promiseDate?: string | null
  targetDate?: string | null
}): Promise<PromiseRecord> {
  const result = await db
    .insert(schema.promises)
    .values({
      politicianId: data.politicianId,
      title: data.title,
      description: data.description,
      category: data.category,
      promiseDate: data.promiseDate,
      targetDate: data.targetDate,
      status: 'pending',
    })
    .returning()

  return result[0]
}

// ============================================================================
// Politician Queries
// ============================================================================

export type PoliticianWithDetails = Politician & {
  county_name: string | null
  province: string | null
  local_authority_name: string | null
  party_color: string | null
  party_short_name: string | null
}

/**
 * Get active politicians with county and party info, with optional pagination
 */
export async function getActivePoliticians(
  limit?: number,
  offset?: number
): Promise<PoliticianWithDetails[]> {
  let query = db
    .select({
      id: schema.politicians.id,
      name: schema.politicians.name,
      party: schema.politicians.party,
      partyId: schema.politicians.partyId,
      constituency: schema.politicians.constituency,
      role: schema.politicians.role,
      active: schema.politicians.active,
      countyId: schema.politicians.countyId,
      localAuthorityId: schema.politicians.localAuthorityId,
      electoralAreaId: schema.politicians.electoralAreaId,
      positionType: schema.politicians.positionType,
      termStart: schema.politicians.termStart,
      termEnd: schema.politicians.termEnd,
      website: schema.politicians.website,
      email: schema.politicians.email,
      phone: schema.politicians.phone,
      createdAt: schema.politicians.createdAt,
      updatedAt: schema.politicians.updatedAt,
      county_name: schema.counties.name,
      province: schema.counties.province,
      local_authority_name: schema.localAuthorities.name,
      party_color: schema.parties.color,
      party_short_name: schema.parties.shortName,
    })
    .from(schema.politicians)
    .leftJoin(schema.counties, eq(schema.politicians.countyId, schema.counties.id))
    .leftJoin(schema.localAuthorities, eq(schema.politicians.localAuthorityId, schema.localAuthorities.id))
    .leftJoin(schema.parties, eq(schema.politicians.partyId, schema.parties.id))
    .where(eq(schema.politicians.active, true))
    .orderBy(asc(schema.politicians.name))
    .$dynamic()

  if (limit !== undefined) {
    query = query.limit(limit)
  }
  if (offset !== undefined) {
    query = query.offset(offset)
  }

  const result = await query

  return result as PoliticianWithDetails[]
}

/**
 * Get total count of active politicians
 */
export async function getActivePoliticiansCount(): Promise<number> {
  const result = await db
    .select({ total: count() })
    .from(schema.politicians)
    .where(eq(schema.politicians.active, true))

  return result[0]?.total ?? 0
}

/**
 * Get politicians summary with count for homepage
 */
export async function getPoliticianSummary(limit = 5): Promise<{
  list: PoliticianWithDetails[]
  total: number
}> {
  const [list, countResult] = await Promise.all([
    db
      .select({
        id: schema.politicians.id,
        name: schema.politicians.name,
        party: schema.politicians.party,
        partyId: schema.politicians.partyId,
        constituency: schema.politicians.constituency,
        role: schema.politicians.role,
        active: schema.politicians.active,
        countyId: schema.politicians.countyId,
        localAuthorityId: schema.politicians.localAuthorityId,
        electoralAreaId: schema.politicians.electoralAreaId,
        positionType: schema.politicians.positionType,
        termStart: schema.politicians.termStart,
        termEnd: schema.politicians.termEnd,
        website: schema.politicians.website,
        email: schema.politicians.email,
        phone: schema.politicians.phone,
        createdAt: schema.politicians.createdAt,
        updatedAt: schema.politicians.updatedAt,
        county_name: schema.counties.name,
        province: schema.counties.province,
        local_authority_name: schema.localAuthorities.name,
        party_color: schema.parties.color,
        party_short_name: schema.parties.shortName,
      })
      .from(schema.politicians)
      .leftJoin(schema.counties, eq(schema.politicians.countyId, schema.counties.id))
      .leftJoin(schema.localAuthorities, eq(schema.politicians.localAuthorityId, schema.localAuthorities.id))
      .leftJoin(schema.parties, eq(schema.politicians.partyId, schema.parties.id))
      .where(eq(schema.politicians.active, true))
      .orderBy(asc(schema.politicians.name))
      .limit(limit),
    db
      .select({ total: count() })
      .from(schema.politicians)
      .where(eq(schema.politicians.active, true)),
  ])

  return {
    list: list as PoliticianWithDetails[],
    total: countResult[0]?.total ?? 0,
  }
}

/**
 * Create a new politician
 */
export async function createPolitician(data: {
  name: string
  party?: string | null
  constituency?: string | null
  role?: string | null
}): Promise<Politician> {
  const result = await db
    .insert(schema.politicians)
    .values({
      name: data.name,
      party: data.party,
      constituency: data.constituency,
      role: data.role,
    })
    .returning()

  return result[0]
}

// ============================================================================
// County Queries
// ============================================================================

export type CountyWithStats = County & {
  politician_count: number
  td_count: number
  councillor_count: number
  promise_count: number
}

/**
 * Get all counties with politician and promise counts
 */
export async function getCountiesWithStats(): Promise<CountyWithStats[]> {
  // Complex aggregation query - using raw SQL via Drizzle for efficiency
  const result = await db.execute(sql`
    SELECT
      c.*,
      COALESCE(pol_counts.politician_count, 0)::int as politician_count,
      COALESCE(pol_counts.td_count, 0)::int as td_count,
      COALESCE(pol_counts.councillor_count, 0)::int as councillor_count,
      COALESCE(promise_counts.promise_count, 0)::int as promise_count
    FROM counties c
    LEFT JOIN (
      SELECT
        county_id,
        COUNT(*) FILTER (WHERE active) as politician_count,
        COUNT(*) FILTER (WHERE active AND position_type = 'TD') as td_count,
        COUNT(*) FILTER (WHERE active AND position_type = 'Councillor') as councillor_count
      FROM politicians
      GROUP BY county_id
    ) pol_counts ON pol_counts.county_id = c.id
    LEFT JOIN (
      SELECT
        pol.county_id,
        COUNT(pr.id) as promise_count
      FROM promises pr
      JOIN politicians pol ON pol.id = pr.politician_id
      GROUP BY pol.county_id
    ) promise_counts ON promise_counts.county_id = c.id
    ORDER BY c.province, c.name
  `)

  return result.rows as CountyWithStats[]
}

// ============================================================================
// Local Authority Queries
// ============================================================================

export type LocalAuthorityWithCounty = LocalAuthority & {
  county_name: string | null
  province: string | null
}

/**
 * Get all local authorities with county info
 */
export async function getLocalAuthorities(): Promise<LocalAuthorityWithCounty[]> {
  const result = await db
    .select({
      id: schema.localAuthorities.id,
      countyId: schema.localAuthorities.countyId,
      name: schema.localAuthorities.name,
      authorityType: schema.localAuthorities.authorityType,
      active: schema.localAuthorities.active,
      createdAt: schema.localAuthorities.createdAt,
      county_name: schema.counties.name,
      province: schema.counties.province,
    })
    .from(schema.localAuthorities)
    .leftJoin(schema.counties, eq(schema.localAuthorities.countyId, schema.counties.id))
    .orderBy(asc(schema.counties.province), asc(schema.counties.name), asc(schema.localAuthorities.name))

  return result as LocalAuthorityWithCounty[]
}

// ============================================================================
// Party Queries
// ============================================================================

export type PartyWithStats = Party & {
  td_count: number
  councillor_count: number
  mla_count: number
  promise_count: number
}

/**
 * Get all active parties with member and promise counts
 */
export async function getPartiesWithStats(): Promise<PartyWithStats[]> {
  const result = await db.execute(sql`
    SELECT
      p.*,
      COUNT(DISTINCT pol.id) FILTER (WHERE pol.position_type = 'TD')::int as td_count,
      COUNT(DISTINCT pol.id) FILTER (WHERE pol.position_type = 'Councillor')::int as councillor_count,
      COUNT(DISTINCT pol.id) FILTER (WHERE pol.position_type = 'MLA')::int as mla_count,
      COUNT(DISTINCT pr.id)::int as promise_count
    FROM parties p
    LEFT JOIN politicians pol ON pol.party_id = p.id AND pol.active = true
    LEFT JOIN promises pr ON pr.politician_id = pol.id
    WHERE p.active = true
    GROUP BY p.id
    ORDER BY p.name
  `)

  return result.rows as PartyWithStats[]
}

/**
 * Get party by slug
 */
export async function getPartyBySlug(slug: string): Promise<Party | null> {
  const result = await db
    .select()
    .from(schema.parties)
    .where(eq(schema.parties.slug, slug))
    .limit(1)

  return result[0] ?? null
}

/**
 * Get politicians by party ID
 */
export async function getPoliticiansByPartyId(partyId: number): Promise<PoliticianWithDetails[]> {
  const result = await db
    .select({
      id: schema.politicians.id,
      name: schema.politicians.name,
      party: schema.politicians.party,
      partyId: schema.politicians.partyId,
      constituency: schema.politicians.constituency,
      role: schema.politicians.role,
      active: schema.politicians.active,
      countyId: schema.politicians.countyId,
      localAuthorityId: schema.politicians.localAuthorityId,
      electoralAreaId: schema.politicians.electoralAreaId,
      positionType: schema.politicians.positionType,
      termStart: schema.politicians.termStart,
      termEnd: schema.politicians.termEnd,
      website: schema.politicians.website,
      email: schema.politicians.email,
      phone: schema.politicians.phone,
      createdAt: schema.politicians.createdAt,
      updatedAt: schema.politicians.updatedAt,
      county_name: schema.counties.name,
      province: schema.counties.province,
      local_authority_name: schema.localAuthorities.name,
      party_color: schema.parties.color,
      party_short_name: schema.parties.shortName,
    })
    .from(schema.politicians)
    .leftJoin(schema.counties, eq(schema.politicians.countyId, schema.counties.id))
    .leftJoin(schema.localAuthorities, eq(schema.politicians.localAuthorityId, schema.localAuthorities.id))
    .leftJoin(schema.parties, eq(schema.politicians.partyId, schema.parties.id))
    .where(and(eq(schema.politicians.partyId, partyId), eq(schema.politicians.active, true)))
    .orderBy(asc(schema.politicians.name))

  return result as PoliticianWithDetails[]
}

/**
 * Get member counts by county for a party
 */
export async function getPartyMembersByCounty(partyId: number): Promise<
  Array<{
    county_id: number
    county_name: string
    member_count: number
  }>
> {
  const result = await db.execute(sql`
    SELECT
      c.id as county_id,
      c.name as county_name,
      COUNT(pol.id)::int as member_count
    FROM politicians pol
    JOIN counties c ON c.id = pol.county_id
    WHERE pol.party_id = ${partyId} AND pol.active = true
    GROUP BY c.id, c.name
    ORDER BY member_count DESC
  `)

  return result.rows as Array<{
    county_id: number
    county_name: string
    member_count: number
  }>
}

// ============================================================================
// Review Queue Queries
// ============================================================================

/**
 * Get pending review queue items
 */
export async function getPendingReviews(limit = 50): Promise<PromiseReviewQueueItem[]> {
  return db
    .select()
    .from(schema.promiseReviewQueue)
    .where(eq(schema.promiseReviewQueue.status, 'pending'))
    .orderBy(desc(schema.promiseReviewQueue.createdAt))
    .limit(limit)
}

/**
 * Get review queue item by ID
 */
export async function getReviewById(id: number): Promise<PromiseReviewQueueItem | null> {
  const result = await db
    .select()
    .from(schema.promiseReviewQueue)
    .where(eq(schema.promiseReviewQueue.id, id))
    .limit(1)

  return result[0] ?? null
}

/**
 * Update review queue item status
 */
export async function updateReviewStatus(
  id: number,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  rejectionReason?: string
): Promise<boolean> {
  const result = await db
    .update(schema.promiseReviewQueue)
    .set({
      status,
      reviewedAt: new Date(),
      reviewedBy,
      rejectionReason: rejectionReason ?? null,
    })
    .where(and(eq(schema.promiseReviewQueue.id, id), eq(schema.promiseReviewQueue.status, 'pending')))
    .returning({ id: schema.promiseReviewQueue.id })

  return result.length > 0
}

// ============================================================================
// Promise Submissions Queries (AI-extracted promises)
// ============================================================================

export type PromiseSubmissionWithPolitician = PromiseSubmission & {
  matched_politician_name: string | null
  matched_politician_party: string | null
}

/**
 * Get pending AI-extracted promise submissions
 */
export async function getPendingSubmissions(limit = 50): Promise<PromiseSubmissionWithPolitician[]> {
  const result = await db
    .select({
      id: schema.promiseSubmissions.id,
      politicianName: schema.promiseSubmissions.politicianName,
      politicianId: schema.promiseSubmissions.politicianId,
      party: schema.promiseSubmissions.party,
      title: schema.promiseSubmissions.title,
      description: schema.promiseSubmissions.description,
      category: schema.promiseSubmissions.category,
      targetDate: schema.promiseSubmissions.targetDate,
      sourceUrl: schema.promiseSubmissions.sourceUrl,
      sourceType: schema.promiseSubmissions.sourceType,
      sourceTitle: schema.promiseSubmissions.sourceTitle,
      confidenceScore: schema.promiseSubmissions.confidenceScore,
      extractionMetadata: schema.promiseSubmissions.extractionMetadata,
      status: schema.promiseSubmissions.status,
      reviewedBy: schema.promiseSubmissions.reviewedBy,
      reviewedAt: schema.promiseSubmissions.reviewedAt,
      rejectionReason: schema.promiseSubmissions.rejectionReason,
      approvedPromiseId: schema.promiseSubmissions.approvedPromiseId,
      createdAt: schema.promiseSubmissions.createdAt,
      updatedAt: schema.promiseSubmissions.updatedAt,
      matched_politician_name: schema.politicians.name,
      matched_politician_party: schema.politicians.party,
    })
    .from(schema.promiseSubmissions)
    .leftJoin(schema.politicians, eq(schema.promiseSubmissions.politicianId, schema.politicians.id))
    .where(eq(schema.promiseSubmissions.status, 'pending_review'))
    .orderBy(desc(schema.promiseSubmissions.createdAt))
    .limit(limit)

  return result as PromiseSubmissionWithPolitician[]
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(id: number): Promise<PromiseSubmissionWithPolitician | null> {
  const result = await db
    .select({
      id: schema.promiseSubmissions.id,
      politicianName: schema.promiseSubmissions.politicianName,
      politicianId: schema.promiseSubmissions.politicianId,
      party: schema.promiseSubmissions.party,
      title: schema.promiseSubmissions.title,
      description: schema.promiseSubmissions.description,
      category: schema.promiseSubmissions.category,
      targetDate: schema.promiseSubmissions.targetDate,
      sourceUrl: schema.promiseSubmissions.sourceUrl,
      sourceType: schema.promiseSubmissions.sourceType,
      sourceTitle: schema.promiseSubmissions.sourceTitle,
      confidenceScore: schema.promiseSubmissions.confidenceScore,
      extractionMetadata: schema.promiseSubmissions.extractionMetadata,
      status: schema.promiseSubmissions.status,
      reviewedBy: schema.promiseSubmissions.reviewedBy,
      reviewedAt: schema.promiseSubmissions.reviewedAt,
      rejectionReason: schema.promiseSubmissions.rejectionReason,
      approvedPromiseId: schema.promiseSubmissions.approvedPromiseId,
      createdAt: schema.promiseSubmissions.createdAt,
      updatedAt: schema.promiseSubmissions.updatedAt,
      matched_politician_name: schema.politicians.name,
      matched_politician_party: schema.politicians.party,
    })
    .from(schema.promiseSubmissions)
    .leftJoin(schema.politicians, eq(schema.promiseSubmissions.politicianId, schema.politicians.id))
    .where(eq(schema.promiseSubmissions.id, id))
    .limit(1)

  return (result[0] as PromiseSubmissionWithPolitician) ?? null
}

/**
 * Approve a submission - creates a promise and updates submission status
 */
export async function approveSubmission(
  id: number,
  reviewedBy: string,
  politicianId: number
): Promise<{ success: boolean; promiseId?: number }> {
  const submission = await getSubmissionById(id)
  if (!submission || submission.status !== 'pending_review') {
    return { success: false }
  }

  // Create the promise
  const newPromise = await db
    .insert(schema.promises)
    .values({
      politicianId,
      title: submission.title,
      description: submission.description,
      category: submission.category,
      targetDate: submission.targetDate,
      status: 'pending',
    })
    .returning()

  if (!newPromise[0]) {
    return { success: false }
  }

  // Create evidence from source
  await db.insert(schema.evidence).values({
    promiseId: newPromise[0].id,
    sourceType: submission.sourceType,
    sourceUrl: submission.sourceUrl,
    title: submission.sourceTitle,
    description: `AI-extracted promise (confidence: ${submission.confidenceScore}%)`,
  })

  // Update submission status
  await db
    .update(schema.promiseSubmissions)
    .set({
      status: 'approved',
      reviewedBy,
      reviewedAt: new Date(),
      approvedPromiseId: newPromise[0].id,
    })
    .where(eq(schema.promiseSubmissions.id, id))

  return { success: true, promiseId: newPromise[0].id }
}

/**
 * Reject a submission
 */
export async function rejectSubmission(
  id: number,
  reviewedBy: string,
  rejectionReason?: string
): Promise<boolean> {
  const result = await db
    .update(schema.promiseSubmissions)
    .set({
      status: 'rejected',
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason: rejectionReason ?? null,
    })
    .where(and(eq(schema.promiseSubmissions.id, id), eq(schema.promiseSubmissions.status, 'pending_review')))
    .returning({ id: schema.promiseSubmissions.id })

  return result.length > 0
}

/**
 * Get submission counts by status
 */
export async function getSubmissionCounts(): Promise<{
  pending: number
  approved: number
  rejected: number
}> {
  const result = await db
    .select({
      pending: count(sql`CASE WHEN ${schema.promiseSubmissions.status} = 'pending_review' THEN 1 END`),
      approved: count(sql`CASE WHEN ${schema.promiseSubmissions.status} = 'approved' THEN 1 END`),
      rejected: count(sql`CASE WHEN ${schema.promiseSubmissions.status} = 'rejected' THEN 1 END`),
    })
    .from(schema.promiseSubmissions)

  const row = result[0]
  return {
    pending: Number(row?.pending) || 0,
    approved: Number(row?.approved) || 0,
    rejected: Number(row?.rejected) || 0,
  }
}

// ============================================================================
// Evidence Queries
// ============================================================================

/**
 * Create evidence record
 */
export async function createEvidence(data: {
  promiseId: number
  sourceType?: string | null
  sourceUrl?: string | null
  title?: string | null
  description?: string | null
  publishedDate?: string | null
}): Promise<Evidence> {
  const result = await db
    .insert(schema.evidence)
    .values({
      promiseId: data.promiseId,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl,
      title: data.title,
      description: data.description,
      publishedDate: data.publishedDate,
    })
    .returning()

  return result[0]
}
