-- AI Features Migration
-- Adds tables and columns for AI-powered promise extraction, cost tracking, and similarity matching
-- See docs/AI-FEATURES-TECHNICAL-SPEC.md for full specification

-- ============================================================================
-- ENABLE PGVECTOR EXTENSION
-- ============================================================================
-- Required for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- AI USAGE TRACKING
-- ============================================================================
-- Logs every AI API call for cost monitoring and debugging

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id SERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,           -- 'promise-extractor', 'evidence-finder', 'chatbot', 'summarizer'
  model TEXT NOT NULL,                -- 'claude-3-5-haiku-20241022'
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,   -- Calculated cost in USD
  metadata JSONB,                     -- Additional context: source_url, politician_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by date (daily cost reports)
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_date ON ai_usage_log(created_at);

-- Index for querying by agent (per-agent cost analysis)
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_agent ON ai_usage_log(agent_name);

-- ============================================================================
-- AI BUDGET TRACKING
-- ============================================================================
-- Tracks daily spending against budget limits
-- Pre-request checks query this to enforce budget limits

CREATE TABLE IF NOT EXISTS ai_budget (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,
  requests_count INTEGER DEFAULT 0,
  budget_limit_usd DECIMAL(10, 4) DEFAULT 10.00  -- $10/day default
);

-- ============================================================================
-- PROMISE EMBEDDINGS
-- ============================================================================
-- Add vector column for similarity search (384-dim for all-MiniLM-L6-v2)
-- Used to detect duplicate promises before insertion

ALTER TABLE promises ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Note: Vector index should be created after initial embeddings are populated
-- Uncomment and run manually when ready:
-- CREATE INDEX idx_promises_embedding ON promises USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- EVIDENCE SUGGESTIONS
-- ============================================================================
-- AI-suggested evidence for promise status changes
-- Goes through human review before being added to main evidence table

CREATE TABLE IF NOT EXISTS evidence_suggestions (
  id SERIAL PRIMARY KEY,
  promise_id INTEGER REFERENCES promises(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,                       -- Relevant excerpt from the source
  relevance_score DECIMAL(3, 2),      -- AI confidence score (0.00-1.00)
  verified BOOLEAN DEFAULT FALSE,     -- Has a human reviewed this?
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up suggestions by promise
CREATE INDEX IF NOT EXISTS idx_evidence_suggestions_promise ON evidence_suggestions(promise_id);

-- ============================================================================
-- AI SUMMARIES CACHE
-- ============================================================================
-- Cached AI-generated summaries for parties, counties, politicians
-- Regenerated weekly to save API costs

CREATE TABLE IF NOT EXISTS ai_summaries (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,          -- 'party', 'county', 'politician'
  entity_id INTEGER NOT NULL,         -- References party.id, county.id, or politician.id
  summary_type TEXT NOT NULL,         -- 'promises_overview', 'track_record', 'key_issues'
  content TEXT NOT NULL,              -- The generated summary text
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Index for looking up summaries by entity
CREATE INDEX IF NOT EXISTS idx_ai_summaries_entity ON ai_summaries(entity_type, entity_id);

-- Index for finding expired summaries
CREATE INDEX IF NOT EXISTS idx_ai_summaries_expires ON ai_summaries(expires_at);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if daily budget is exceeded
CREATE OR REPLACE FUNCTION check_ai_budget(check_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  remaining_usd DECIMAL(10, 4),
  is_exceeded BOOLEAN,
  total_spent DECIMAL(10, 4),
  budget_limit DECIMAL(10, 4)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(b.budget_limit_usd - b.total_cost_usd, 10.00) as remaining_usd,
    COALESCE(b.total_cost_usd >= b.budget_limit_usd, FALSE) as is_exceeded,
    COALESCE(b.total_cost_usd, 0.00) as total_spent,
    COALESCE(b.budget_limit_usd, 10.00) as budget_limit
  FROM ai_budget b
  WHERE b.date = check_date
  UNION ALL
  SELECT 10.00, FALSE, 0.00, 10.00
  WHERE NOT EXISTS (SELECT 1 FROM ai_budget WHERE date = check_date)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to log AI usage and update daily budget
CREATE OR REPLACE FUNCTION log_ai_usage(
  p_agent_name TEXT,
  p_model TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_cost_usd DECIMAL(10, 6),
  p_metadata JSONB DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_log_id INTEGER;
BEGIN
  -- Insert usage log
  INSERT INTO ai_usage_log (agent_name, model, input_tokens, output_tokens, cost_usd, metadata)
  VALUES (p_agent_name, p_model, p_input_tokens, p_output_tokens, p_cost_usd, p_metadata)
  RETURNING id INTO v_log_id;

  -- Update daily budget (upsert)
  INSERT INTO ai_budget (date, total_cost_usd, requests_count)
  VALUES (CURRENT_DATE, p_cost_usd, 1)
  ON CONFLICT (date) DO UPDATE SET
    total_cost_usd = ai_budget.total_cost_usd + EXCLUDED.total_cost_usd,
    requests_count = ai_budget.requests_count + 1;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ai_usage_log IS 'Logs all AI API calls for cost tracking and debugging';
COMMENT ON TABLE ai_budget IS 'Daily spending tracking against $10/day budget limit';
COMMENT ON TABLE evidence_suggestions IS 'AI-suggested evidence pending human review';
COMMENT ON TABLE ai_summaries IS 'Cached AI-generated summaries with 7-day TTL';
COMMENT ON COLUMN promises.embedding IS '384-dim vector for similarity search (all-MiniLM-L6-v2)';
