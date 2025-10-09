#!/bin/bash

# Deploy to Fly.io staging environment
# Usage: ./scripts/deploy-staging.sh

set -e

APP_NAME="fiacha-staging"
CONFIG_FILE="fly.staging.toml"

echo "🚀 Deploying to staging environment ($APP_NAME)..."

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
  echo "1. Apply migrations: ./scripts/apply-migrations-fly.sh $APP_NAME"
  echo "2. Verify deployment: flyctl status -a $APP_NAME"
  echo "3. Check logs: flyctl logs -a $APP_NAME"
else
  echo "❌ Deployment failed!"
  exit 1
fi
