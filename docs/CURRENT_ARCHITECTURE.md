# Fiacha Current Architecture (March 2026)

This document captures the application as it exists today in code, including active routes, data flow, and crawler integration.

## 1) Product Shape

Fiacha is a Next.js + Supabase application for tracking Irish political promises and accountability.

- Public-facing dashboard and browse pages for promises, politicians, parties, and counties.
- Authenticated data entry for adding politicians/promises.
- Admin-only review workflows for AI-extracted promises.
- External crawler pipeline that extracts candidate promises and queues them for human review.

## 2) Core Stack

- Frontend/App: Next.js App Router (`app/`), React, Tailwind.
- Database access:
  - Direct Postgres pool via `getSystemDb()` in `lib/db.ts` (bypasses RLS; used heavily in API routes/system flows).
  - Drizzle ORM typed client in `lib/db/client.ts` and query layer in `lib/db/queries.ts`.
- Auth: Supabase Auth (`lib/supabase.ts`, `lib/supabase-server.ts`).
- Crawler: TypeScript service under `crawler/` using Firecrawl + LLM extractors (Claude/OpenAI/Mastra paths).

## 3) High-Level Runtime Flows

### A) Read UI flow (dashboard/browse)

1. Server components (for example `app/page.tsx`) call `lib/db/queries.ts`.
2. Query layer uses Drizzle joins across promises/politicians/parties/counties.
3. Rendered pages include:
   - `/` dashboard
   - `/promises` and `/promises/[id]`
   - `/politicians`
   - `/parties` and `/parties/[slug]`
   - `/counties`

### B) Manual data entry flow

1. User signs in (`/auth/sign-in`).
2. `/add` calls API routes:
   - `POST /api/politicians`
   - `POST /api/promises`
3. API validates with Zod schemas and writes through direct SQL via `getSystemDb()`.

### C) AI extraction + moderation flow

1. Crawler ingests source content, extracts promises, matches politicians.
2. Candidate promises are persisted for review.
3. Admin review pages show pending items and allow approve/reject.
4. Approval creates records in `promises` (+ related `evidence`), rejection records reviewer metadata/reason.

## 4) API Surface (Active)

- Core data:
  - `GET/POST /api/politicians`
  - `GET/POST /api/promises`
  - `GET /api/counties`
  - `GET /api/local-authorities`
- Moderation:
  - `POST /api/submissions/[id]/approve`
  - `POST /api/submissions/[id]/reject`
  - `POST /api/review-queue/[id]/approve`
  - `POST /api/review-queue/[id]/reject`
- Infra/ops:
  - `GET /api/healthz`
  - `GET/POST /api/cron/run-crawler`
- Auth callback:
  - `/auth/callback`

## 5) Data Model (Primary Tables in Use)

From `lib/db/schema/*` and migrations:

- Political entities: `politicians`, `parties`, `counties`, `local_authorities`, `electoral_areas`.
- Tracking core: `promises`, `evidence`, `milestones`, `status_history`.
- AI/admin review:
  - `promise_submissions` (newer typed pipeline with status `pending_review/approved/rejected`).
  - `promise_review_queue` (legacy JSONB queue with status `pending/approved/rejected`).
- AI usage/budget (migration-driven): `ai_budget`, `ai_usage_log`, plus related AI support tables.

## 6) Crawler Architecture

Main orchestrator: `crawler/src/index.ts`.

Pipeline stages:

1. Load enabled sources from `crawler/src/crawlers/source-registry.ts`.
2. Crawl via Firecrawl wrapper (`crawler/src/crawlers/firecrawl-client.ts`).
3. Extract promises via provider abstraction (`crawler/src/extractors/*`).
4. Match politicians (`crawler/src/validators/politician-matcher.ts`).
5. Queue for review through crawler DB query helpers.
6. Emit metrics and optional email summary.

The scheduled endpoint `/api/cron/run-crawler` currently acts as a secure status/budget check + cron entrypoint and does not run full heavy crawl logic inline in serverless.

## 7) Auth and Authorization

- Session/auth checks use Supabase server client in server routes/pages.
- Admin authorization is centralized in `lib/auth/admin.ts` with `ADMIN_EMAIL_ALLOWLIST`.
- Admin routes fail closed when allowlist is missing.

## 8) Notable Current-State Nuance

There are currently two parallel moderation paths:

1. **Submissions path (newer)**  
   UI: `/review-queue`  
   APIs: `/api/submissions/*`  
   Table: `promise_submissions`

2. **Review-queue path (older/legacy)**  
   UI: `/admin/review`  
   APIs: `/api/review-queue/*`  
   Table: `promise_review_queue`

Both end in creating approved records in `promises` and related `evidence`, but they differ in payload model and status naming.

## 9) Deployment and Scheduling

- Active branch workflow: development on `staging`, production from `main` (see `CLAUDE.md`).
- Vercel cron configured in `vercel.json`:
  - `0 6 * * *` -> `/api/cron/run-crawler`

## 10) Where To Extend Safely

- New read features: prefer `lib/db/queries.ts` + Drizzle query layer.
- New user-facing writes: keep validation in `lib/validations` and auth checks in route handlers.
- Crawler enhancements: add source adapters/extractor logic under `crawler/src/*`; keep moderation handoff schema-consistent.
- If unifying moderation, choose one queue table and migrate UI/API callers together to avoid split-brain review state.
