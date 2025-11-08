# Fiacha Crawler - Quick Start Guide

Welcome! This is a **5-minute quick start** to get the crawler running locally for testing.

## Prerequisites

- ✅ Node.js 20+ installed
- ✅ PostgreSQL access (Supabase from main Fiacha app)
- 🔑 API keys ready:
  - Firecrawl API key (get from https://firecrawl.dev)
  - Claude API key (https://console.anthropic.com) OR OpenAI API key

## Step 1: Configure Environment (2 minutes)

```bash
cd crawler
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# Required
FIRECRAWL_API_KEY=fc-your-key-here
DATABASE_URL=postgres://postgres:password@db.xxx.supabase.co:5432/postgres

# Choose one LLM provider
ANTHROPIC_API_KEY=sk-ant-your-key-here
# OR
# OPENAI_API_KEY=sk-your-key-here

# Settings
LLM_PROVIDER=claude  # or 'openai'
```

## Step 2: Apply Database Migration (1 minute)

This creates the `promise_review_queue` table:

```bash
# Option A: Using psql (recommended)
psql $DATABASE_URL < db/migration-001-review-queue.sql

# Option B: Using Supabase SQL Editor
# Copy contents of db/migration-001-review-queue.sql
# Paste into Supabase Dashboard → SQL Editor → New query → Run
```

## Step 3: Run Tests (1 minute)

Verify everything is configured:

```bash
npm run test
```

Expected output:
```
╔════════════════════════════════════════════════╗
║   Fiacha Crawler - System Tests               ║
╚════════════════════════════════════════════════╝

[1/6] Testing environment variables...
   ✓ All environment variables present
[2/6] Testing database connection...
   ✓ Connected to database
   • Politicians: 297
   • Promises: 18
...
✅ All tests passed! System is ready to crawl.
```

## Step 4: Run Your First Crawl (1 minute)

```bash
npm run crawl
```

This will:
1. Crawl enabled sources (currently: Oireachtas debates + gov.ie press releases)
2. Extract promises using AI
3. Match politicians to your database
4. Queue promises for your review

## Step 5: Review Extracted Promises (ongoing)

```bash
npm run review
```

Interactive CLI where you can:
- **Approve** → Inserts into main Fiacha database
- **Reject** → Marks as invalid with reason
- **Skip** → Review later
- **Quit** → Exit review session

## What's Next?

### Test with a Single Source

To avoid API costs during testing, you can temporarily disable some sources:

1. Edit `crawler/src/crawlers/source-registry.ts`
2. Set `enabled: false` for sources you want to skip
3. Save and run `npm run crawl` again

### Adjust Extraction Quality

Edit `crawler/src/extractors/prompt-templates.ts` to:
- Change confidence thresholds
- Modify promise criteria
- Update category mappings

### Compare LLM Providers

Test both Claude and OpenAI:

```bash
# Test with Claude
LLM_PROVIDER=claude npm run crawl

# Test with OpenAI
LLM_PROVIDER=openai npm run crawl

# Compare results in review queue
npm run review
```

### Deploy to EC2

Once you're happy with local testing, see:
- **EC2-DEPLOYMENT.md** for full deployment guide
- Includes cron scheduling, monitoring, cost optimization

## Troubleshooting

### "Missing required env var"
→ Check your `.env` file has all required keys from `.env.example`

### "Database health check failed"
→ Verify `DATABASE_URL` is correct and accessible
→ Run: `psql $DATABASE_URL -c "SELECT NOW()"`

### "No promises found"
→ Normal for some sources! Try different sources or check extraction prompts

### "No politician match"
→ Politician might not be in database yet
→ Add manually to main Fiacha app, or accept unmatched for now

### API Rate Limits
→ Increase `CRAWL_DELAY_MS` in `.env`
→ Reduce number of enabled sources

## Cost Estimates for Testing

**Running 1 test crawl** (~5 sources):
- Firecrawl: ~$0.05-0.10
- Claude/OpenAI: ~$0.10-0.20
- **Total: ~$0.15-0.30 per test**

**Daily production crawling** (10-20 sources):
- ~$2-5 per day
- ~$60-150 per month

## File Structure Reference

```
crawler/
├── src/
│   ├── index.ts              ← Main crawler entry point
│   ├── review/cli-review.ts  ← Interactive review CLI
│   ├── test.ts               ← System tests
│   ├── crawlers/             ← Firecrawl integration
│   ├── extractors/           ← LLM promise extraction
│   ├── validators/           ← Politician matching
│   └── database/             ← Database queries
├── db/
│   └── migration-001-*.sql   ← Review queue schema
├── README.md                 ← Full documentation
├── EC2-DEPLOYMENT.md         ← Production deployment
└── .env                      ← Your API keys (git-ignored)
```

## Common Commands

```bash
npm run crawl     # Run full crawl pipeline
npm run review    # Interactive promise review
npm run test      # System health checks
npm run dev       # Development mode with auto-reload
npm run build     # Compile TypeScript
```

## Support

- **Full docs**: See `README.md`
- **EC2 deployment**: See `EC2-DEPLOYMENT.md`
- **Issues**: Check main Fiacha repo or contact admin

---

**Ready to deploy to EC2?** → See `EC2-DEPLOYMENT.md`

**Questions about how it works?** → See `README.md`

**Having issues?** → Run `npm run test` to diagnose
