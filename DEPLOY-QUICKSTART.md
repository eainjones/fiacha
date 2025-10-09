# Fly.io Deployment - Quick Start

This is a condensed guide showing the exact commands to deploy Fiacha to Fly.io.

## Prerequisites

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
flyctl auth login
```

## Step 1: Create Staging Environment

```bash
# Create app
flyctl apps create fiacha-staging

# Create database (will ask for confirmation - press 'y')
flyctl postgres create --name fiacha-staging-db --region lhr --vm-size shared-cpu-1x --volume-size 1

# Attach database (wait for database creation to complete first)
flyctl postgres attach fiacha-staging-db --app fiacha-staging
```

**Note**: The database creation command will show a warning about unmanaged Postgres and ask for confirmation. This is normal - press `y` to continue.

## Step 2: Create Production Environment

```bash
# Create app
flyctl apps create fiacha-production

# Create and attach database
flyctl postgres create --name fiacha-production-db --region lhr --vm-size shared-cpu-1x --volume-size 3
flyctl postgres attach fiacha-production-db --app fiacha-production
```

## Step 3: Deploy to Staging

```bash
# Deploy
npm run deploy:staging

# Or manually:
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

## Step 4: Apply Database Migrations (Staging)

```bash
# Connect to database
flyctl postgres connect -a fiacha-staging-db

# Run migrations (paste each line in psql)
\i db/migrations/001_add_geographical_hierarchy.sql
\i db/migrations/002_seed_local_authorities.sql
\i db/migrations/003_seed_real_politicians.sql
\i db/migrations/004_seed_real_promises.sql
\i db/migrations/005_seed_councillors.sql
\q
```

## Step 5: Verify Staging

```bash
# Check status
flyctl status -a fiacha-staging

# Test API
curl https://fiacha-staging.fly.dev/api/politicians

# View in browser
open https://fiacha-staging.fly.dev
```

## Step 6: Deploy to Production

```bash
# Deploy (will ask for confirmation)
npm run deploy:production

# Or manually:
flyctl deploy --config fly.production.toml --app fiacha-production
```

## Step 7: Apply Database Migrations (Production)

```bash
# Connect to database
flyctl postgres connect -a fiacha-production-db

# Run migrations (paste each line in psql)
\i db/migrations/001_add_geographical_hierarchy.sql
\i db/migrations/002_seed_local_authorities.sql
\i db/migrations/003_seed_real_politicians.sql
\i db/migrations/004_seed_real_promises.sql
\i db/migrations/005_seed_councillors.sql
\q
```

## Step 8: Verify Production

```bash
# Check status
flyctl status -a fiacha-production

# Test API
curl https://fiacha-production.fly.dev/api/politicians

# View in browser
open https://fiacha-production.fly.dev
```

## Common Commands

```bash
# View logs
flyctl logs -a fiacha-staging
flyctl logs -a fiacha-production

# SSH into machine
flyctl ssh console -a fiacha-staging
flyctl ssh console -a fiacha-production

# Check health
flyctl checks list -a fiacha-staging
flyctl checks list -a fiacha-production

# Restart app
flyctl apps restart fiacha-staging
flyctl apps restart fiacha-production

# Scale memory
flyctl scale memory 1024 -a fiacha-staging

# View dashboard
flyctl dashboard -a fiacha-staging
```

## URLs

- **Staging**: https://fiacha-staging.fly.dev
- **Production**: https://fiacha-production.fly.dev

## Troubleshooting

### If deployment fails:
```bash
# Check logs
flyctl logs -a fiacha-staging

# Try building locally first
docker build -t fiacha-test .
```

### If migrations fail:
```bash
# Connect to database directly
flyctl ssh console -a fiacha-staging -C "psql \$DATABASE_URL"

# Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### If app won't start:
```bash
# Check health checks
flyctl checks list -a fiacha-staging

# SSH and check logs
flyctl ssh console -a fiacha-staging
cat /var/log/system.log
```

## Next Steps

After successful deployment:
1. ✅ Set up custom domain (optional)
2. ✅ Configure SSL certificates
3. ✅ Set up monitoring/alerts
4. ✅ Configure CI/CD pipeline

See full documentation in [DEPLOYMENT.md](./DEPLOYMENT.md)
