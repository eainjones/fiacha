# AI Features Technical Specification

**Version:** 1.1
**Date:** January 2026
**Status:** Approved - Implementation in Progress
**Author:** AI Implementation Team

---

## Review Status

### Team1 Review (Jan 6, 2026)
**Status:** Approved with immediate actions.

**Key Decisions:**
1.  **Go/No-Go:** Proceeding with Phase 1 immediately.
2.  **Safety First:** Budget SQL is a **pre-requisite** before production deployment.
3.  **Vector DB:** Confirmed Supabase supports `pgvector`.
4.  **Integration Point:** Heavy agents in `crawler/`, chatbot in `app/api/chat`.

### Team2 Review (Jan 8, 2026) - RESOLVED

| Issue | Resolution |
|-------|------------|
| Embedding dimension mismatch | **Using 384-dim** (`all-MiniLM-L6-v2`) - faster, smaller storage |
| Scheduling location | **Vercel Cron → API endpoint** - API triggers crawler runs |
| Schema definition drift | **Consolidated** - using `SERIAL PRIMARY KEY` for new tables |
| Category mismatch | **Defined canonical list** - 12 categories aligned with app |
| ID type mismatch | **Using INTEGER** - matches existing `promises.id` type |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [AI Models Selection](#ai-models-selection)
3. [Architecture Overview](#architecture-overview)
4. [Framework Selection: Mastra](#framework-selection-mastra)
5. [Budget & Cost Management](#budget--cost-management)
6. [Implementation Phases](#implementation-phases)
7. [Database Schema Changes](#database-schema-changes)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Success Metrics](#success-metrics)
11. [Risks & Mitigations](#risks--mitigations)
12. [Open Questions](#open-questions)

---

## Executive Summary

This document outlines the technical approach for adding AI-powered features to Fiacha, including automated promise extraction, evidence gathering, similarity matching, summarization, and a chatbot interface.

### Goals
- Automate promise extraction from news and council documents
- Match extracted promises to politicians in our database
- Find evidence for/against promise completion
- Detect duplicate promises
- Provide AI-powered Q&A about promises and politicians

### Constraints
- **Budget:** $10/day ($100/month maximum)
- **Priority:** Promise extraction first (enhance existing crawler)
- **Framework:** Mastra (TypeScript-native, MCP support)

---

## AI Models Selection

### Primary Model: Claude 3.5 Haiku

| Attribute | Details |
|-----------|---------|
| **Model ID** | `claude-3-5-haiku-20241022` |
| **Provider** | Anthropic |
| **Input Cost** | $0.80 / 1M tokens |
| **Output Cost** | $4.00 / 1M tokens |
| **Context Window** | 200K tokens |
| **Use Cases** | Promise extraction, evidence finding, chatbot, summarization |

**Rationale:**
- Cost-efficient for high-volume extraction tasks
- Fast response times (ideal for crawler integration)
- Strong instruction-following for structured output
- Same API as Claude Sonnet/Opus (easy to upgrade if needed)

### Alternative Models Considered

| Model | Cost (Input/Output) | Reason Not Selected |
|-------|---------------------|---------------------|
| Claude 3.5 Sonnet | $3 / $15 per 1M | 4x more expensive, overkill for extraction |
| GPT-4o-mini | $0.15 / $0.60 per 1M | Cheaper but less reliable structured output |
| Llama 3.1 (local) | Free | Requires infrastructure, slower, less accurate |

### Embedding Model: Local Sentence Transformers

| Attribute | Details |
|-----------|---------|
| **Model** | `all-MiniLM-L6-v2` |
| **Dimension** | **384** (fixed) |
| **Cost** | $0 (runs locally) |
| **Use Cases** | Promise similarity/deduplication |

**Rationale:**
- No API costs for embeddings
- Fast local inference (~10ms per embedding)
- 384-dim is sufficient for similarity detection
- Smaller storage footprint than 1536-dim alternatives
- pgvector compatible

---

## Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FIACHA AI ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐           │
│   │  Firecrawl   │────▶│   Mastra     │────▶│   Supabase   │           │
│   │  (Scraping)  │     │  (AI Agent)  │     │  (Storage)   │           │
│   └──────────────┘     └──────────────┘     └──────────────┘           │
│          │                    │                    │                    │
│          ▼                    ▼                    ▼                    │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐           │
│   │ Raw HTML/    │     │ Promise      │     │ Review Queue │           │
│   │ Markdown     │     │ Extractor    │     │ + Embeddings │           │
│   └──────────────┘     │ Agent        │     └──────────────┘           │
│                        └──────────────┘                                 │
│                               │                                         │
│                        ┌──────┴──────┐                                  │
│                        ▼             ▼                                  │
│                 ┌──────────┐  ┌──────────┐                              │
│                 │ Evidence │  │ Chatbot  │                              │
│                 │ Finder   │  │ Agent    │                              │
│                 └──────────┘  └──────────┘                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Technology | Purpose |
|-----------|------------|---------|
| Web Scraping | Firecrawl | Extract content from news/council sites |
| AI Orchestration | Mastra | Manage AI agents, tools, workflows |
| LLM Provider | Anthropic (Claude Haiku) | Promise extraction, analysis |
| Vector DB | Supabase + pgvector | Store embeddings, similarity search |
| Embeddings | Local (sentence-transformers) | Generate promise embeddings |
| Scheduling | Vercel Cron → API endpoint | Cron triggers API, API triggers crawler |
| Cost Tracking | Custom PostgreSQL tables | Monitor and limit spending |

**Scheduling Architecture:**
```
Vercel Cron (6am daily) → POST /api/cron/run-crawler → Crawler executes
```
This keeps scheduling centralized in Vercel while allowing crawler to run anywhere.

---

## Framework Selection: Mastra

### Why Mastra?

| Feature | Benefit for Fiacha |
|---------|-------------------|
| **TypeScript-native** | Seamless integration with Next.js/crawler codebase |
| **MCP Support** | Future integration with Claude Code tools |
| **Structured Output** | Zod schema validation for promise extraction |
| **Tool System** | Easy to add web search, database queries |
| **Open Source** | No vendor lock-in, MIT licensed |
| **Active Development** | Regular updates, growing community |

### Mastra vs Alternatives

| Framework | Pros | Cons |
|-----------|------|------|
| **Mastra** | TypeScript, MCP, simple API | Newer, smaller community |
| LangChain.js | Large ecosystem, docs | Overengineered, Python-first |
| Vercel AI SDK | Simple streaming | Limited agent capabilities |
| Custom | Full control | More maintenance |

### Mastra Agent Structure

```typescript
import { Agent, Tool } from '@mastra/core';

const promiseExtractorAgent = new Agent({
  name: 'promise-extractor',
  model: {
    provider: 'anthropic',
    name: 'claude-3-5-haiku-20241022',
  },
  instructions: `You are an expert at identifying political promises...`,
  tools: [budgetCheckerTool, politicianLookupTool],
});
```

---

## Budget & Cost Management

### Daily Budget: $10/day

| Feature | Allocation | Est. Tokens/Day | Est. Cost |
|---------|------------|-----------------|-----------|
| Promise Extraction | 50% | ~500K in, ~100K out | ~$4-5/day |
| Evidence Finding | 25% | ~200K in, ~50K out | ~$2-3/day |
| Chatbot | 20% | ~150K in, ~30K out | ~$1-2/day |
| Summarization | 5% | ~50K in, ~10K out | ~$0.50/day |

### Cost Control Mechanisms

1. **Database Budget Tracking**
   ```sql
   CREATE TABLE ai_budget (
     date DATE PRIMARY KEY,
     total_cost_usd DECIMAL(10, 4) DEFAULT 0,
     budget_limit_usd DECIMAL(10, 4) DEFAULT 10.00
   );
   ```

2. **Pre-Request Budget Check**
   - Before each API call, check remaining daily budget
   - If budget exceeded, queue request for next day or reject

3. **Token Estimation**
   - Estimate tokens before sending (using tiktoken)
   - Reject requests that would exceed budget

4. **Alerts**
   - Email notification at 80% daily budget
   - Hard stop at 100%

### Cost Logging

```sql
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY,
  agent_name TEXT NOT NULL,      -- 'promise-extractor', 'evidence-finder', etc.
  model TEXT NOT NULL,           -- 'claude-3-5-haiku-20241022'
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,
  metadata JSONB,                -- source_url, politician_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> Team2 comment: Later in the doc, the schema adds `DEFAULT gen_random_uuid()` for `ai_usage_log.id`. Choose one canonical definition to avoid drift.

---

## Implementation Phases

### Phase 1: Promise Extraction (Week 1-2)

**Goal:** Enhance existing crawler with AI-powered promise extraction

**Files to Create:**
| File | Purpose |
|------|---------|
| `crawler/src/ai/mastra-client.ts` | Initialize Mastra with Anthropic |
| `crawler/src/ai/config.ts` | Model configs, costs, limits |
| `crawler/src/ai/agents/promise-extractor.ts` | Main extraction agent |
| `crawler/src/ai/tools/budget-checker.ts` | Cost management |
| `crawler/src/ai/schemas/promise.ts` | Zod schemas for output |
| `supabase/migrations/YYYYMMDD_ai_features.sql` | Database changes |

**Files to Modify:**
| File | Change |
|------|--------|
| `crawler/src/index.ts` | Integrate AI extraction |
| `crawler/src/extractors/ai-extractor.ts` | Replace with Mastra agent |
| `crawler/package.json` | Add dependencies |

**Promise Extraction Agent Prompt:**
```
You are an expert at identifying political promises in Irish news and council documents.

Extract promises that are:
- Specific commitments (not vague aspirations)
- Attributed to a named politician
- Verifiable (can be checked for completion)

For each promise, extract:
- politician_name: The full name of the politician
- party: Their political party if mentioned
- promise_text: The exact promise in their words
- category: One of the CANONICAL CATEGORIES below
- target_date: Any mentioned deadline (null if none)
- confidence: Your confidence this is a real promise (0-100)

CANONICAL CATEGORIES (use exactly these values):
Housing, Health, Childcare, Education, Transport, Climate,
Employment, Taxation, Social Welfare, Law & Order, Infrastructure, Other

Return JSON array of promises. If no promises found, return empty array.
```

### Phase 2: Similarity Matching (Week 2-3)

**Goal:** Detect duplicate promises before insertion

**Approach:**
1. Generate embeddings for all existing promises (one-time migration)
2. For new promises, generate embedding and check similarity
3. Flag potential duplicates (>85% cosine similarity)

**Technical Details:**
- Use `all-MiniLM-L6-v2` (384 dimensions) or `gte-small` (1536 dimensions)
- Run embedding generation locally (no API cost)
- Store in `promises.embedding` column
- Use pgvector's `<=>` operator for cosine distance

### Phase 3: Evidence Finder (Week 3-4)

**Goal:** Automatically find evidence for promise status changes

**Agent Tools:**
- Web search (via Firecrawl or external API)
- Oireachtas API (Dáil/Seanad records)
- Council meeting minutes search

**Scheduled Runs:**
- Vercel cron: Daily at 6am Irish time
- Process 10-20 promises per run
- Budget: Max $3/day

### Phase 4: Chatbot (Week 4-5)

**Goal:** RAG-powered Q&A about promises and politicians

**Implementation:**
- `app/api/chat/route.ts` - Streaming chat API
- `components/Chatbot.tsx` - Floating UI component
- Use promise embeddings for context retrieval
- Budget: 50 messages/day limit

### Phase 5: Summarization (Week 5+)

**Goal:** Auto-generated summaries for parties, counties, politicians

**Implementation:**
- Weekly cron job generates summaries
- Cache in `ai_summaries` table
- Serve from cache (7-day TTL)

---

## Database Schema Changes

**CORRECTED SCHEMA** (addresses Team2 feedback):
- Uses `SERIAL PRIMARY KEY` (INTEGER) to match existing tables
- Uses `vector(384)` for embeddings (all-MiniLM-L6-v2)
- Foreign keys reference INTEGER IDs

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- AI cost tracking (SERIAL to match existing pattern)
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id SERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily budget tracking
CREATE TABLE IF NOT EXISTS ai_budget (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,
  requests_count INTEGER DEFAULT 0,
  budget_limit_usd DECIMAL(10, 4) DEFAULT 10.00
);

-- Promise embeddings for similarity (384-dim for all-MiniLM-L6-v2)
ALTER TABLE promises ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Evidence suggestions from AI (INTEGER foreign key)
CREATE TABLE IF NOT EXISTS evidence_suggestions (
  id SERIAL PRIMARY KEY,
  promise_id INTEGER REFERENCES promises(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  relevance_score DECIMAL(3, 2),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached AI summaries (INTEGER entity_id)
CREATE TABLE IF NOT EXISTS ai_summaries (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,  -- 'party', 'county', 'politician'
  entity_id INTEGER NOT NULL, -- references politician.id, party.id, or county.id
  summary_type TEXT NOT NULL, -- 'promises_overview', 'track_record'
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_date ON ai_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_agent ON ai_usage_log(agent_name);
CREATE INDEX IF NOT EXISTS idx_evidence_promise ON evidence_suggestions(promise_id);
CREATE INDEX IF NOT EXISTS idx_summaries_entity ON ai_summaries(entity_type, entity_id);

-- Vector index for similarity search (384-dim)
-- Note: Only create after promises have embeddings populated
-- CREATE INDEX idx_promises_embedding ON promises USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Security Considerations

### API Key Management
- Store `ANTHROPIC_API_KEY` in Vercel environment variables
- Never log or expose API keys
- Use server-side only (never in client bundle)

### Input Sanitization
- Sanitize scraped content before sending to LLM
- Remove PII from logs
- Limit input size to prevent token abuse

### Rate Limiting
- Implement rate limiting on chatbot endpoint
- IP-based throttling for public chatbot
- User authentication for admin features

### Data Privacy
- Don't send user data to external APIs without consent
- Log only aggregate metrics, not full prompts
- Consider GDPR implications for chatbot conversations

---

## Testing Strategy

### Unit Tests
- Mock Anthropic API responses
- Test budget calculation logic
- Test similarity threshold logic

### Integration Tests
- Test full extraction pipeline with sample documents
- Test chatbot with known questions
- Test evidence finder with known promises

### Manual Testing
- Review sample of 50 extracted promises for accuracy
- Test chatbot with varied question types
- Review evidence suggestions for relevance

### Staging Environment
- Test all AI features on staging before production
- Use lower budget limits ($2/day) on staging
- Monitor for unexpected costs

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Promise Extraction Accuracy | 90%+ | Manual review sample |
| Daily Cost | <$10 | Database tracking |
| False Positive Rate (duplicates) | <5% | Review queue analysis |
| Chatbot Response Time | <3s | P95 latency monitoring |
| Evidence Relevance | 70%+ useful | Manual review |

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API costs exceed budget | High | Medium | Hard budget limits, alerts at 80% |
| Low extraction accuracy | High | Medium | Iterative prompt tuning, human review |
| Hallucinated promises | High | Low | Require source URL, confidence scores |
| pgvector not available | Medium | Low | Supabase has pgvector; fallback to external |
| Rate limiting by Anthropic | Medium | Low | Implement backoff, queue requests |
| Mastra breaking changes | Low | Medium | Pin versions, review changelogs |

---

## Open Questions

1. **pgvector on Supabase** - Need to verify pgvector extension is available on our Supabase plan. May need to request activation.

2. **Embedding model choice** - Should we use 384-dim (faster, smaller) or 1536-dim (more accurate) embeddings?

3. **Chatbot authentication** - Should chatbot be public or require sign-in? Rate limit implications.

4. **Evidence sources** - Which external sources should the evidence finder search? (Oireachtas, news sites, council sites)

5. **Human-in-the-loop** - Should AI-extracted promises go directly to database or always through review queue?

6. **Scaling** - If we need to process more than $10/day worth of content, what's the plan? (Batch processing? Prioritization?)

---

## Environment Variables Required

```bash
# Anthropic API (required)
ANTHROPIC_API_KEY=sk-ant-...

# Budget configuration
AI_DAILY_BUDGET_USD=10
AI_MONTHLY_BUDGET_USD=100

# Feature flags
ENABLE_AI_EXTRACTION=true
ENABLE_AI_CHATBOT=false
ENABLE_AI_EVIDENCE_FINDER=false
ENABLE_AI_SUMMARIZATION=false

# Optional: Alert webhook
AI_BUDGET_ALERT_WEBHOOK=https://hooks.slack.com/...
```

---

## Appendix: Dependencies

```json
{
  "dependencies": {
    "@mastra/core": "^0.1.x",
    "@anthropic-ai/sdk": "^0.32.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/node": "^20.x"
  }
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | AI Team | Initial draft |

---

**Next Steps:**
1. Team review of this document
2. Clarify open questions
3. Approve budget allocation
4. Begin Phase 1 implementation
