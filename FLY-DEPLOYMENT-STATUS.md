# Fly.io Deployment Status

**Last Updated**: January 2025
**Current Phase**: Ready for Database Creation & Deployment

---

## ✅ Completed Setup

### 1. Infrastructure Files Created
- ✅ `Dockerfile` - Optimized multi-stage build for production
- ✅ `fly.staging.toml` - Staging environment configuration
- ✅ `fly.production.toml` - Production environment configuration
- ✅ `.dockerignore` - Docker build optimization
- ✅ `next.config.js` - Configured for standalone output

### 2. Deployment Scripts
- ✅ `scripts/deploy-staging.sh` - Automated staging deployment
- ✅ `scripts/deploy-production.sh` - Automated production deployment (with confirmation)
- ✅ `scripts/apply-migrations-fly.sh` - Database migration script
- ✅ All scripts are executable

### 3. Documentation
- ✅ `DEPLOYMENT.md` - Complete deployment guide (17 sections)
- ✅ `DEPLOY-QUICKSTART.md` - Quick reference guide
- ✅ `DEPLOY-NOW.md` - Step-by-step current status guide
- ✅ `DEPLOYMENT-SETUP.md` - Infrastructure overview
- ✅ `.env.example` - Updated with Fly.io examples

### 4. Fly.io Setup
- ✅ Fly CLI installed at `/Users/eainjones/.fly/bin/flyctl`
- ✅ Authenticated as `eain.jones@gmail.com`
- ✅ Organization: Eain Jones (personal)

### 5. Applications Created
- ✅ **Staging App**: `fiacha-staging` (created and ready)
- ⏳ **Production App**: Not yet created (ready to create when needed)

### 6. Testing Infrastructure
- ✅ Full test suite passing (26/26 tests)
- ✅ Database validation working
- ✅ API endpoint tests working
- ✅ Deployment scripts run tests before deploying

---

## ⏳ Next Steps (Manual Actions Required)

### Immediate: Complete Staging Deployment

**Why Manual?** The Postgres database creation requires interactive confirmation that cannot be automated in the current environment.

#### Step 1: Set Up Your Terminal

```bash
# Add Fly CLI to PATH
echo 'export PATH="$HOME/.fly/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Navigate to project
cd /Users/eainjones/Documents/GitHub/fiacha
```

#### Step 2: Create Staging Database

```bash
# This will prompt for confirmation - press 'y'
flyctl postgres create \
  --name fiacha-staging-db \
  --region lhr \
  --vm-size shared-cpu-1x \
  --volume-size 1
```

**Expected Duration**: 2-3 minutes
**What You'll See**:
- Warning about unmanaged Postgres (normal)
- Confirmation prompt (press 'y')
- Creation progress
- Database credentials (save these!)

#### Step 3: Attach Database to App

```bash
flyctl postgres attach fiacha-staging-db --app fiacha-staging
```

**What This Does**:
- Connects the database to your app
- Automatically sets `DATABASE_URL` secret
- Enables app to access database

#### Step 4: Deploy Application

```bash
# Option 1: Using npm script (recommended)
npm run deploy:staging

# Option 2: Direct deployment
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

**What Happens**:
1. ✅ Runs all tests (database validation + API tests)
2. 📦 Builds Docker image (~5-10 min first time)
3. 🚀 Deploys to Fly.io
4. 🏥 Runs health checks
5. ✅ App goes live

#### Step 5: Apply Database Migrations

```bash
# Connect to database
flyctl postgres connect -a fiacha-staging-db
```

In the `psql` prompt that appears, run:

```sql
\i db/migrations/001_add_geographical_hierarchy.sql
\i db/migrations/002_seed_local_authorities.sql
\i db/migrations/003_seed_real_politicians.sql
\i db/migrations/004_seed_real_promises.sql
\i db/migrations/005_seed_councillors.sql
\q
```

#### Step 6: Verify Everything Works

```bash
# Check status
flyctl status -a fiacha-staging

# Test API
curl https://fiacha-staging.fly.dev/api/politicians
curl https://fiacha-staging.fly.dev/api/counties

# Open in browser
open https://fiacha-staging.fly.dev
```

---

## 🎯 After Staging Works

### Set Up Production

Follow the same steps but for production:

```bash
# 1. Create app
flyctl apps create fiacha-production

# 2. Create database (larger volume)
flyctl postgres create \
  --name fiacha-production-db \
  --region lhr \
  --vm-size shared-cpu-1x \
  --volume-size 3

