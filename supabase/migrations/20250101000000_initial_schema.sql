-- Initial schema: Core tables for politicians, promises, evidence, etc.

-- Politicians table
CREATE TABLE IF NOT EXISTS politicians (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  party VARCHAR(100),
  constituency VARCHAR(100),
  role VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promises table
CREATE TABLE IF NOT EXISTS promises (
  id SERIAL PRIMARY KEY,
  politician_id INTEGER REFERENCES politicians(id),
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(100),
  promise_date DATE,
  target_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, kept, broken, compromised
  score INTEGER CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evidence/sources table
CREATE TABLE IF NOT EXISTS evidence (
  id SERIAL PRIMARY KEY,
  promise_id INTEGER REFERENCES promises(id),
  source_type VARCHAR(50), -- media, social, parliamentary, campaign
  source_url TEXT,
  title TEXT,
  description TEXT,
  published_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status history table
CREATE TABLE IF NOT EXISTS status_history (
  id SERIAL PRIMARY KEY,
  promise_id INTEGER REFERENCES promises(id),
  status VARCHAR(50) NOT NULL,
  score INTEGER,
  rationale TEXT,
  evidence_ids INTEGER[],
  changed_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  promise_id INTEGER REFERENCES promises(id),
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_promises_politician ON promises(politician_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_category ON promises(category);
CREATE INDEX IF NOT EXISTS idx_evidence_promise ON evidence(promise_id);
CREATE INDEX IF NOT EXISTS idx_status_history_promise ON status_history(promise_id);
CREATE INDEX IF NOT EXISTS idx_milestones_promise ON milestones(promise_id);

