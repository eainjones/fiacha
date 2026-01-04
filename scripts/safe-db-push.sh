#!/bin/bash
# Safe database push with backup and confirmation
# Usage: ./scripts/safe-db-push.sh [staging|production]

set -e

ENV="${1:-staging}"

echo "========================================="
echo "  SAFE DATABASE MIGRATION PUSH"
echo "========================================="
echo ""

if [ "$ENV" = "production" ]; then
    echo "🚨 TARGET: PRODUCTION DATABASE"
    echo "   Project: hgjefllkbbwevpyiazhx"
    echo ""
    read -p "Type 'PRODUCTION' to confirm: " CONFIRM
    if [ "$CONFIRM" != "PRODUCTION" ]; then
        echo "Aborted."
        exit 1
    fi
    PROJECT_REF="hgjefllkbbwevpyiazhx"
else
    echo "📦 TARGET: Staging database"
    echo "   Project: phifyhudywiuqgwezumh (linked)"
    PROJECT_REF=""
fi

echo ""
echo "Step 1: Creating backup..."
./scripts/backup-db.sh "$ENV"

echo ""
echo "Step 2: Checking pending migrations..."
if [ -n "$PROJECT_REF" ]; then
    supabase migration list --project-ref "$PROJECT_REF"
else
    supabase migration list --linked
fi

echo ""
read -p "Proceed with push? (y/N): " PROCEED
if [ "$PROCEED" != "y" ] && [ "$PROCEED" != "Y" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Step 3: Pushing migrations..."
if [ -n "$PROJECT_REF" ]; then
    supabase db push --project-ref "$PROJECT_REF"
else
    supabase db push --linked
fi

echo ""
echo "✓ Migration complete!"
