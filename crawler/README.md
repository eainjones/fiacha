# Fiacha Promise Crawler

Automated promise extraction service that uses Firecrawl and LLMs to identify and track political promises from Irish sources.

## Overview

This crawler service:
1. **Crawls** Irish political sources (Oireachtas debates, gov.ie press releases, news sites)
2. **Extracts** specific, measurable promises using AI (Claude or OpenAI)
3. **Matches** politicians to the Fiacha database using fuzzy matching
4. **Queues** promises for human review before insertion
5. **Validates** against quality standards from the Researcher Guide

## Architecture

```
┌──────────────┐
│  Firecrawl   │  Scrapes sources → markdown content
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  LLM (Claude │  Extracts promises with confidence scores
│  or OpenAI)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Politician  │  Fuzzy matches to database
│  Matcher     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Review      │  Human review before insertion
│  Queue       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Database    │  Approved promises → main DB
└──────────────┘
```

## Setup

### 1. Install Dependencies

```bash
cd crawler
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required variables:
- `FIRECRAWL_API_KEY`: Get from https://firecrawl.dev
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`: Choose your LLM provider
- `DATABASE_URL`: Same Supabase connection as main Fiacha app
- `LLM_PROVIDER`: Set to `claude` or `openai`

### 3. Apply Database Migration

Run the migration to create the review queue table:

```bash
psql $DATABASE_URL < db/migration-001-review-queue.sql
```

Or use your preferred PostgreSQL client to run `db/migration-001-review-queue.sql`.

## Usage

### Run the Crawler

```bash
npm run crawl
```

This will:
1. Load enabled sources from `src/crawlers/source-registry.ts`
2. Crawl each source using Firecrawl
3. Extract promises using your chosen LLM
4. Match politicians to the database
5. Queue all promises for review

### Review Extracted Promises

```bash
npm run review
```

Interactive CLI that lets you:
- View each extracted promise with full details
- See politician match confidence
- Approve (inserts into main database)
- Reject (with reason)
- Skip (review later)

### Development Mode

```bash
npm run dev
```

Runs the crawler with live TypeScript compilation.

## Configuration

### Enable/Disable Sources

Edit `src/crawlers/source-registry.ts`:

```typescript
{
  url: 'https://www.oireachtas.ie/en/debates/',
  name: 'Oireachtas Debates',
  tier: 'tier1',
  sourceType: 'parliamentary',
  enabled: true,  // Set to false to disable
  priority: 10,
}
```

### Switch LLM Provider

In `.env`:

```bash
# Use Claude (recommended)
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-xxx

# Or use OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
```

### Adjust Extraction Quality

Edit `src/extractors/prompt-templates.ts` to modify:
- Promise quality criteria
- Confidence scoring thresholds
- Category mappings
- Title format rules

## Quality Standards

The crawler enforces quality standards from the Fiacha Researcher Guide:

**Valid Promises:**
- ✅ Specific with measurable outcomes
- ✅ Actionable commitments
- ✅ Time-bound (explicit or implied deadline)
- ✅ From public, official sources

**Rejected:**
- ❌ Vague aspirations ("improve things")
- ❌ General commentary
- ❌ Missing specific details
- ❌ Confidence < 30%

## Project Structure