# 3. Attach database
flyctl postgres attach fiacha-production-db --app fiacha-production

# 4. Deploy (will ask for confirmation)
npm run deploy:production

# 5. Apply migrations (same as staging)
flyctl postgres connect -a fiacha-production-db

# 6. Verify
open https://fiacha-production.fly.dev
```

---

## 📊 Environment Comparison

| Aspect | Staging | Production |
|--------|---------|------------|
| **Status** | App created, awaiting DB | Not yet created |
| **App Name** | fiacha-staging | fiacha-production |
| **Database Name** | fiacha-staging-db | fiacha-production-db |
| **URL** | fiacha-staging.fly.dev | fiacha-production.fly.dev |
| **Memory** | 512 MB | 1024 MB |
| **Database Size** | 1 GB | 3 GB |
| **Min Machines** | 0 (auto-stop) | 1 (always on) |
| **Monthly Cost** | ~$0-5 | ~$15-20 |

---

## 🔧 Configuration Details

### Staging (`fly.staging.toml`)
```toml
app = "fiacha-staging"
primary_region = "lhr"

[env]
  NODE_ENV = "production"
  NEXT_PUBLIC_API_URL = "https://fiacha-staging.fly.dev"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory_mb = 512
```

### Production (`fly.production.toml`)
```toml
app = "fiacha-production"
primary_region = "lhr"

[env]
  NODE_ENV = "production"
  NEXT_PUBLIC_API_URL = "https://fiacha-production.fly.dev"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  memory_mb = 1024
```

---

## 📚 Documentation Reference

### Quick Start
👉 **See `DEPLOY-NOW.md`** for step-by-step current status

### Detailed Guides
- **Full Guide**: `DEPLOYMENT.md` - Complete deployment documentation
- **Quick Commands**: `DEPLOY-QUICKSTART.md` - Copy-paste reference
- **Setup Overview**: `DEPLOYMENT-SETUP.md` - Infrastructure details

### Testing
- **Testing Guide**: `TESTING.md` - How to run tests
- **Test Results**: `TEST-RESULTS.md` - Latest test report (26/26 passing)

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [x] Dockerfile created and optimized
- [x] Fly.io configs created (staging + production)
- [x] Deployment scripts created
- [x] Tests passing (26/26)
- [x] Fly CLI installed
- [x] Fly.io authenticated
- [x] Staging app created

### Staging Deployment
- [ ] Add flyctl to PATH
- [ ] Create staging database
- [ ] Attach database to app
- [ ] Deploy application
- [ ] Apply migrations
- [ ] Verify deployment

### Production Deployment
- [ ] Test staging thoroughly
- [ ] Create production app
- [ ] Create production database
- [ ] Attach database
- [ ] Deploy application
- [ ] Apply migrations
- [ ] Verify deployment
- [ ] Set up monitoring

---

## 🆘 Getting Help

### If Database Creation Fails
1. Check `flyctl postgres list` to see if it was created
2. Try creating again with the same command
3. Check Fly.io status: https://status.fly.io

### If Deployment Fails
1. Check logs: `flyctl logs -a fiacha-staging`
2. Verify tests pass: `npm run test:all`
3. Try building Docker locally: `docker build -t fiacha-test .`

### If Migrations Fail
1. Check database connection: `flyctl postgres connect -a fiacha-staging-db`
2. Verify migrations exist in Docker image
3. Try running migrations from local machine via proxy

### Support Resources
- **Fly.io Docs**: https://fly.io/docs
- **Fly.io Community**: https://community.fly.io
- **Fly.io Status**: https://status.fly.io

---

## 🚀 Ready to Deploy?

**👉 Next Command to Run:**

```bash
flyctl postgres create --name fiacha-staging-db --region lhr --vm-size shared-cpu-1x --volume-size 1
```

**Then follow the steps in `DEPLOY-NOW.md`**

---

## 📈 Success Metrics

Once deployed, you should see:

### Staging Environment
- ✅ App accessible at https://fiacha-staging.fly.dev
- ✅ API returns data: `/api/politicians` (110 politicians)
- ✅ API returns data: `/api/counties` (26 counties)
- ✅ API returns data: `/api/promises` (18 promises)
- ✅ Health checks passing
- ✅ Auto-scaling working (scales to 0 when idle)

### Production Environment (When Set Up)
- ✅ App accessible at https://fiacha-production.fly.dev
- ✅ Same API endpoints working
- ✅ Always-on (minimum 1 machine)
- ✅ Monitoring configured

---

**Status**: Ready for manual database creation and deployment 🚀
