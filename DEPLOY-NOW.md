# Deploy Fiacha to Fly.io - Complete Now

## ✅ Already Done

1. ✅ Fly CLI installed at `/Users/eainjones/.fly/bin/flyctl`
2. ✅ Authenticated as: eain.jones@gmail.com
3. ✅ Staging app created: `fiacha-staging`

## 📋 Complete These Steps Now

### Step 1: Add Fly CLI to Your PATH

Open a new terminal and run:

```bash
# Add to your shell profile
echo 'export PATH="$HOME/.fly/bin:$PATH"' >> ~/.zshrc

# Reload your shell
source ~/.zshrc

# Verify it works
flyctl version
```

### Step 2: Create Staging Database

```bash
# Navigate to your project
cd /Users/eainjones/Documents/GitHub/fiacha

# Create the database (will ask for confirmation - type 'y')
flyctl postgres create \
  --name fiacha-staging-db \
  --region lhr \
  --vm-size shared-cpu-1x \
  --volume-size 1
```

**Expected output:**
- You'll see a warning about unmanaged Postgres
- Press `y` to continue
- Wait ~2-3 minutes for creation
- You'll get a DATABASE_URL and password

### Step 3: Attach Database to App

```bash
flyctl postgres attach fiacha-staging-db --app fiacha-staging
```

**Expected output:**
- "Postgres cluster fiacha-staging-db is now attached to fiacha-staging"
- DATABASE_URL secret is automatically set

### Step 4: Deploy to Staging

```bash
# Option 1: Use our deployment script
npm run deploy:staging

# Option 2: Deploy manually
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

**What happens:**
- Tests run automatically
- Docker image builds (~5-10 minutes first time)
- App deploys to Fly.io
- Health checks run

### Step 5: Apply Database Migrations

```bash
# Connect to the database
flyctl postgres connect -a fiacha-staging-db
```

Once connected to `psql`, copy and paste these commands one by one:

```sql
\i db/migrations/001_add_geographical_hierarchy.sql
\i db/migrations/002_seed_local_authorities.sql
\i db/migrations/003_seed_real_politicians.sql
\i db/migrations/004_seed_real_promises.sql
\i db/migrations/005_seed_councillors.sql
```

Exit psql:
```sql
\q
```

### Step 6: Verify Deployment

```bash
# Check app status
flyctl status -a fiacha-staging

# View logs
flyctl logs -a fiacha-staging

# Test API endpoints
curl https://fiacha-staging.fly.dev/api/politicians
curl https://fiacha-staging.fly.dev/api/counties
curl https://fiacha-staging.fly.dev/api/promises

# Open in browser
open https://fiacha-staging.fly.dev
```

## 🎉 After Staging is Working

### Set Up Production

```bash
# 1. Create production app
flyctl apps create fiacha-production

# 2. Create production database
flyctl postgres create \
  --name fiacha-production-db \
  --region lhr \
  --vm-size shared-cpu-1x \
  --volume-size 3

# 3. Attach database
flyctl postgres attach fiacha-production-db --app fiacha-production

# 4. Deploy (will ask for confirmation)
npm run deploy:production

# 5. Apply migrations
flyctl postgres connect -a fiacha-production-db
# Then run the same migration commands as staging

# 6. Verify
flyctl status -a fiacha-production
open https://fiacha-production.fly.dev
```

## 🔍 Troubleshooting

### Database Creation Fails

If the database creation times out or fails:

```bash
# Check if it was created anyway
flyctl postgres list

# If created but not attached
flyctl postgres attach fiacha-staging-db --app fiacha-staging

# If not created, try again
flyctl postgres create --name fiacha-staging-db --region lhr --vm-size shared-cpu-1x --volume-size 1
```

### Deployment Fails

```bash
# Check build logs
flyctl logs -a fiacha-staging

# Try building locally first
docker build -t fiacha-test .

# Re-deploy
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

### Can't Connect to Database

```bash
# Check database status
flyctl status -a fiacha-staging-db

# Check if attached
flyctl secrets list -a fiacha-staging | grep DATABASE_URL

# Restart database
flyctl apps restart fiacha-staging-db
```

### Migration Files Not Found

The migrations should be in the Docker image. If `\i` doesn't work:

```bash
# Alternative: Run migrations from your local machine
flyctl proxy 5432 -a fiacha-staging-db

# In another terminal
psql "postgres://postgres:[password]@localhost:5432/[dbname]" < db/migrations/001_add_geographical_hierarchy.sql
# Repeat for each migration
```

## 📊 What You'll Have

### Staging Environment
- **URL**: https://fiacha-staging.fly.dev
- **Database**: fiacha-staging-db
- **Auto-scaling**: Scales to 0 when idle (saves money)
- **Memory**: 512MB
- **Cost**: ~$0-5/month

### Production Environment (When Set Up)
- **URL**: https://fiacha-production.fly.dev
- **Database**: fiacha-production-db
- **Always On**: Minimum 1 machine
- **Memory**: 1GB
- **Cost**: ~$15-20/month

## 🔗 Useful Commands Reference

```bash
# View all apps
flyctl apps list

# View all databases
flyctl postgres list

# SSH into app
flyctl ssh console -a fiacha-staging

# View secrets
flyctl secrets list -a fiacha-staging

# Scale app
flyctl scale memory 1024 -a fiacha-staging

# Restart app
flyctl apps restart fiacha-staging

# View dashboard
flyctl dashboard -a fiacha-staging
```

## ✨ Next Steps After Deployment

1. **Custom Domain** (Optional)
   ```bash
   flyctl certs create yourdomain.com -a fiacha-production
   ```

2. **Set Up Monitoring**
   - Configure alerts in Fly.io dashboard
   - Set up error tracking (Sentry, etc.)

3. **CI/CD** (Optional)
   - Set up GitHub Actions
   - See `DEPLOYMENT.md` for example workflow

4. **Expand Data**
   - Add more councillors to database
   - Add more promises
   - Update regularly

## 🆘 Need Help?

- **Fly.io Docs**: https://fly.io/docs
- **Fly.io Community**: https://community.fly.io
- **Project Docs**: See `DEPLOYMENT.md` for detailed guide

## 📝 Current Status

As of now:
- ✅ Fly CLI installed and authenticated
- ✅ Staging app created (`fiacha-staging`)
- ⏳ Waiting for you to create staging database
- ⏳ Waiting for deployment

**Next command to run:**
```bash
flyctl postgres create --name fiacha-staging-db --region lhr --vm-size shared-cpu-1x --volume-size 1
```
