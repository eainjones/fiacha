# Fly.io Deployment Setup Summary

## What Was Created

The Fiacha application is now ready for deployment to Fly.io with separate staging and production environments.

### 1. Configuration Files

#### Dockerfile (`Dockerfile`)
- ✅ Multi-stage build for optimized image size
- ✅ Node.js 20 Alpine base
- ✅ Standalone Next.js build
- ✅ Database migrations and scripts included
- ✅ Non-root user (nextjs) for security
- ✅ Port 3000 exposed

#### Fly.io Staging Config (`fly.staging.toml`)
- **App Name**: `fiacha-staging`
- **Region**: London (lhr)
- **Memory**: 512 MB
- **CPU**: Shared, 1 CPU
- **Auto-scaling**: Yes (scales to 0 when idle)
- **Health Check**: `/api/politicians` endpoint
- **Environment**:
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_API_URL=https://fiacha-staging.fly.dev`

#### Fly.io Production Config (`fly.production.toml`)
- **App Name**: `fiacha-production`
- **Region**: London (lhr)
- **Memory**: 1024 MB (1 GB)
- **CPU**: Shared, 1 CPU
- **Min Machines**: 1 (always running)
- **Health Check**: `/api/politicians` endpoint
- **Environment**:
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_API_URL=https://fiacha-production.fly.dev`

### 2. Deployment Scripts

#### Staging Deployment (`scripts/deploy-staging.sh`)
```bash
npm run deploy:staging
```
- Runs full test suite (`npm run test:all`)
- Deploys to Fly.io staging
- Shows next steps for migrations
- **No confirmation required** (staging environment)

#### Production Deployment (`scripts/deploy-production.sh`)
```bash
npm run deploy:production
```
- **Requires confirmation** (production safety)
- Runs full test suite
- Deploys to Fly.io production
- Shows verification steps

#### Migration Script (`scripts/apply-migrations-fly.sh`)
```bash
./scripts/apply-migrations-fly.sh fiacha-staging
./scripts/apply-migrations-fly.sh fiacha-production
```
- Applies all database migrations in order
- Works with Fly.io SSH console
- Validates each migration before proceeding

### 3. Documentation

#### Full Deployment Guide (`DEPLOYMENT.md`)
Comprehensive guide covering:
- Prerequisites and setup
- Creating apps and databases
- Deployment process
- Migration application
- Verification steps
- Scaling configuration
- Monitoring and logging
- Troubleshooting
- CI/CD integration examples
- Cost estimation

#### Quick Start Guide (`DEPLOY-QUICKSTART.md`)
Condensed guide with just the essential commands:
- Step-by-step deployment
- Copy-paste commands
- Common troubleshooting
- Quick reference

#### Environment Variables (`.env.example`)
- Updated with Fly.io-specific documentation
- Shows staging and production URLs
- Database connection examples

### 4. Package.json Scripts

Added convenience scripts:
```json
{
  "deploy:staging": "./scripts/deploy-staging.sh",
  "deploy:production": "./scripts/deploy-production.sh"
}
```

## Architecture

### Staging Environment
```
┌─────────────────────────────────────┐
│   fiacha-staging.fly.dev           │
│   ├─ Next.js App (512MB)           │
│   └─ Auto-scales to 0 when idle    │
└─────────────────────────────────────┘
              │
              ├─ DATABASE_URL
              ▼
┌─────────────────────────────────────┐
│   fiacha-staging-db                │
│   ├─ Postgres (1GB storage)        │
│   └─ Shared CPU                     │
└─────────────────────────────────────┘
```

### Production Environment
```
┌─────────────────────────────────────┐
│   fiacha-production.fly.dev        │
│   ├─ Next.js App (1GB)             │
│   └─ Min 1 machine always running  │
└─────────────────────────────────────┘
              │
              ├─ DATABASE_URL
              ▼
┌─────────────────────────────────────┐
│   fiacha-production-db             │
│   ├─ Postgres (3GB storage)        │
│   └─ Shared CPU                     │
└─────────────────────────────────────┘
```

## Deployment Workflow

### First-Time Setup
1. Install Fly CLI
2. Login to Fly.io
3. Create staging app + database
4. Create production app + database
5. Deploy to staging
6. Apply migrations to staging
7. Verify staging
8. Deploy to production
9. Apply migrations to production
10. Verify production

### Regular Deployments
1. Make code changes
2. Test locally (`npm run test:all`)
3. Deploy to staging (`npm run deploy:staging`)
4. Verify staging works
5. Deploy to production (`npm run deploy:production`)
6. Verify production works

### Database Migrations
- New migrations go in `db/migrations/`
- Apply to staging first
- Test thoroughly
- Apply to production
- Keep migrations numbered sequentially

## Security Features

✅ **Non-root User**: App runs as `nextjs` user (UID 1001)
✅ **HTTPS Only**: Force HTTPS enabled in Fly.io config
✅ **Health Checks**: Automatic restart on failed health checks
✅ **Environment Isolation**: Separate staging and production environments
✅ **Database Isolation**: Separate databases for staging and production
✅ **Secrets Management**: Database URLs stored as Fly.io secrets

## Cost Estimation

### Staging (~$0-5/month)
- **App**: $0 (scales to 0 when idle)
- **Database**: $0-5 (1GB storage, minimal usage)
- **Total**: ~$0-5/month

### Production (~$15-20/month)
- **App**: $5-10 (always on, 1GB RAM)
- **Database**: $10 (3GB storage)
- **Total**: ~$15-20/month

*Based on Fly.io pricing as of January 2025*

## Health Monitoring

Both environments include automatic health checks:
- **Endpoint**: `/api/politicians`
- **Interval**: Every 30 seconds
- **Timeout**: 5 seconds
- **Grace Period**: 10 seconds (after deployment)

Failed health checks trigger automatic restarts.

## Next Steps

### Before First Deployment
- [ ] Install Fly CLI
- [ ] Login to Fly.io account
- [ ] Create staging app and database
- [ ] Create production app and database

### After Setup
- [ ] Deploy to staging
- [ ] Apply migrations to staging
- [ ] Test staging thoroughly
- [ ] Deploy to production
- [ ] Apply migrations to production
- [ ] Set up custom domain (optional)
- [ ] Configure CI/CD pipeline (optional)

## Support & Resources

- **Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start**: [DEPLOY-QUICKSTART.md](./DEPLOY-QUICKSTART.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **Fly.io Docs**: https://fly.io/docs
- **Fly.io Community**: https://community.fly.io

## Deployment Commands Cheat Sheet

```bash
# Deploy
npm run deploy:staging
npm run deploy:production

# Status
flyctl status -a fiacha-staging
flyctl status -a fiacha-production

# Logs
flyctl logs -a fiacha-staging
flyctl logs -a fiacha-production

# SSH
flyctl ssh console -a fiacha-staging
flyctl ssh console -a fiacha-production

# Database
flyctl postgres connect -a fiacha-staging-db
flyctl postgres connect -a fiacha-production-db

# Restart
flyctl apps restart fiacha-staging
flyctl apps restart fiacha-production

# Scale
flyctl scale memory 1024 -a fiacha-staging
flyctl scale count 2 -a fiacha-production
```

## URLs

Once deployed:
- **Staging**: https://fiacha-staging.fly.dev
- **Production**: https://fiacha-production.fly.dev
- **Staging DB**: `fiacha-staging-db`
- **Production DB**: `fiacha-production-db`
