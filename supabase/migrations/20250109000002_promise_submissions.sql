-- Promise Submissions (Review Queue)
-- AI-extracted promises that need human review before being published

CREATE TABLE IF NOT EXISTS promise_submissions (
  id SERIAL PRIMARY KEY,

  -- Extracted politician info (may not match DB exactly)
  politician_name TEXT NOT NULL,
  politician_id INTEGER REFERENCES politicians(id),  -- Matched if found
  party TEXT,

  -- Promise details
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(100),
  target_date DATE,

  -- Source information
  source_url TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL,  -- 'oireachtas', 'rss', 'manual'
  source_title TEXT,                  -- Article/debate title

  -- AI extraction metadata
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  extraction_metadata JSONB,          -- Full AI response, model used, etc.

  -- Review workflow
  status VARCHAR(50) DEFAULT 'pending_review',  -- pending_review, approved, rejected, duplicate
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- If approved, links to created promise
  approved_promise_id INTEGER REFERENCES promises(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promise_submissions_status ON promise_submissions(status);
CREATE INDEX IF NOT EXISTS idx_promise_submissions_politician ON promise_submissions(politician_id);
CREATE INDEX IF NOT EXISTS idx_promise_submissions_source ON promise_submissions(source_type);
CREATE INDEX IF NOT EXISTS idx_promise_submissions_created ON promise_submissions(created_at DESC);

-- Comments
COMMENT ON TABLE promise_submissions IS 'AI-extracted promises pending human review';
COMMENT ON COLUMN promise_submissions.confidence_score IS 'AI confidence 0-100, higher = more likely a real promise';
COMMENT ON COLUMN promise_submissions.extraction_metadata IS 'Full AI response including model, tokens, source context';
