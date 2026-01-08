-- Migration: Add search indexes for performance
-- Adds full-text search on promises and GIN index for JSONB review queue

-- Step 1: Install pg_trgm extension for trigram search (fuzzy matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Add trigram indexes for fuzzy text search on promises
CREATE INDEX IF NOT EXISTS idx_promises_title_trgm ON promises USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_promises_description_trgm ON promises USING gin (description gin_trgm_ops);

-- Step 3: Add full-text search index on promises (combined title + description)
CREATE INDEX IF NOT EXISTS idx_promises_fts ON promises USING gin (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);

-- Step 4: Add GIN index for JSONB search in review queue
CREATE INDEX IF NOT EXISTS idx_review_queue_extracted_promise ON promise_review_queue USING gin (extracted_promise);
CREATE INDEX IF NOT EXISTS idx_review_queue_politician_match ON promise_review_queue USING gin (politician_match);

-- Step 5: Add performance indexes for common queries
-- Politicians by party
CREATE INDEX IF NOT EXISTS idx_politicians_party_id ON politicians(party_id) WHERE active = true;

-- Politicians by county
CREATE INDEX IF NOT EXISTS idx_politicians_county_id ON politicians(county_id) WHERE active = true;

-- Politicians by position type
CREATE INDEX IF NOT EXISTS idx_politicians_position_type ON politicians(position_type) WHERE active = true;

-- Promises by status
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);

-- Promises by category
CREATE INDEX IF NOT EXISTS idx_promises_category ON promises(category);

-- Promises by politician
CREATE INDEX IF NOT EXISTS idx_promises_politician_id ON promises(politician_id);

-- Review queue by status (for pending items)
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON promise_review_queue(status);

-- Counties and local authorities for quick lookups
CREATE INDEX IF NOT EXISTS idx_counties_province ON counties(province);
CREATE INDEX IF NOT EXISTS idx_local_authorities_county_id ON local_authorities(county_id);

-- Parties slug lookup (already added in previous migration but ensure it exists)
CREATE INDEX IF NOT EXISTS idx_parties_slug ON parties(slug);
