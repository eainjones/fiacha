#!/bin/bash

# Deploy to Fly.io production environment
# Usage: ./scripts/deploy-production.sh

set -e

APP_NAME="fiacha-production"
CONFIG_FILE="fly.production.toml"

echo "🚀 Deploying to PRODUCTION environment ($APP_NAME)..."
echo ""
echo "⚠️  WARNING: This will deploy to PRODUCTION!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Deployment cancelled."
  exit 0
fi

# Run tests before deploying
echo "🧪 Running tests..."
npm run test:all

if [ $? -ne 0 ]; then
  echo "❌ Tests failed! Aborting deployment."
  exit 1
fi

echo "✅ Tests passed!"

# Deploy to Fly.io
echo "📦 Building and deploying to Fly.io..."
flyctl deploy --config $CONFIG_FILE --app $APP_NAME

if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "🌐 Application URL: https://$APP_NAME.fly.dev"
  echo ""
  echo "Next steps:"
  echo "1. Verify deployment: flyctl status -a $APP_NAME"
  echo "2. Check logs: flyctl logs -a $APP_NAME"
  echo "3. Monitor health: flyctl checks list -a $APP_NAME"
else
  echo "❌ Deployment failed!"
  exit 1
fi
