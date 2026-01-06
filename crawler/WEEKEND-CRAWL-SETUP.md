# Weekend Council Crawl System

Implementation details for the staggered weekend councillor data crawl system.

## Overview

Automated system to detect councillor changes on Irish council websites every weekend, with:
- Staggered batches to avoid rate limits
- SHA-256 hash-based change detection
- Email notifications for changes and alerts
- Suspicious change flagging (>50% turnover)

## Files

### Configuration
- `council-crawl-config.json` - Batch schedule, rate limits, thresholds

### Core Modules (src/crawlers/)
- `council-urls.ts` - Council website URLs
- `councillor-extractor.ts` - Name extraction from scraped content
- `change-detector.ts` - Hash-based change detection
- `change-logger.ts` - Logging and weekly summary
- `council-batch-scheduler.ts` - Batch scheduling utilities
- `firecrawl-client.ts` - Modified with RateLimitError and 30-min pause

### Entry Points
- `weekend-council-crawl.ts` - Main weekend crawl script
- `council-status.ts` - Status check utility

### Notifications
- `src/notifications/email-notifier.ts` - Weekend summary and alert emails

## NPM Scripts

```bash
# Run weekend crawl (auto-detect batch)
npm run crawl:weekend

# Run specific batch (1-7)
npm run crawl:weekend -- --batch 1

# Dry run (no actual scraping)
npm run crawl:weekend:dry-run

# Check status of all councils
npm run council:status

# Detailed status for one council
npm run council:status dublin

# Show only stale data
npm run council:status -- --stale

# Merge all councillor CSVs
npm run council:merge
```

## Batch Schedule

| Batch | Day      | Time | Councils |
|-------|----------|------|----------|
| 1     | Saturday | 8am  | dublin, dun-laoghaire-rathdown, south-dublin, fingal, carlow |
| 2     | Saturday | 10am | cavan, clare, cork, cork-city, donegal |
| 3     | Saturday | 12pm | galway, galway-city, kerry, kildare, kilkenny |
| 4     | Saturday | 2pm  | laois, leitrim, limerick, longford, louth |
| 5     | Sunday   | 8am  | mayo, meath, monaghan, offaly, roscommon |
| 6     | Sunday   | 10am | sligo, tipperary, waterford, westmeath, wexford |
| 7     | Sunday   | 12pm | wicklow (+ sends weekend summary email) |

## EC2 Cron Setup

Add to crontab (`crontab -e`):

```cron
# Fiacha Weekend Council Crawl
# Runs every weekend (Saturday/Sunday)

# Saturday batches (UTC times - adjust for Ireland if needed)
0 8 * * 6 cd /home/ec2-user/fiacha/crawler && npm run crawl:weekend -- --batch 1 >> /var/log/fiacha/crawl.log 2>&1
0 10 * * 6 cd /home/ec2-user/fiacha/crawler && npm run crawl:weekend -- --batch 2 >> /var/log/fiacha/crawl.log 2>&1
0 12 * * 6 cd /home/ec2-user/fiacha/crawler && npm run crawl:weekend -- --batch 3 >> /var/log/fiacha/crawl.log 2>&1
0 14 * * 6 cd /home/ec2-user/fiacha/crawler && npm run crawl:weekend -- --batch 4 >> /var/log/fiacha/crawl.log 2>&1

# Sunday batches
0 8 * * 0 cd /home/ec2-user/fiacha/crawler && npm run crawl:weekend -- --batch 5 >> /var/log/fiacha/crawl.log 2>&1
0 10 * * 0 cd /home/ec2-user/fiacha/crawler && npm run crawl:weekend -- --batch 6 >> /var/log/fiacha/crawl.log 2>&1
0 12 * * 0 cd /home/ec2-user/fiacha/crawler && npm run crawl:weekend -- --batch 7 >> /var/log/fiacha/crawl.log 2>&1
```

Create log directory:
```bash
sudo mkdir -p /var/log/fiacha
sudo chown ec2-user:ec2-user /var/log/fiacha
```

## Environment Variables

Required in `.env`:
```
FIRECRAWL_API_KEY=your_firecrawl_key
RESEND_API_KEY=your_resend_key
NOTIFICATION_EMAIL=recipient@example.com
NOTIFICATION_FROM_EMAIL=fiacha@yourdomain.com
```

## Rate Limit Configuration

In `council-crawl-config.json`:
```json
{
  "rateLimit": {
    "interRequestDelayMs": 10000,    // 10 sec between requests
    "rateLimitPauseMs": 1800000,     // 30 min pause on 429
    "maxRetries": 5,
    "backoffMultiplier": 2,
    "initialBackoffMs": 2000
  }
}
```

## Change Detection

- Councillor lists are hashed (SHA-256)
- Hash stored in `data/{county}/structured/councillors_metadata.json`
- Changes logged to `crawler/logs/council-changes.json`
- Suspicious changes (>50% turnover) require manual review

## Email Notifications

1. **Weekend Summary** - Sent after batch 7 completes
   - Lists all changes detected
   - Shows any errors encountered
   - Highlights suspicious changes

2. **Suspicious Change Alert** - Sent immediately when detected
   - County name and reason
   - Added/removed councillors
   - Requires manual confirmation before applying

## Testing

```bash
# Dry run to see what would happen
npm run crawl:weekend:dry-run

# Run single batch manually
npm run crawl:weekend -- --batch 1

# Check current data status
npm run council:status

# Force run on non-weekend
npm run crawl:weekend -- --batch 1 --force
```

## Log Files

- `crawler/logs/council-changes.log` - Human-readable log
- `crawler/logs/council-changes.json` - Machine-readable log (last 1000 entries)
- Logs auto-clean after 30 days

## Monitoring

Check status after weekend:
```bash
npm run council:status -- --stale    # Show councils not checked recently
npm run council:status -- --changes  # Show councils with recent changes
```
