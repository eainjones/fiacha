# Supabase Setup Guide

Fiacha uses a **single Supabase project** with **Branching** for environment isolation.
Production lives on the main branch; staging and feature branches get their own
isolated databases automatically.

| Environment | Supabase | Source |
|-------------|----------|--------|
| Local | Docker (`supabase start`) | N/A |
| Staging / PRs | Auto-created branch DB | `staging` / feature git branch |
| Production | Persistent project `hgjefllkbbwevpyiazhx` | `main` git branch |

## Quick Start

1. **Install Supabase CLI**:
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Login and link**:
   ```bash
   supabase login
   ./scripts/setup-supabase.sh
   ```

3. **Local development**:
   ```bash
   supabase start     # starts Postgres, Auth, Studio
   npm run dev        # starts Next.js
   ```

## Enabling Branching (one-time)

1. In Supabase Dashboard → Project (`hgjefllkbbwevpyiazhx`) → Settings → Branching
2. Connect to GitHub repo `eainjones/fiacha`
3. Set production branch to `main`
4. Install the Supabase-Vercel integration so preview deployments
   get branch-specific env vars automatically

## Local Development

### Start Local Supabase

```bash
supabase start
```

This starts:
- PostgreSQL database on port `54322`
- Supabase Studio on `http://localhost:54323`
- API Gateway on `http://localhost:54321`

### Get Local Connection String

```bash
supabase status
```

The local connection string will be:
```
postgresql://postgres:postgres@localhost:54322/postgres
```

### Set Environment Variable

Create `.env.local`:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### Stop Local Supabase

```bash
supabase stop
```

## Migration Files

Supabase migrations are timestamped and located in `supabase/migrations/`:

1. `20250101000000_initial_schema.sql` - Core tables (politicians, promises, evidence, etc.)
2. `20250101000001_geographical_hierarchy.sql` - Counties, local authorities, electoral areas
3. `20250101000002_seed_local_authorities.sql` - Seed 31 local authorities
4. `20250101000003_seed_real_politicians.sql` - Seed initial politicians (TDs)
5. `20250101000004_seed_real_promises.sql` - Seed initial promises
6. `20250101000005_seed_councillors.sql` - Seed councillors
7. `20250101000006_seed_remaining_tds.sql` - Seed remaining TDs
8. `20250101000007_seed_wexford_councillors.sql` - Seed Wexford councillors
9. `20250101000008_add_missing_tds_and_fix_party.sql` - Fix missing TDs

## Database Schema

The database includes:

- **politicians** - TDs, Councillors, Ministers
- **promises** - Political promises and commitments
- **evidence** - Sources and evidence for promises
- **status_history** - Tracking promise status changes
- **milestones** - Key milestones for promises
- **counties** - 26 counties of Ireland
- **local_authorities** - 31 local authorities
- **electoral_areas** - Electoral areas within authorities

## Managing Migrations

### Create New Migration

```bash
supabase migration new migration_name
```

This creates a new timestamped file in `supabase/migrations/`.

### Apply Migrations

**To remote (production/staging)**:
```bash
supabase db push
```

**To local**:
```bash
supabase db reset  # Resets and applies all migrations
```

### Check Migration Status

```bash
supabase migration list
```

## Connection Pooling

Supabase provides connection pooling for better performance. Use the **Transaction** pooler for server-side connections:

```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
```

Note the port change from `5432` to `6543` and the `pgbouncer=true` parameter.

## Environment Variables

### Required

- `DATABASE_URL` - Full PostgreSQL connection string

### For Vercel

With the Supabase-Vercel integration enabled, `DATABASE_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
injected automatically per deployment. No manual env var setup is needed.

### For Local Development

Create `.env.local`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

## Troubleshooting

### Connection Issues

- **Check password**: Ensure your password is correct
- **Check project status**: Verify project is active in Supabase dashboard
- **Check firewall**: Supabase allows all connections by default
- **Try connection pooling URL**: Use port `6543` with `pgbouncer=true`

### Migration Issues

- **Check SQL syntax**: Test migrations locally first
- **Check migration order**: Migrations run in filename order
- **Reset local database**: `supabase db reset`

### Local Supabase Issues

- **Port conflicts**: Ensure ports 54321-54323 are available
- **Docker issues**: Supabase uses Docker, ensure Docker is running
- **Restart services**: `supabase stop && supabase start`

## Useful Commands

```bash
# Login
supabase login

# Link project
supabase link --project-ref PROJECT_REF

# Start local
supabase start

# Stop local
supabase stop

# Status
supabase status

# Push migrations
supabase db push

# Reset local DB
supabase db reset

# Create migration
supabase migration new name

# List migrations
supabase migration list

# Open Studio
supabase studio
```

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

