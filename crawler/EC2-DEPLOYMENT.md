# EC2 Deployment Guide for Fiacha Crawler

This guide walks through deploying the Fiacha Promise Crawler on an AWS EC2 instance.

## Prerequisites

- AWS account with EC2 access
- Firecrawl API key (https://firecrawl.dev)
- Anthropic API key OR OpenAI API key
- Supabase database URL (same as main Fiacha app)

## Step 1: Launch EC2 Instance

### Recommended Instance Type

**For periodic crawling (recommended):**
- Instance: `t3.small` or `t3.medium`
- vCPUs: 2
- Memory: 2-4 GB
- Storage: 20 GB GP3
- Cost: ~$15-30/month

**For 24/7 operation with high volume:**
- Instance: `t3.medium` or `t3.large`
- vCPUs: 2-4
- Memory: 4-8 GB
- Storage: 30 GB GP3
- Cost: ~$30-60/month

### Launch Configuration

1. **AMI**: Ubuntu Server 22.04 LTS
2. **Instance type**: t3.medium (recommended)
3. **Security Group**:
   - Inbound: SSH (22) from your IP
   - Outbound: All traffic (for API calls)
4. **Storage**: 20 GB GP3
5. **Key pair**: Create or use existing

### Launch Instance

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx \
  --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3}' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=fiacha-crawler}]'
```

## Step 2: Connect to EC2

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

## Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install PostgreSQL client (for migrations)
sudo apt install -y postgresql-client

# Verify installations
node --version  # Should be v20.x
npm --version
psql --version
```

## Step 4: Clone Repository

```bash
# Clone Fiacha repository
cd ~
git clone https://github.com/yourusername/fiacha.git
cd fiacha/crawler
```

## Step 5: Configure Environment

```bash
# Create .env file
cp .env.example .env
nano .env
```

Fill in your API keys:

```bash
# Firecrawl
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxx

# LLM (choose one)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
# OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Database (from main Fiacha app)
DATABASE_URL=postgres://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres

# Settings
LLM_PROVIDER=claude
CRAWL_BATCH_SIZE=5
CRAWL_DELAY_MS=2000
MAX_RETRIES=3
```

Save and exit (`Ctrl+X`, `Y`, `Enter`).

## Step 6: Install Node Modules

```bash
npm install
```

This may take a few minutes.

## Step 7: Apply Database Migration

```bash
# Test database connection first
psql $DATABASE_URL -c "SELECT NOW()"

# Apply migration
psql $DATABASE_URL < db/migration-001-review-queue.sql
```

Expected output:
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
COMMENT
COMMENT
COMMENT
COMMENT
```

## Step 8: Test the Crawler

```bash
# Run a test crawl
npm run crawl
```

You should see output like:
```
╔════════════════════════════════════════════════╗
║   Fiacha Promise Crawler - Main Pipeline      ║
╚════════════════════════════════════════════════╝

[1/6] Initializing clients...
   • Firecrawl: ✓
   • LLM Extractor: CLAUDE (claude-3-5-sonnet-20241022)
   • Database: ✓

[2/6] Verifying connections...
[Database] ✓ Connection healthy: 2025-01-08 12:34:56

[3/6] Loading politicians...
[Database] ✓ Loaded 297 politicians
   • Total politicians: 297
   • Active: 297
   • TDs: 174
   • Councillors: 123

...
```

## Step 9: Test Review Interface

```bash
npm run review
```

This opens the interactive CLI for reviewing extracted promises.

## Step 10: Schedule Automatic Crawls

### Option A: Cron (Simple)

```bash
# Edit crontab
crontab -e

# Add line for daily crawl at 3am
0 3 * * * cd /home/ubuntu/fiacha/crawler && /usr/bin/npm run crawl >> /home/ubuntu/logs/crawl.log 2>&1

# Create logs directory
mkdir -p ~/logs
```

### Option B: PM2 (Advanced - 24/7 operation)

```bash
# Install PM2
sudo npm install -g pm2

# Create PM2 config
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'fiacha-crawler',
    script: 'dist/index.js',
    cron_restart: '0 3 * * *',  // Daily at 3am
    autorestart: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## Step 11: Monitor Logs

### View recent crawl logs

```bash
tail -f ~/logs/crawl.log
```

### View PM2 logs (if using PM2)

```bash
pm2 logs fiacha-crawler
```

### Check database review queue

```bash
psql $DATABASE_URL -c "SELECT COUNT(*), status FROM promise_review_queue GROUP BY status;"
```

