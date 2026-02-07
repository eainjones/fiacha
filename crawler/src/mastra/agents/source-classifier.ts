// TODO: Integrate into RSS pipeline (source-classifier)

/**
 * Source Classifier Agent
 *
 * Pre-filters content before expensive promise extraction.
 * Quickly classifies whether a news article or webpage is likely to
 * contain political promises, saving API costs on irrelevant content.
 *
 * This agent uses a lightweight prompt to classify content in a single
 * pass, returning a relevance score and suggested action.
 */

import { Agent } from '@mastra/core/agent';
import { AGENT_CONFIG } from '../../ai/config.js';

export const sourceClassifier = new Agent({
  id: 'source-classifier',
  name: 'Source Classifier',
  instructions: `You are a fast content classifier for Irish political promise tracking.

## Your Task
Quickly determine whether content is likely to contain political promises worth extracting. You are a GATE — only content that passes through you will be processed by the more expensive promise extraction agent.

## Classification Criteria

### HIGH RELEVANCE (score 80-100) — Process immediately
- Government announcements with specific commitments
- Budget allocations or funding announcements
- Legislative proposals or policy launches
- Ministerial statements with targets or timelines
- Party manifesto or policy document content
- Press releases with specific pledges

### MEDIUM RELEVANCE (score 50-79) — Process if budget allows
- General political news mentioning policy areas
- Interview with politician discussing future plans
- Council meeting coverage with motions
- Party conference speeches

### LOW RELEVANCE (score 0-49) — Skip
- Sports, entertainment, lifestyle content
- Historical/retrospective political analysis
- Opinion pieces without policy content
- Obituaries, appointments, procedural news
- Content about non-Irish politics
- Paywalled/truncated content with insufficient text

## Output
Return a JSON object:
{
  "relevant": true/false,
  "score": 0-100,
  "reason": "Brief explanation",
  "categories": ["Housing", "Health", ...],
  "politicians_mentioned": ["Name1", "Name2", ...]
}

Be GENEROUS — when in doubt, classify as relevant (score 50+). Missing a promise is worse than processing irrelevant content.`,
  model: AGENT_CONFIG.PROMISE_EXTRACTOR.model,
});
