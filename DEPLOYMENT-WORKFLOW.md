# Deployment Workflow

## Overview

This project uses a fully automated CI/CD pipeline powered by GitHub Actions. All deployments and database migrations are handled automatically based on the branch you push to. Manual deployment steps have been eliminated to ensure stability.

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
        │  (GitHub Actions)      │  (GitHub Actions)
        ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ 1. Install Deps  │  │ 1. Install Deps  │
│ 2. Migrate DB    │  │ 2. Migrate DB    │
│ 3. Build Project │  │ 3. Build Project │
│ 4. Deploy        │  │ 4. Deploy        │
└──────────────────┘  └──────────────────┘
        │                      │
        ▼                      ▼
┌──────────────┐      ┌──────────────┐
│  Production  │      │   Staging    │
│  (Vercel)    │      │  (Vercel)    │
└──────────────┘      └──────────────┘
```

1.  **Push to `main`**: Triggers a **Production** deployment.
    - Runs database migrations against the production database.
    - Deploys the application to Vercel production.
2.  **Push to `staging`**: Triggers a **Staging** deployment.
    - Runs database migrations against the staging database.
    - Deploys the application to Vercel preview (staging).

## Configuration

The entire CI/CD process is defined in a single file: `.github/workflows/ci-cd.yml`.

### Environment Variables & Secrets

All secrets (API keys, database passwords) and environment-specific variables are stored in GitHub repository secrets. They are securely injected into the pipeline at runtime.

**Action Required:** The following secrets must be configured in your GitHub repository settings under `Settings > Secrets and variables > Actions`:

*   `SUPABASE_ACCESS_TOKEN`: Your Supabase personal access token.
*   `STAGING_PROJECT_ID`: Your staging Supabase project ID.
*   `PROD_PROJECT_ID`: Your production Supabase project ID.
*   `STAGING_DB_PASSWORD`: Your staging Supabase database password.
*   `PROD_DB_PASSWORD`: Your production Supabase database password.
*   `VERCEL_TOKEN`: Your Vercel access token.
*   `VERCEL_ORG_ID`: Your Vercel organization ID.
*   `VERCEL_PROJECT_ID`: Your Vercel project ID.

There are no other configuration files or manual steps required.