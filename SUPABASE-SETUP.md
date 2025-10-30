# Supabase Setup Guide

This guide covers setting up Supabase as the database for Fiacha.

## Quick Start

1. **Install Supabase CLI** (if not already installed):
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Setup project**:
   ```bash
   npm run setup:supabase
   ```

4. **Run migrations**:
   ```bash
   npm run migrate:supabase
   ```

## Manual Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Configure:
   - **Name**: `fiacha` (or your preferred name)
   - **Database Password**: Save this password!
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

### Step 2: Get Connection String

1. In Supabase dashboard → **Settings** → **Database**
2. Under **Connection String**, copy the **URI** (not the Pooler URI)
3. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
4. Replace `[YOUR-PASSWORD]` with your actual password

### Step 3: Link Local Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in:
- Supabase dashboard URL: `https://supabase.com/dashboard/project/xxxxx`
- Or run `supabase projects list`

### Step 4: Apply Migrations

Migrations are located in `supabase/migrations/`:

```bash
# Push all migrations
supabase db push

# Or use the npm script
npm run migrate:supabase
```

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

Set in Vercel dashboard → Settings → Environment Variables:
- Add `DATABASE_URL` for Production, Preview, and Development environments

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

