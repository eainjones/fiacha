#!/bin/bash

# Simple migration script for Fly.io Postgres
# Usage: ./scripts/apply-migrations-simple.sh <database-app-name>
# Example: ./scripts/apply-migrations-simple.sh fiacha-staging-db

set -e

DB_APP=${1:-fiacha-staging-db}

echo "🗄️  Applying migrations to $DB_APP..."
echo ""

# Check if flyctl is available
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl not found. Please run:"
    echo "   export PATH=\"\$HOME/.fly/bin:\$PATH\""
    exit 1
fi

TEMP_FILE=$(mktemp /tmp/fiacha-migrations-XXXX.sql)
trap 'rm -f "$TEMP_FILE"' EXIT

echo "📦 Combining schema and migration files..."

MIGRATION_FILES=(
    "db/schema.sql"
    "db/migrations/001_add_geographical_hierarchy.sql"
    "db/migrations/002_seed_local_authorities.sql"
    "db/migrations/003_seed_real_politicians.sql"
    "db/migrations/004_seed_real_promises.sql"
    "db/migrations/005_seed_councillors.sql"
)

for file in "${MIGRATION_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing migration file: $file"
        exit 1
    fi
    cat "$file" >> "$TEMP_FILE"
    echo "\n" >> "$TEMP_FILE"
done

echo "✅ Prepared combined migration script: $TEMP_FILE"
echo ""

echo "🚀 Applying migrations to database..."
echo "   This may take 30-60 seconds..."
echo ""

if flyctl postgres connect -a "$DB_APP" < "$TEMP_FILE"; then
    echo ""
    echo "✅ Migrations applied successfully!"
    echo ""

    echo "🔍 Verifying migration..."
    echo ""
    echo "Checking tables..."
    flyctl postgres connect -a "$DB_APP" -c "\\dt" | grep -E "counties|politicians|promises" || echo "Could not verify tables (but migrations may have succeeded)"

    echo ""
    echo "✨ Migration complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Verify deployment: flyctl status -a ${DB_APP%-db}"
    echo "  2. Check data: flyctl postgres connect -a $DB_APP"
    echo "  3. Open app: open https://${DB_APP%-db}.fly.dev"
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if database is ready: flyctl status -a $DB_APP"
    echo "  2. Check logs: flyctl logs -a $DB_APP"
    echo "  3. Try connecting manually: flyctl postgres connect -a $DB_APP"
    echo ""
    echo "Combined migration file left at: $TEMP_FILE"
    exit 1
fi