Expected output:
```
 count | status
-------+---------
    12 | pending
    35 | approved
     3 | rejected
```

## Step 12: Set Up Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/fiacha-crawler
```

```
/home/ubuntu/logs/*.log {
  daily
  rotate 14
  compress
  delaycompress
  missingok
  notifempty
}
```

## Security Best Practices

### 1. Use IAM Roles (Instead of Access Keys)

If the crawler needs AWS services, use IAM instance roles instead of hardcoded credentials.

### 2. Restrict Security Group

```bash
# Only allow SSH from your IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32
```

### 3. Use Secrets Manager (Optional)

For production, store API keys in AWS Secrets Manager:

```bash
# Store secret
aws secretsmanager create-secret \
  --name fiacha-crawler-keys \
  --secret-string '{"FIRECRAWL_API_KEY":"fc-xxx","ANTHROPIC_API_KEY":"sk-ant-xxx"}'

# Retrieve in code
const secrets = await secretsManager.getSecretValue({ SecretId: 'fiacha-crawler-keys' });
```

### 4. Enable CloudWatch Monitoring

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure to send logs to CloudWatch
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
  -s
```

## Maintenance

### Update Code

```bash
cd ~/fiacha/crawler
git pull origin main
npm install
npm run build

# Restart PM2 (if using)
pm2 restart fiacha-crawler
```

### Clean Up Old Reviews

```bash
# Delete reviews older than 30 days
psql $DATABASE_URL -c "
  DELETE FROM promise_review_queue
  WHERE status IN ('approved', 'rejected')
  AND reviewed_at < NOW() - INTERVAL '30 days';
"
```

### Monitor Costs

Check Firecrawl and LLM API usage:
- Firecrawl dashboard: https://firecrawl.dev/dashboard
- Anthropic console: https://console.anthropic.com
- OpenAI usage: https://platform.openai.com/usage

### Backup Configuration

```bash
# Backup .env
cp .env .env.backup

# Backup crontab
crontab -l > crontab.backup
```

## Troubleshooting

### Crawler fails to start

```bash
# Check Node version
node --version  # Should be v20.x

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env  # Verify all keys are set
```

### Database connection errors

```bash
# Test connection manually
psql $DATABASE_URL -c "SELECT NOW()"

# Check Supabase IP allowlist
# Go to Supabase Dashboard → Settings → Database
# Add EC2 public IP to allowed IPs
```

### Out of memory errors

```bash
# Check memory usage
free -h

# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Firecrawl rate limiting

```bash
# Increase delay between requests
# Edit .env
CRAWL_DELAY_MS=5000  # 5 seconds instead of 2
```

## Cost Optimization

### Use Spot Instances

For non-critical crawling, save ~70% with Spot Instances:

```bash
aws ec2 request-spot-instances \
  --spot-price "0.05" \
  --instance-count 1 \
  --type "one-time" \
  --launch-specification file://spot-specification.json
```

### Schedule Instance Start/Stop

If only crawling once per day, stop instance when not in use:

```bash
# Stop instance after crawl
aws ec2 stop-instances --instance-ids i-xxxxx

# Start before crawl (via CloudWatch Events or Lambda)
aws ec2 start-instances --instance-ids i-xxxxx
```

### Use Lambda (Alternative)

For very infrequent crawls, consider AWS Lambda instead of EC2:
- Only pay for execution time
- No idle costs
- Automatically scales
- See `LAMBDA-DEPLOYMENT.md` (if needed)

## Monitoring Dashboard

### Simple Status Check Script

Create `status.sh`:

```bash
#!/bin/bash
echo "=== Fiacha Crawler Status ==="
echo "Last crawl:"
tail -1 ~/logs/crawl.log

echo -e "\nReview queue:"
psql $DATABASE_URL -c "SELECT COUNT(*), status FROM promise_review_queue GROUP BY status;"

echo -e "\nDisk usage:"
df -h /home/ubuntu

echo -e "\nMemory usage:"
free -h
```

```bash
chmod +x status.sh
./status.sh
```

## Support

For issues:
1. Check logs: `tail -f ~/logs/crawl.log`
2. Review GitHub issues
3. Contact project admin

## Next Steps

1. ✅ Deploy to EC2
2. ✅ Schedule daily crawls
3. ✅ Monitor for a week
4. Tune extraction prompts based on results
5. Add more sources once stable
6. Consider setting up alerting (CloudWatch Alarms)
