#!/bin/bash
# Fiacha Crawler - EC2 Deployment Script
# This script deploys the crawler to your existing EC2 instance

set -e  # Exit on error

EC2_HOST="54.229.30.58"
EC2_USER="ubuntu"  # Change if using different user (ec2-user for Amazon Linux)
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"  # Override with SSH_KEY env var if needed

echo "╔════════════════════════════════════════════════╗"
echo "║   Fiacha Crawler - EC2 Deployment             ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Target: $EC2_USER@$EC2_HOST"
echo "SSH Key: $SSH_KEY"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at: $SSH_KEY"
    echo "   Please set SSH_KEY environment variable or place key at ~/.ssh/id_rsa"
    exit 1
fi

# Test SSH connection
echo "[1/8] Testing SSH connection..."
if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo '✓ Connected'" 2>/dev/null; then
    echo "✓ SSH connection successful"
else
    echo "❌ Cannot connect to EC2 instance"
    echo "   Make sure:"
    echo "   1. Security group allows SSH from your IP"
    echo "   2. SSH key is correct"
    echo "   3. Instance is running"
    exit 1
fi

# Install dependencies on EC2
echo ""
echo "[2/8] Installing dependencies on EC2..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    echo "  • Updating system packages..."
    sudo apt-get update -qq > /dev/null 2>&1 || true

    echo "  • Checking Node.js..."
    if ! command -v node &> /dev/null; then
        echo "  • Installing Node.js 20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
        sudo apt-get install -y nodejs > /dev/null 2>&1
    fi

    NODE_VERSION=$(node --version)
    echo "  ✓ Node.js $NODE_VERSION installed"

    echo "  • Checking Git..."
    if ! command -v git &> /dev/null; then
        echo "  • Installing Git..."
        sudo apt-get install -y git > /dev/null 2>&1
    fi
    echo "  ✓ Git installed"
ENDSSH

# Create directory structure
echo ""
echo "[3/8] Creating directory structure..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    mkdir -p ~/fiacha-crawler
    mkdir -p ~/logs
    echo "  ✓ Directories created"
ENDSSH

# Copy crawler files
echo ""
echo "[4/8] Copying crawler files to EC2..."
echo "  • Syncing files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude '*.log' \
    -e "ssh -i $SSH_KEY" \
    "$(pwd)/" \
    "$EC2_USER@$EC2_HOST:~/fiacha-crawler/" | grep -v "^sending\|^sent\|^total"

echo "  ✓ Files copied"

# Copy .env file (sensitive)
echo ""
echo "[5/8] Copying environment configuration..."
if [ -f "$(pwd)/.env" ]; then
    scp -i "$SSH_KEY" "$(pwd)/.env" "$EC2_USER@$EC2_HOST:~/fiacha-crawler/.env"
    echo "  ✓ .env file copied"
else
    echo "  ⚠️  No .env file found locally"
    echo "  You'll need to create it manually on EC2"
fi

# Install npm dependencies
echo ""
echo "[6/8] Installing npm dependencies..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd ~/fiacha-crawler
    echo "  • Running npm install..."
    npm install --production > /dev/null 2>&1
    echo "  ✓ Dependencies installed"
ENDSSH

# Apply database migration
echo ""
echo "[7/8] Applying database migration..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd ~/fiacha-crawler
    echo "  • Creating promise_review_queue table..."
    node check-table.js 2>&1 | grep -E "✓|✗"
ENDSSH

# Test the crawler
echo ""
echo "[8/8] Testing crawler..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd ~/fiacha-crawler
    echo "  • Running system tests..."
    npm run test 2>&1 | grep -E "Tests completed|passed|failed"
ENDSSH

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   ✓ Deployment Complete!                      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. SSH to instance: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST"
echo "  2. Run crawler: cd ~/fiacha-crawler && npm run crawl"
echo "  3. Review promises: npm run review"
echo "  4. Set up cron (see instructions below)"
echo ""
echo "To schedule daily crawls at 3am:"
echo "  ssh -i $SSH_KEY $EC2_USER@$EC2_HOST"
echo "  crontab -e"
echo "  Add line: 0 3 * * * cd ~/fiacha-crawler && npm run crawl >> ~/logs/crawl.log 2>&1"
echo ""
