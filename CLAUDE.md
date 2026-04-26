# Claude Code Guidelines for Fiacha

## Local-First Development

### Quick Start
```bash
supabase start          # Start local Supabase (Postgres, Auth, Studio)
npm run dev             # Start Next.js dev server
# Open http://localhost:3000 (app) and http://localhost:54323 (Supabase Studio)
```

### Local Supabase Commands
| Command | Purpose |
|---------|---------|
| `npm run supabase:start` | Start local Supabase stack |
| `npm run supabase:stop` | Stop local Supabase stack |
| `npm run supabase:status` | Check local Supabase status |
| `npm run db:reset` | Reset local DB + run all migrations + seed |
| `npm run db:push:local` | Push migrations to local DB |
| `npm run types:update` | Generate TypeScript types from local DB |

### Local Environment
- `.env.local` points to local Supabase (localhost:54321/54322)
- SSL is automatically disabled for local connections
- Connection pooling is relaxed locally (5 connections vs 1 in serverless)

---

## Git & Deployment Rules

### CRITICAL: Never Push to Main Without Approval
1. **All work happens on the `staging` branch** - Never commit directly to `main`
2. **Push to `staging` branch** triggers Vercel Preview deployment (staging URL)
3. **Share the preview URL** with user and wait for explicit approval
4. **Only after user says "push to production"** → merge staging to main

### Deployment Workflow
```
1. Develop and test locally against local Supabase
2. git checkout staging
3. Make changes, commit to staging
4. git push origin staging
5. Share Vercel preview URL with user
6. WAIT for user approval
7. Only then: git checkout main && git merge staging && git push origin main
```

### Branch Structure
| Branch | Purpose | Vercel Environment |
|--------|---------|-------------------|
| `main` | Production only | Production (fiacha.vercel.app) |
| `staging` | All development work | Preview (auto-generated URL) |

---

## Database Architecture: Single-Project Supabase with Branching

Fiacha uses **one Supabase project** (`hgjefllkbbwevpyiazhx`) with **Supabase Branching**
to manage staging and production environments.

### How It Works
- The `main` git branch maps to the **production** database (the persistent project).
- The `staging` git branch (and any PR/feature branches) get **isolated database branches**
  with their own URL, anon key, and service role key.
- Supabase auto-applies migrations from `supabase/migrations/` when a branch is created.
- Seed data from `supabase/seed.sql` populates new branches automatically.
- The Supabase-Vercel integration injects the correct branch-specific env vars
  into each Vercel deployment (production or preview).

### Environment Hierarchy: Local → Branch → Production
1. **Develop locally first** using `supabase start` (no risk to any remote data)
2. **Push to staging/feature branch** — Supabase creates an isolated database branch
3. **Production** requires explicit user approval and merge to `main`

### Supabase References
| Environment | Source | Database |
|-------------|--------|----------|
| Local | `supabase start` (Docker) | Local Postgres |
| Staging | Supabase Branch (auto-created from `staging` git branch) | Isolated branch DB |
| Feature branches | Supabase Branch (auto-created per PR) | Isolated branch DB |
| Production | Main project `hgjefllkbbwevpyiazhx` | Persistent prod DB |

### Key Differences from Old Two-Project Setup
- No more `sync-staging-from-prod.ts` — branches inherit schema via migrations + seed
- No more hardcoded staging project refs or pooler URLs
- Vercel env vars are injected automatically via the Supabase integration (not manual `.env.*` files)
- Backup script targets production only (branches are disposable)

---

## Database Safety Rules

### Before Any Production Migration
1. **Always backup first**: `./scripts/backup-db.sh`
2. **Never use DELETE FROM** in migrations — use `INSERT ... ON CONFLICT DO UPDATE` (upserts)
3. **Verify on staging branch** before asking user to approve production push

### Migration Best Practices
- **Canonical migration directory**: `supabase/migrations/` (timestamped SQL files, used by Supabase CLI and CI/CD)
- **Legacy migrations**: `db/migrations-archive/` contains old manually-numbered files (001_–009_), kept for reference only
- **Do NOT use** `db/migrations/` — it is empty and deprecated
- **Workflow**: Create a new migration with `supabase migration new <name>`, test locally with `supabase db reset`, then push
- Migrations must be **additive** (add columns, don't drop)
- Use `ON CONFLICT DO UPDATE` instead of delete-then-insert
- Include `IF NOT EXISTS` for DDL statements
- Test locally with `supabase db reset` first

### Seed Data (`supabase/seed.sql`)
- Contains a minimal representative dataset (6 politicians, 6 promises, core parties/counties)
- Runs automatically on `supabase db reset` and when new Supabase branches are created
- Uses `ON CONFLICT DO NOTHING` so it's safe to re-run
- For testing with production-scale data, use `pg_dump` from prod → restore into branch

### Vercel Environments
- **Production**: Supabase-Vercel integration injects prod DB vars, deploys from `main`
- **Preview**: Supabase-Vercel integration injects branch DB vars, deploys from PRs/branches

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `./scripts/backup-db.sh` | Create production database backup |
| `./scripts/verify-staging-data.ts` | Verify politician counts in a database |
| `./scripts/generate-politicians-migration.ts` | Generate safe upsert migration |

## Data Verification

Expected counts (as of Jan 2025):
- **Total**: 1,737 politicians
- **TDs**: 174
- **Senators**: 60
- **Councillors**: 1,410 (949 ROI + 461 NI)
- **MLAs**: 93

Run verification: `npx tsx scripts/verify-staging-data.ts`

## Workflow Checklist

When modifying politician data:
1. [ ] Generate migration with upserts (no DELETEs)
2. [ ] Test locally: `supabase db reset` and verify in Studio
3. [ ] Push to staging branch, verify Vercel preview
4. [ ] Get user approval for production
5. [ ] Backup production: `./scripts/backup-db.sh`
6. [ ] Merge staging → main (triggers production deploy + migration)
