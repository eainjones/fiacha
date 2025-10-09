# Deployment Guide - Fly.io

This guide covers deploying Fiacha to Fly.io with separate staging and production environments.

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
2. **Fly CLI**: Install the Fly CLI tool
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh

   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```
3. **Fly.io Authentication**:
   ```bash
   flyctl auth login
   ```

## Initial Setup

### 1. Create Staging App

```bash
# Create staging application
flyctl apps create fiacha-staging

# Create Postgres database for staging
flyctl postgres create --name fiacha-staging-db --region lhr --vm-size shared-cpu-1x --volume-size 1

# Attach database to app
flyctl postgres attach fiacha-staging-db --app fiacha-staging
```

This will automatically set the `DATABASE_URL` secret for your app.

### 2. Create Production App

```bash
# Create production application
flyctl apps create fiacha-production

# Create Postgres database for production
flyctl postgres create --name fiacha-production-db --region lhr --vm-size shared-cpu-1x --volume-size 3

# Attach database to app
flyctl postgres attach fiacha-production-db --app fiacha-production
```

### 3. Verify Database Connection

```bash
# Check staging database
flyctl postgres connect -a fiacha-staging-db

# Check production database
flyctl postgres connect -a fiacha-production-db
```

## Environment Configuration

### Region Selection

Both apps are configured to use `lhr` (London) region by default. To change:

Edit `fly.staging.toml` or `fly.production.toml`:
```toml
primary_region = "lhr"  # Options: lhr, iad, syd, etc.
```

See all regions: `flyctl platform regions`

### Environment Variables

The apps are configured with these environment variables in the `fly.*.toml` files:
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL` (automatically set based on app name)

The `DATABASE_URL` is automatically set when you attach the Postgres database.

## Deployment

### Deploy to Staging

```bash
# Option 1: Using npm script
npm run deploy:staging

# Option 2: Using script directly
./scripts/deploy-staging.sh

# Option 3: Manual deployment
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

The staging deployment script will:
1. ✅ Run all tests (`npm run test:all`)
2. 📦 Build and deploy the Docker image
3. 🚀 Deploy to Fly.io
4. 📝 Show next steps for migrations

### Deploy to Production

```bash
# Option 1: Using npm script
npm run deploy:production

# Option 2: Using script directly
./scripts/deploy-production.sh

# Option 3: Manual deployment
flyctl deploy --config fly.production.toml --app fiacha-production
```

The production deployment script will:
1. ⚠️  Ask for confirmation
2. ✅ Run all tests
3. 📦 Build and deploy
4. 🚀 Deploy to Fly.io

## Database Migrations

After deploying for the first time, apply database migrations (schema + seed data).

### Recommended: via helper scripts

```bash
# Apply to staging database instance
./scripts/apply-migrations-simple.sh fiacha-staging-db

# Apply through the running app container (uses DATABASE_URL)
./scripts/apply-migrations-fly.sh fiacha-staging

# Repeat for production when ready
./scripts/apply-migrations-simple.sh fiacha-production-db
./scripts/apply-migrations-fly.sh fiacha-production
```

Both scripts bundle `db/schema.sql` with the migration files so a fresh database is fully provisioned in one run.

### Manual option (psql console)

```bash
flyctl postgres connect -a fiacha-staging-db
-- Inside psql
\i db/schema.sql
\i db/migrations/001_add_geographical_hierarchy.sql
\i db/migrations/002_seed_local_authorities.sql
\i db/migrations/003_seed_real_politicians.sql
\i db/migrations/004_seed_real_promises.sql
\i db/migrations/005_seed_councillors.sql
\q
```

## Verification

### Check Application Status

```bash
# Staging
flyctl status -a fiacha-staging
flyctl checks list -a fiacha-staging

# Production
flyctl status -a fiacha-production
flyctl checks list -a fiacha-production
```

### View Logs

```bash
# Staging
flyctl logs -a fiacha-staging

# Production
flyctl logs -a fiacha-production
```

### Test API Endpoints

```bash
# Staging
curl https://fiacha-staging.fly.dev/api/healthz
curl https://fiacha-staging.fly.dev/api/politicians
curl https://fiacha-staging.fly.dev/api/counties
curl https://fiacha-staging.fly.dev/api/promises

