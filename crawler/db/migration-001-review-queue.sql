-- Migration 001: Create promise_review_queue table
-- This table stores extracted promises awaiting human review before insertion

CREATE TABLE IF NOT EXISTS promise_review_queue (
  id SERIAL PRIMARY KEY,

  -- JSON blob of extracted promise from LLM
  extracted_promise JSONB NOT NULL,

  -- JSON blob of matched politician (or null if no match found)
  politician_match JSONB,

  -- Review status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(100),
  rejection_reason TEXT,

  -- Indexes
  CONSTRAINT promise_review_queue_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Indexes for query performance
CREATE INDEX idx_promise_review_queue_status ON promise_review_queue(status);
CREATE INDEX idx_promise_review_queue_created_at ON promise_review_queue(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE promise_review_queue IS 'Queue of extracted promises awaiting human review before insertion into main promises table';
COMMENT ON COLUMN promise_review_queue.extracted_promise IS 'JSON object containing promise data extracted by LLM';
COMMENT ON COLUMN promise_review_queue.politician_match IS 'JSON object containing matched politician from database (null if no match)';
COMMENT ON COLUMN promise_review_queue.status IS 'Review status: pending (awaiting review), approved (inserted into main DB), rejected (invalid/duplicate)';
