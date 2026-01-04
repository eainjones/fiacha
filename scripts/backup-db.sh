#!/bin/bash
# Pre-migration database backup script
# Usage: ./scripts/backup-db.sh [staging|production]

set -e

ENV="${1:-staging}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

if [ "$ENV" = "production" ]; then
    echo "⚠️  PRODUCTION BACKUP"
    echo "Project: hgjefllkbbwevpyiazhx"
    BACKUP_FILE="$BACKUP_DIR/production-$TIMESTAMP.sql"
    supabase db dump -f "$BACKUP_FILE" --project-ref hgjefllkbbwevpyiazhx
elif [ "$ENV" = "staging" ]; then
    echo "📦 Staging backup"
    echo "Project: phifyhudywiuqgwezumh"
    BACKUP_FILE="$BACKUP_DIR/staging-$TIMESTAMP.sql"
    supabase db dump -f "$BACKUP_FILE" --linked
else
    echo "Usage: ./scripts/backup-db.sh [staging|production]"
    exit 1
fi

echo "✓ Backup saved: $BACKUP_FILE"
echo "  Size: $(du -h "$BACKUP_FILE" | cut -f1)"
