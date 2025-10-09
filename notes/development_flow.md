# Development Flow

## Local Development

### Initial Setup
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up local database**
   - Option A: Local Postgres
     ```bash
     # Install Postgres (macOS)
     brew install postgresql@15
     brew services start postgresql@15

     # Create database
     createdb fiacha

     # Apply schema
     psql fiacha < db/schema.sql
     ```

   - Option B: Docker Postgres
     ```bash
     docker run --name fiacha-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=fiacha -p 5432:5432 -d postgres:15

     # Apply schema
     docker exec -i fiacha-db psql -U postgres -d fiacha < db/schema.sql
     ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   # e.g., DATABASE_URL=postgres://postgres:password@localhost:5432/fiacha
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   App runs at http://localhost:3000

### Daily Development Loop
1. **Make code changes** in `app/`, `lib/`, etc.
2. **Hot reload** automatically shows changes
3. **Test API endpoints** with curl/Postman:
   ```bash
   # List politicians
   curl http://localhost:3000/api/politicians

   # Create politician
   curl -X POST http://localhost:3000/api/politicians \
     -H "Content-Type: application/json" \
     -d '{"name":"Mary Lou McDonald","party":"Sinn Féin","constituency":"Dublin Central"}'

   # List promises
   curl http://localhost:3000/api/promises

   # Create promise
   curl -X POST http://localhost:3000/api/promises \
     -H "Content-Type: application/json" \
     -d '{"politician_id":1,"title":"Build 100,000 homes","category":"Housing","promise_date":"2024-01-15"}'
   ```

4. **Database changes**:
   - Edit `db/schema.sql` for new migrations
   - Apply manually: `psql $DATABASE_URL < db/migration.sql`
   - Consider migration tool later (e.g., node-pg-migrate, Drizzle)

5. **Commit changes**:
   ```bash
   git add .
   git commit -m "Description"
   ```

## Staging/Production Deployment (Fly.io)

### First-Time Setup
1. **Install Fly CLI**
   ```bash
   # macOS
   brew install flyctl

   # Authenticate
   flyctl auth login
   ```

2. **Launch app** (one-time)
   ```bash
   flyctl launch
   # Choose app name (e.g., fiacha or fiacha-staging)
   # Select London (lhr) region
   # Don't deploy yet
   ```

3. **Create Postgres database**
   ```bash
   flyctl postgres create --name fiacha-db --region lhr

   # Attach to app
   flyctl postgres attach fiacha-db
   ```

4. **Apply database schema**
   ```bash
   # Proxy to local port
   flyctl proxy 5432 -a fiacha-db

   # In another terminal, apply schema
   psql postgres://postgres:password@localhost:5432/fiacha < db/schema.sql
   ```

### Deployment Flow
1. **Test locally** - ensure `npm run build` succeeds
   ```bash
   npm run build
   npm start  # Test production build
   ```

2. **Deploy to Fly.io**
   ```bash
   flyctl deploy
   ```

   This:
   - Builds Docker image
   - Pushes to Fly.io registry
   - Deploys to machines
   - Auto-scales based on traffic

3. **View logs**
   ```bash
   flyctl logs
   ```

4. **Check status**
   ```bash
   flyctl status
   flyctl postgres status -a fiacha-db
   ```

### Environment Variables
```bash
# Set secrets on Fly.io
flyctl secrets set API_KEY=xxx

# List secrets
flyctl secrets list

# DATABASE_URL is automatically set by postgres attach
```

## Multiple Environments Pattern

### Staging
```bash
# Create staging app
flyctl launch --name fiacha-staging --region lhr --no-deploy
flyctl postgres create --name fiacha-staging-db --region lhr
flyctl postgres attach fiacha-staging-db -a fiacha-staging

# Deploy
flyctl deploy -a fiacha-staging
```

### Production
```bash
# Create production app
flyctl launch --name fiacha --region lhr --no-deploy
flyctl postgres create --name fiacha-db --region lhr --vm-size dedicated-cpu-2x
flyctl postgres attach fiacha-db -a fiacha

# Deploy
flyctl deploy -a fiacha
```

### Switching contexts
```bash
# Deploy to specific app
flyctl deploy -a fiacha-staging
flyctl deploy -a fiacha

# View specific app logs
flyctl logs -a fiacha-staging
```

## Database Management

### Backups
```bash
# Fly Postgres has automatic daily snapshots
flyctl postgres list-snapshots -a fiacha-db

# Manual backup
flyctl proxy 5432 -a fiacha-db
pg_dump postgres://postgres:password@localhost:5432/fiacha > backup.sql
```

### Restore
```bash
flyctl proxy 5432 -a fiacha-db
psql postgres://postgres:password@localhost:5432/fiacha < backup.sql
```

### Migrations
```bash
# Write migration
cat > db/migrations/002_add_user_submissions.sql <<EOF
CREATE TABLE user_submissions (
  id SERIAL PRIMARY KEY,
  ...
);
EOF

# Apply to local
psql fiacha < db/migrations/002_add_user_submissions.sql

# Apply to staging
flyctl proxy 5432 -a fiacha-staging-db
psql postgres://postgres:password@localhost:5432 < db/migrations/002_add_user_submissions.sql

# Test on staging, then apply to production
```

## Monitoring & Debugging

### Application logs
```bash
flyctl logs -a fiacha
flyctl logs -a fiacha --follow  # Live tail
```

### Database queries
```bash
# Connect to DB
flyctl postgres connect -a fiacha-db

# Run queries
SELECT * FROM promises ORDER BY created_at DESC LIMIT 10;
```

### SSH into machine
```bash
flyctl ssh console -a fiacha
```

### Health checks
```bash
curl https://fiacha.fly.dev/api/politicians
```

## Typical Feature Development Flow

1. **Create branch**
   ```bash
   git checkout -b feature/promise-comments
   ```

2. **Update schema** if needed
   - Add to `db/schema.sql` or create migration
   - Apply locally

3. **Build feature**
   - Add API routes in `app/api/`
   - Add UI components in `app/`
   - Test locally with `npm run dev`

4. **Test thoroughly**
   ```bash
   npm run build  # Ensure production build works
   npm start
   ```

5. **Deploy to staging**
   ```bash
   git push origin feature/promise-comments
   flyctl deploy -a fiacha-staging
   ```

6. **Test on staging**
   - Manual testing
   - Share with team/users

7. **Merge and deploy to production**
   ```bash
   git checkout main
   git merge feature/promise-comments
   git push origin main
   flyctl deploy -a fiacha
   ```

8. **Monitor production**
   ```bash
   flyctl logs -a fiacha
   ```

## Scaling Considerations

### Auto-scaling (already configured)
- Machines start on first request
- Auto-stop when idle (saves costs)
- Scale horizontally: `flyctl scale count 2`

### Database scaling
```bash
# Vertical: upgrade machine size
flyctl postgres update --vm-size dedicated-cpu-4x -a fiacha-db

# Read replicas for heavy read loads
flyctl postgres create --name fiacha-db-replica --region lhr
```

### Performance monitoring
- Add Sentry/DataDog/Grafana later
- Use Fly.io metrics dashboard
- Postgres query analysis: pg_stat_statements

## Cost Management

### Development
- Local development: free
- Keep staging small: shared-cpu-1x

### Production
- Start small, scale as needed
- Postgres: dedicated-cpu-1x or 2x
- Monitor usage: `flyctl dashboard`
- Set spending limits in Fly.io console
