#!/bin/bash
# Manual Deployment Commands for EC2
# Run these commands after connecting to EC2 via AWS Console

echo "=== Fiacha Crawler Manual Deployment ==="
echo ""

# 1. Install Node.js 20
echo "Step 1: Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
echo ""

# 2. Install Git
echo "Step 2: Installing Git..."
sudo apt-get install -y git
echo ""

# 3. Clone repository
echo "Step 3: Cloning repository..."
git clone https://github.com/yourusername/fiacha.git
# OR if already cloned:
# cd fiacha && git pull
echo ""

# 4. Navigate to crawler directory
echo "Step 4: Setting up crawler..."
cd fiacha/crawler
mkdir -p ~/logs
echo ""

# 5. Install dependencies
echo "Step 5: Installing dependencies..."
npm install
echo ""

# 6. Create .env file
echo "Step 6: Creating .env file..."
echo "IMPORTANT: Edit .env with your actual API keys!"
cat > .env << 'EOF'
# Get your keys from:
# - Firecrawl: https://firecrawl.dev
# - OpenAI: https://platform.openai.com/api-keys
# - Database: From your Fiacha .env.local file

FIRECRAWL_API_KEY=your-firecrawl-key-here
OPENAI_API_KEY=your-openai-key-here
DATABASE_URL="your-database-url-here"
LLM_PROVIDER=openai
CRAWL_BATCH_SIZE=5
CRAWL_DELAY_MS=2000
MAX_RETRIES=3
EOF

# Now edit the file with your actual keys
nano .env
echo ""

# 7. Apply database migration
echo "Step 7: Creating database table..."
node check-table.js
echo ""

# 8. Run tests
echo "Step 8: Testing setup..."
npm run test
echo ""

# 9. Test crawl
echo "Step 9: Running test crawl..."
npm run crawl
echo ""

echo "=== Setup Complete! ==="
echo ""
echo "To schedule daily crawls:"
echo "  crontab -e"
echo "  Add: 0 3 * * * cd ~/fiacha/crawler && npm run crawl >> ~/logs/crawl.log 2>&1"
echo ""
echo "To review promises:"
echo "  npm run review"
echo ""