```
crawler/
├── src/
│   ├── crawlers/
│   │   ├── firecrawl-client.ts      # Firecrawl wrapper with retry
│   │   └── source-registry.ts       # List of sources to crawl
│   ├── extractors/
│   │   ├── llm-interface.ts         # LLM abstraction interface
│   │   ├── claude-extractor.ts      # Claude implementation
│   │   ├── openai-extractor.ts      # OpenAI implementation
│   │   ├── prompt-templates.ts      # Extraction prompts
│   │   └── index.ts                 # Factory
│   ├── validators/
│   │   └── politician-matcher.ts    # Fuzzy matching logic
│   ├── database/
│   │   ├── client.ts                # PostgreSQL connection
│   │   └── queries.ts               # Review queue queries
│   ├── review/
│   │   └── cli-review.ts            # Interactive review CLI
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript types
│   └── index.ts                     # Main orchestrator
├── db/
│   └── migration-001-review-queue.sql  # Database schema
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## EC2 Deployment

See `EC2-DEPLOYMENT.md` for detailed instructions on:
1. Setting up EC2 instance
2. Installing dependencies
3. Configuring environment
4. Running as a cron job
5. Monitoring logs

Quick setup:

```bash
# On EC2 instance
git clone <repo>
cd fiacha/crawler
npm install
cp .env.example .env
# Edit .env with API keys

# Run migration
psql $DATABASE_URL < db/migration-001-review-queue.sql

# Test
npm run crawl
npm run review

# Schedule with cron (daily at 3am)
crontab -e
# Add: 0 3 * * * cd /path/to/fiacha/crawler && npm run crawl >> logs/crawl.log 2>&1
```

## Cost Estimates

### API Costs (Monthly)

**Firecrawl**:
- ~$0.001-0.01 per page
- Daily crawl of 50 pages = ~$15-50/month

**Claude** (recommended):
- ~$3 per 1M input tokens, $15 per 1M output
- ~500 promises/month = ~$10-20/month

**OpenAI** (GPT-4 Turbo):
- ~$10 per 1M input tokens, $30 per 1M output
- ~500 promises/month = ~$20-40/month

### Infrastructure

**EC2** (t3.medium):
- ~$30/month for 24/7 operation
- Can use smaller instance for periodic crawls

**Total Estimated**: $55-120/month depending on crawl frequency and LLM choice.

## Monitoring

### View Queue Stats

```typescript
import { createDatabaseClient } from './src/database/client';
import { getReviewStats } from './src/database/queries';

const db = createDatabaseClient();
const stats = await getReviewStats(db);
console.log(stats);
// { total: 50, pending: 12, approved: 35, rejected: 3 }
```

### Check Extraction Quality

After running crawler, review the confidence scores and match quality:
- High confidence (>80%): Usually accurate
- Medium (50-80%): Review carefully
- Low (<50%): Likely needs rejection

### Database Health

```bash
npm run test
```

Runs health checks on:
- Database connection
- Politician data loaded
- Firecrawl API accessible
- LLM API accessible

## Troubleshooting

### "No promises found"

1. Check the source URL is correct and accessible
2. Verify Firecrawl successfully scraped content
3. Review LLM prompt in `src/extractors/prompt-templates.ts`
4. Lower confidence threshold temporarily for testing

### "No politician match"

1. Check politician name spelling in source
2. Verify politician exists in database (`npm run review` shows matches)
3. Adjust fuzzy matching threshold in `politician-matcher.ts`
4. Add politician manually to main Fiacha database

### "Database connection failed"

1. Verify `DATABASE_URL` is correct
2. Check Supabase IP allowlist includes EC2 IP
3. Test connection: `psql $DATABASE_URL -c "SELECT NOW()"`

### "Firecrawl rate limit"

1. Increase `CRAWL_DELAY_MS` in `.env`
2. Reduce `CRAWL_BATCH_SIZE`
3. Upgrade Firecrawl plan if needed

## Development

### Adding New Sources

1. Edit `src/crawlers/source-registry.ts`
2. Add source object with URL, tier, and type
3. Test: `npm run crawl`

### Improving Extraction

1. Edit `src/extractors/prompt-templates.ts`
2. Update system prompt or user prompt template
3. Test on sample sources
4. Compare Claude vs OpenAI results

### Custom Validation

1. Edit `src/validators/politician-matcher.ts` for matching logic
2. Edit `src/extractors/llm-interface.ts` for quality filters

## License

Same as main Fiacha project.

## Support

See main Fiacha documentation or contact project admin.
