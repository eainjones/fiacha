# Deployment Workflow

## Overview

This project uses Vercel for deployments and Supabase Branching for database environments. A single Supabase project (`hgjefllkbbwevpyiazhx`) serves both production and preview/staging environments via isolated database branches.

## How It Works

```
┌─────────────────────────────────────────┐
│          GitHub Repository              │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   ┌─────────┐            ┌──────────┐
   │  main   │            │ staging  │
   └────┬────┘            └────┬─────┘
        │                      │
        ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ Supabase: prod   │  │ Supabase: branch │
│ (persistent DB)  │  │ (isolated DB)    │
└──────────────────┘  └──────────────────┘
        │                      │
        ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ Vercel: prod     │  │ Vercel: preview  │
│ fiacha.vercel.app│  │ (auto-gen URL)   │
└──────────────────┘  └──────────────────┘
```

1. **Push to `main`**: Triggers a production Vercel deployment against the persistent production database.
2. **Push to `staging` (or any branch)**: Supabase auto-creates an isolated database branch; Vercel deploys a preview with branch-specific env vars injected by the Supabase-Vercel integration.

## Database Branching

- Supabase Branching applies `supabase/migrations/` automatically to each new database branch.
- `supabase/seed.sql` populates new branches with minimal test data.
- Branches are disposable — deleted when the git branch is merged/closed.
- The `staging` branch can optionally be kept as a long-lived persistent branch.

## Configuration

### GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `SUPABASE_ACCESS_TOKEN` | Supabase personal access token |
| `PROD_PROJECT_ID` | Production Supabase project ID (`hgjefllkbbwevpyiazhx`) |
| `PROD_DB_PASSWORD` | Production database password |
| `VERCEL_TOKEN` | Vercel access token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

### Supabase-Vercel Integration

The Supabase-Vercel integration automatically injects the correct environment variables (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) into each Vercel deployment based on the branch. No manual `.env.*` files are needed for remote environments.