# Production
curl https://fiacha-production.fly.dev/api/healthz
curl https://fiacha-production.fly.dev/api/politicians
curl https://fiacha-production.fly.dev/api/counties
curl https://fiacha-production.fly.dev/api/promises
```

### Access Database Console

```bash
# Staging
flyctl ssh console -a fiacha-staging
psql $DATABASE_URL

# Production
flyctl ssh console -a fiacha-production
psql $DATABASE_URL
```

## Configuration Files

### Staging (`fly.staging.toml`)
- **App Name**: `fiacha-staging`
- **Memory**: 512 MB
- **Min Machines**: 0 (auto-stop when idle)
- **Health Check**: `/api/healthz`

### Production (`fly.production.toml`)
- **App Name**: `fiacha-production`
- **Memory**: 1024 MB
- **Min Machines**: 1 (always running)
- **Health Check**: `/api/healthz`

## Scaling

### Manual Scaling

```bash
# Staging - increase memory
flyctl scale memory 1024 -a fiacha-staging

# Production - add more machines
flyctl scale count 2 -a fiacha-production

# Production - increase VM size
flyctl scale vm shared-cpu-2x -a fiacha-production
```

### Auto-scaling

Both environments are configured with auto-scaling:
- **Staging**: Auto-stop when idle, auto-start on request
- **Production**: Minimum 1 machine always running

## Monitoring

### View Metrics

```bash
# Staging
flyctl dashboard -a fiacha-staging

# Production
flyctl dashboard -a fiacha-production
```

### Health Checks

The apps are configured with health checks on `/api/healthz`:
- **Grace Period**: 10 seconds
- **Interval**: 30 seconds
- **Timeout**: 5 seconds

Failed health checks will trigger automatic restarts.

## Secrets Management

Keep staging and production in sync—at minimum both environments need:
- `DATABASE_URL` (set automatically when you attach Postgres)
- `NEXT_PUBLIC_API_URL` (load balancer URL for the environment)
- `NODE_ENV=production`

### Set Secrets

```bash
# Staging
flyctl secrets set SECRET_NAME=value -a fiacha-staging

# Production
flyctl secrets set SECRET_NAME=value -a fiacha-production
```

### List Secrets

```bash
flyctl secrets list -a fiacha-staging
flyctl secrets list -a fiacha-production
```

### Remove Secrets

```bash
flyctl secrets unset SECRET_NAME -a fiacha-staging
flyctl secrets unset SECRET_NAME -a fiacha-production
```

## Rollback

### Rollback to Previous Version

```bash
# List releases
flyctl releases -a fiacha-staging

# Rollback to specific version
flyctl releases rollback <version> -a fiacha-staging
```

## Troubleshooting

### Deployment Fails

```bash
# Check build logs
flyctl logs -a fiacha-staging

# SSH into the machine
flyctl ssh console -a fiacha-staging

# Check disk space
flyctl ssh console -a fiacha-staging -C "df -h"
```

### Database Connection Issues

```bash
# Verify DATABASE_URL is set
flyctl secrets list -a fiacha-staging

# Test database connection
flyctl ssh console -a fiacha-staging -C "psql \$DATABASE_URL -c 'SELECT 1'"

# Check database status
flyctl status -a fiacha-staging-db
```

### Application Won't Start

1. Check logs: `flyctl logs -a fiacha-staging`
2. Verify health check endpoint is responding
3. Check environment variables
4. Verify database migrations were applied

### Build Errors

```bash
# Test build locally
docker build -t fiacha-test .

# Run locally
docker run -p 3000:3000 -e DATABASE_URL=your_db_url fiacha-test
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:all
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Setup Fly.io
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Staging
        run: flyctl deploy --config fly.staging.toml --app fiacha-staging
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Cost Estimation

### Staging Environment
- **App**: ~$0/month (auto-stop when idle)
- **Database**: ~$0-5/month (1GB storage, shared CPU)
- **Total**: ~$0-5/month

### Production Environment
- **App**: ~$5-10/month (shared CPU, 1GB RAM, always on)
- **Database**: ~$10/month (3GB storage, shared CPU)
- **Total**: ~$15-20/month

*Costs are approximate and based on Fly.io's pricing as of January 2025.*

## URLs

Once deployed:
- **Staging**: https://fiacha-staging.fly.dev
- **Production**: https://fiacha-production.fly.dev

## Support

- **Fly.io Docs**: https://fly.io/docs
- **Fly.io Community**: https://community.fly.io
- **Fly.io Status**: https://status.fly.io
