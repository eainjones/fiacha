# Fiacha Technical Implementation Document (Full System)

## 1) Scope and Goals
Deliver a stable, secure, and scalable system across:
- Web app (Next.js) for public browsing and admin review
- Crawler service for promise extraction and review queue
- Data pipeline for cleaning and validation
- Database schema, indexing, and migrations
- Ops/CI for deployment and monitoring

This document defines required changes, implementation steps, and acceptance tests.

## 2) Architecture Overview
- App: Next.js (`app/`), server components + API routes
- DB: Supabase Postgres; direct `pg` access in `lib/db.ts`
- Crawler: Node/TS service in `crawler/`, inserts into `promise_review_queue`
- Review process: human review approves to `promises` + `evidence`

## 3) Implementation Requirements

### 3.1 Web App (Next.js)

**A. Security**
- Enforce admin allowlist for review actions:
  - Pages: `/admin/review`, `/review-queue`
  - API routes: `/api/review-queue/[id]/approve`, `/api/review-queue/[id]/reject`
- Admin allowlist must be configurable via environment variable:
  - `ADMIN_EMAIL_ALLOWLIST="email1,email2"`
- All POST endpoints must validate payloads (Zod or equivalent):
  - `/api/promises`
  - `/api/politicians`
  - `/api/review-queue/[id]/approve`
  - `/api/review-queue/[id]/reject`

**B. Data Access**
- Adopt a single data access layer in `lib/db/`:
  - If using Drizzle, define schema and query helpers.
  - If not, centralize raw SQL in `lib/db/queries.ts`.
- Remove duplicated SQL from pages.

### 3.1.1 Drizzle Migration Plan (Required for Full ORM Migration)

**A. Dependencies and Setup**
- Add dependencies:
  - `drizzle-orm`, `drizzle-kit`
  - `pg` (keep for parity with current setup)
- Add config: `drizzle.config.ts` at repo root.
- Ensure `DATABASE_URL` is available for the Drizzle CLI.

**B. Schema Definitions**
- Create `lib/db/schema/` with table definitions for:
  - `politicians`, `promises`, `evidence`, `status_history`, `milestones`
  - `counties`, `local_authorities`, `electoral_areas`
  - `promise_review_queue`
- Match column types to migrations (timestamps, JSONB, arrays).
- Document enums (e.g., promise status, review status) as `pgEnum` or string types.

**C. Client and Query Layer**
- Create `lib/db/client.ts` exporting the Drizzle client.
- Create `lib/db/queries.ts` for all reads/writes.
- Replace direct SQL in:
  - `app/page.tsx`
  - `app/promises/page.tsx`
  - `app/politicians/page.tsx`
  - `app/counties/page.tsx`
  - API routes in `app/api/*`

**D. Migrations**
- Decide migration ownership:
  - Option 1: Convert existing SQL migrations to Drizzle migrations.
  - Option 2: Keep SQL migrations but freeze Drizzle migrations to schema sync only.
- If Option 1: generate initial Drizzle migration from existing schema and validate diff.
- Ensure the crawler’s `promise_review_queue` migration is included.

**E. Cutover Checklist**
- All app queries route through Drizzle.
- Remove direct `getDb()` usage where possible.
- Run tests against a clean database.
- Validate row counts and sample data parity.

**F. Suggested Migration Sequence (File-by-File)**
1) Add `drizzle.config.ts` and `lib/db/client.ts` (Drizzle client).
2) Define schema for core tables:
   - `politicians`, `promises`, `evidence`
3) Convert read-only endpoints first:
   - `/api/counties` GET
   - `/api/politicians` GET
4) Convert list pages:
   - `app/page.tsx` (dashboard)
   - `app/promises/page.tsx`
5) Convert write endpoints:
   - `/api/promises` POST
   - `/api/politicians` POST
6) Convert admin review flow:
   - `/admin/review` queries
   - `/api/review-queue/*` approve/reject
7) Add remaining schema tables:
   - `status_history`, `milestones`, `counties`, `local_authorities`, `electoral_areas`, `promise_review_queue`
8) Remove or deprecate `lib/db.ts` usage in the app (keep for scripts if needed).

**G. Example Files (Templates)**

`drizzle.config.ts`:
```ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema',
  out: './db/drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

`lib/db/client.ts`:
```ts
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const db = drizzle(pool)
```

`lib/db/schema/promises.ts` (example):
```ts
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
```

**H. Schema Templates (Full Set)**

`lib/db/schema/politicians.ts`:
```ts
import { pgTable, serial, varchar, boolean, timestamp, integer, date } from 'drizzle-orm/pg-core'

