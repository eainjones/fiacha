# Claude Code Guidelines for Fiacha

## Database Safety Rules

### CRITICAL: Staging First, Always
1. **Default environment is STAGING** - Never touch production without explicit user approval
2. **Supabase CLI is linked to staging** (`phifyhudywiuqgwezumh`)
3. **Production project ref**: `hgjefllkbbwevpyiazhx` - requires explicit `--project-ref` flag

### Before Any Migration
1. **Always backup first**: `./scripts/backup-db.sh staging`
2. **Use safe-db-push**: `./scripts/safe-db-push.sh staging` (includes backup + confirmation)
3. **Never use DELETE FROM** in migrations - use `INSERT ... ON CONFLICT DO UPDATE` (upserts)
4. **Verify on staging** before asking user to approve production push

### Migration Best Practices
- Migrations must be **additive** (add columns, don't drop)
- Use `ON CONFLICT DO UPDATE` instead of delete-then-insert
- Include `IF NOT EXISTS` for DDL statements
- Test with `supabase db push --linked` (staging) first

## Environment Configuration

| Environment | Supabase Project | Database Host |
|-------------|------------------|---------------|
| Staging | `phifyhudywiuqgwezumh` | `aws-1-eu-west-1.pooler.supabase.com` |
| Production | `hgjefllkbbwevpyiazhx` | `db.hgjefllkbbwevpyiazhx.supabase.co` |

### Vercel Environments
- **Production**: Points to production DB, deploys from `main` branch
- **Preview**: Points to staging DB, deploys from PRs/branches

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `./scripts/backup-db.sh [staging\|production]` | Create database backup |
| `./scripts/safe-db-push.sh [staging\|production]` | Safe migration with backup |
| `./scripts/verify-staging-data.ts` | Verify politician counts in staging |
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
2. [ ] Backup staging: `./scripts/backup-db.sh staging`
3. [ ] Push to staging: `supabase db push --linked`
4. [ ] Verify: `npx tsx scripts/verify-staging-data.ts`
5. [ ] Deploy Vercel preview, test in browser
6. [ ] Get user approval for production
7. [ ] Backup production: `./scripts/backup-db.sh production`
8. [ ] Push to production: `supabase db push --project-ref hgjefllkbbwevpyiazhx`
