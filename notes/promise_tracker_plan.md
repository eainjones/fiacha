# Politician Promise Tracker – Working Notes

## Vision
- Build an Irish political accountability platform that captures promises/commitments from media, social, parliamentary records, and campaign material.
- Combine manual entry, crowd-sourced submissions, and automated scraping/AI summarisation.
- Track each promise through structured lifecycle: capture, structure (topic, timeframe, metadata), status updates, scoring, and transparency of evidence.

## Core Features
- Promise catalogue with politician profiles, status timeline, and scoring rubric.
- Submission workflows: manual admin entry, moderated crowd submissions, automated ingestion reviewed by humans.
- Evidence logging with citations, audit trail, and public rationale for ratings.
- Search/filter by party, constituency, topic, and status; subscription/notification options.
- Public API/export for journalists and civic groups.

## Data & Scoring Model
- Relational schema linking politicians, promises, milestones, evidence sources, and status history.
- Transparent scoring (e.g., 0–100) factoring progress, timeliness, and confidence, including partial credit and uncontrollable constraints.
- Maintain provenance metadata and versioning for corrections.

## Platform Explorations

### Cloudflare-Centric Stack
- Cloudflare Pages for frontend (Next.js/Remix/SvelteKit) deployment.
- Cloudflare Workers for API endpoints, ingestion webhooks, lightweight moderation automation.
- D1 for structured promise data; Workers KV/Durable Objects for fast counters or per-promise state.
- R2 for raw artifacts (articles, media); Queues + Workers Cron for scraping and summarisation jobs.
- Zero Trust, Access, Turnstile, and rate limiting to secure admin tools and crowd submissions.
- Plan for migration to managed Postgres if analytics outgrow D1.

### Cloudflare Alternative (Supabase-Centric)
- Supabase for managed Postgres, auth, storage, and edge functions; deploy Next.js/SvelteKit via Supabase Hosting or compatible platform.
- Use row-level security for moderation roles and public read APIs; Supabase Functions/pg_cron handle scheduled jobs.
- External compute (Modal, Fly.io) for heavier AI/scraping tasks writing back into Supabase.

### Fly.io Option
- Deploy full-stack app (Next.js/Remix) and primary API on Fly Machines with built-in global routing.
- Managed Fly Postgres for promise data, optional Meilisearch for search, and separate Machines for scraping/AI jobs.
- Use object storage (Backblaze B2, R2, S3) for raw media; add observability (Sentry, Grafana) early.

## Ingestion & ETL Strategy
- Keep ingestion pipelines off the main platform on cheaper hardware or local machines (Mac Studio, GPU rigs).
- Containerise jobs for reproducibility; schedule via cron/Temporal/Airflow; maintain queue/task table for resilience.
- Secure connections with WireGuard/Zero Trust; batch updates into the primary database and shared object storage.
- Log shipping and monitoring (Prometheus exporters, Sentry CLI) to surface failures even when offline.
- Maintain local provenance store (git/SQLite) to replay or recover from sync issues.

## Next Steps
1. Define promise schema, scoring rubric, and moderation workflow with sample data.
2. Prototype a vertical slice: manual entry form, promise listing, moderator review UI.
3. Trial preferred platform (Cloudflare, Supabase, or Fly.io) with PoC deployment.
4. Containerise a scraping/AI job and run it from local hardware into staging data store.
5. Layer in security, observability, and documentation of methodology.
