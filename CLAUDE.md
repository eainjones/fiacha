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

## Database Safety Rules

### Environment Hierarchy: Local → Staging → Production
1. **Develop locally first** using `supabase start` (no risk to any remote data)
2. **Push to staging** for integration testing: `supabase db push --linked`
3. **Production** requires explicit user approval and `--project-ref` flag

### Remote Supabase References
| Environment | Supabase Project | Project Ref |
|-------------|------------------|-------------|
| Local | Local Docker | N/A |
| Staging | fiacha-staging | `qsknxvethxnapioxsuqr` |
| Production | Fiach | `hgjefllkbbwevpyiazhx` |

### Before Any Remote Migration
1. **Always backup first**: `./scripts/backup-db.sh staging`
2. **Use safe-db-push**: `./scripts/safe-db-push.sh staging` (includes backup + confirmation)
3. **Never use DELETE FROM** in migrations - use `INSERT ... ON CONFLICT DO UPDATE` (upserts)
4. **Verify on staging** before asking user to approve production push

### Migration Best Practices
- **Canonical migration directory**: `supabase/migrations/` (timestamped SQL files, used by Supabase CLI and CI/CD)
- **Legacy migrations**: `db/migrations-archive/` contains old manually-numbered files (001_-009_), kept for reference only
- **Do NOT use** `db/migrations/` -- it is empty and deprecated
- **Workflow**: Create a new migration with `supabase migration new <name>`, test locally with `supabase db reset`, then push
- Migrations must be **additive** (add columns, don't drop)
- Use `ON CONFLICT DO UPDATE` instead of delete-then-insert
- Include `IF NOT EXISTS` for DDL statements
- Test locally with `supabase db reset` first
- Then push to staging with `supabase db push --linked`

### Vercel Environments
- **Production**: Points to production DB, deploys from `main` branch
- **Preview**: Points to staging DB, deploys from PRs/branches

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run db:sync-staging` | Sync staging data from production |
| `./scripts/backup-db.sh [staging\|production]` | Create database backup |
| `./scripts/safe-db-push.sh [staging\|production]` | Safe migration with backup |
| `./scripts/verify-staging-data.ts` | Verify politician counts in staging |
| `./scripts/generate-politicians-migration.ts` | Generate safe upsert migration |

## Keeping Staging in Sync

### When to Sync
- After adding new data to production (promises, politicians, etc.)
- Before testing features that depend on production data
- After production database migrations

### How to Sync
```bash
npm run db:sync-staging
```

This copies all data from production → staging while preserving referential integrity.

### Staging Database Notes
- Staging uses Supabase connection pooler (IPv4) due to IPv6-only direct connection
- Pooler URL: `aws-1-eu-west-1.pooler.supabase.com` (note: aws-1, not aws-0)
- Username format for pooler: `postgres.qsknxvethxnapioxsuqr`

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
3. [ ] Backup staging: `./scripts/backup-db.sh staging`
4. [ ] Push to staging: `supabase db push --linked`
5. [ ] Verify: `npx tsx scripts/verify-staging-data.ts`
6. [ ] Deploy Vercel preview, test in browser
7. [ ] Get user approval for production
8. [ ] Backup production: `./scripts/backup-db.sh production`
9. [ ] Push to production: `supabase db push --project-ref hgjefllkbbwevpyiazhx`