export const politicians = pgTable('politicians', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  party: varchar('party', { length: 100 }),
  constituency: varchar('constituency', { length: 100 }),
  role: varchar('role', { length: 100 }),
  active: boolean('active').default(true),
  countyId: integer('county_id'),
  localAuthorityId: integer('local_authority_id'),
  electoralAreaId: integer('electoral_area_id'),
  positionType: varchar('position_type', { length: 50 }),
  termStart: date('term_start'),
  termEnd: date('term_end'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

`lib/db/schema/evidence.ts`:
```ts
import { pgTable, serial, integer, varchar, text, date, timestamp } from 'drizzle-orm/pg-core'

export const evidence = pgTable('evidence', {
  id: serial('id').primaryKey(),
  promiseId: integer('promise_id'),
  sourceType: varchar('source_type', { length: 50 }),
  sourceUrl: text('source_url'),
  title: text('title'),
  description: text('description'),
  publishedDate: date('published_date'),
  createdAt: timestamp('created_at').defaultNow(),
})
```

`lib/db/schema/status_history.ts`:
```ts
import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const statusHistory = pgTable('status_history', {
  id: serial('id').primaryKey(),
  promiseId: integer('promise_id'),
  status: varchar('status', { length: 50 }).notNull(),
  score: integer('score'),
  rationale: text('rationale'),
  evidenceIds: integer('evidence_ids').array(),
  changedBy: varchar('changed_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
})
```

`lib/db/schema/milestones.ts`:
```ts
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
```

`lib/db/schema/counties.ts`:
```ts
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

export const counties = pgTable('counties', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  province: varchar('province', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
})
```

`lib/db/schema/local_authorities.ts`:
```ts
import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core'

export const localAuthorities = pgTable('local_authorities', {
  id: serial('id').primaryKey(),
  countyId: integer('county_id'),
  name: varchar('name', { length: 150 }).notNull(),
  authorityType: varchar('authority_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
})
```

`lib/db/schema/electoral_areas.ts`:
```ts
import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core'

export const electoralAreas = pgTable('electoral_areas', {
  id: serial('id').primaryKey(),
  localAuthorityId: integer('local_authority_id'),
  name: varchar('name', { length: 150 }).notNull(),
  areaType: varchar('area_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
})
```

`lib/db/schema/promise_review_queue.ts`:
```ts
import { pgTable, serial, varchar, jsonb, timestamp, text } from 'drizzle-orm/pg-core'

export const promiseReviewQueue = pgTable('promise_review_queue', {
  id: serial('id').primaryKey(),
  extractedPromise: jsonb('extracted_promise').notNull(),
  politicianMatch: jsonb('politician_match'),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: varchar('reviewed_by', { length: 100 }),
  rejectionReason: text('rejection_reason'),
})
```

**I. Relations (Recommended)**

`lib/db/schema/relations.ts`:
```ts
import { relations } from 'drizzle-orm'
import { politicians } from './politicians'
import { promises } from './promises'
import { evidence } from './evidence'
import { statusHistory } from './status_history'
import { milestones } from './milestones'
import { counties } from './counties'
import { localAuthorities } from './local_authorities'
import { electoralAreas } from './electoral_areas'

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
```

**C. Performance**
- Ensure all list endpoints support pagination:
  - `/api/promises`
  - `/admin/review`
- Dashboard uses aggregate queries (no full table scans).

**D. UX**
- `/promises` uses server-side filters and pagination.
- `/admin/review` includes search, status tabs, and pagination.

### 3.2 Crawler

**A. Extraction**
- Standardize LLM output schema in `crawler/src/types/index.ts`.
- If available, include `source_published_date`.

**B. Review Queue**
- Insert into `promise_review_queue` with full provenance.
- Handle `politician_match = null` cleanly.

**C. Matching**
- Improve fuzzy matching thresholds (documented in matcher).
- Add metrics: number of unmatched, low confidence.

### 3.3 Data Pipeline

**A. Cleaning**
- Automate:
  - `scripts/clean_data.py`
  - `scripts/calculate_motion_totals.py`

**B. Validation**
- Update `scripts/validate-data.ts` to include:
  - unmapped name variants
  - consistency between cleaned data and summaries

### 3.4 Database

**A. Schema source of truth**
- Migrations are canonical.
- Update/remove `db/schema.sql` if it diverges.

**B. Indexes**
Add:
- Promises search index (trigram or full-text):
  - `promises.title`, `promises.description`
- Review queue JSONB search:
  - GIN on `promise_review_queue.extracted_promise`

### 3.5 Ops / CI

**A. CI**
- Run `npm run test:api` and `npm run test:all`.
- Crawler integration test job (smoke run on sample source).

**B. Monitoring**
- Add logging for crawler failures and admin actions.
- Optional: Sentry for web app and crawler.

## 4) Implementation Checklist

### Web App
- [ ] Add admin allowlist helper (`lib/auth/admin.ts`)
- [ ] Enforce allowlist in pages and review APIs
- [ ] Add Zod validation to all POST endpoints
- [ ] Centralize SQL in `lib/db/queries.ts`
- [ ] Ensure list endpoints are paginated
- [ ] Add filter chips and pagination to promises UI
- [ ] Ensure admin review dashboard is complete

### Drizzle Migration
- [ ] Add Drizzle dependencies and `drizzle.config.ts`
- [ ] Define schema in `lib/db/schema/`
- [ ] Add Drizzle client in `lib/db/client.ts`
- [ ] Migrate all SQL queries to Drizzle
- [ ] Decide and implement migration strategy (Drizzle vs existing SQL)
- [ ] Remove or deprecate `lib/db.ts` usage in app
- [ ] Run test suite against clean DB

### Crawler
- [ ] Confirm schema matches review queue
- [ ] Add published date support if available
- [ ] Add metrics logging

### Data Pipeline
- [ ] Script automation for cleaning
- [ ] Validate unmapped variants

### Database
- [ ] Ensure schema consistency
- [ ] Add indexing migrations

### Ops
- [ ] CI pipeline with tests
- [ ] Deploy checklist

## 5) Acceptance Tests

### Security
- Non-admin signed-in user cannot approve/reject reviews via API.
- Non-admin cannot access `/admin/review`.

### Web App
- `/promises` filters return correct results.
- Pagination works (page links, total counts).

### Review Flow
- Approve inserts into `promises` and `evidence`.
- Reject stores reason and status.

### Crawler
- Crawler writes into `promise_review_queue`.
- Items show in `/admin/review`.

### Data Pipeline
- Cleaned data has no unmapped name variants.
- Motion totals align with summary CSVs.

### Ops
- CI passes before deploy.
- Monitoring catches crawler failures.
- Backups restore within SLA.
