/**
 * Prompt templates for LLM promise extraction
 * Based on RESEARCHER-GUIDE.md quality standards
 */

export const PROMISE_EXTRACTION_SYSTEM_PROMPT = `You are an expert political analyst specializing in tracking Irish political promises.

Your job is to extract SPECIFIC, MEASURABLE political promises from Irish political content.

PROMISE CRITERIA (from Fiacha Researcher Guide):
1. SPECIFIC - Must have concrete details, not vague statements
   ✓ "Build 300,000 homes by 2030"
   ✗ "Improve housing situation"

2. ACTIONABLE - Something that can be done or measured
   ✓ "Reduce income tax by 2% for earners under €100k"
   ✗ "Support workers"

3. TIME-BOUND - Has explicit or implied deadline
   ✓ "Introduce statutory home care scheme in first year"
   ✓ "Pass legislation this term"
   ✗ "Eventually improve healthcare"

4. PUBLIC - Made in official capacity (speeches, manifestos, interviews)

TITLE FORMAT:
- Start with action verb (Build, Deliver, Increase, Reduce, Introduce, Create, etc.)
- Include specific numbers when available
- Keep under 100 characters
- Examples:
  ✓ "Build 100,000 affordable homes"
  ✓ "Reduce waiting lists by 50% within 2 years"
  ✓ "Introduce free GP care for all children"

CATEGORIES:
Housing, Health, Childcare, Education, Transport, Climate, Employment, Taxation, Social Welfare, Law & Order, Infrastructure, Other

CONFIDENCE SCORING:
- 90-100: Direct quote with specific numbers and deadline
- 70-89: Clear commitment with most details
- 50-69: Commitment but missing some specifics
- 30-49: Implied commitment or vague promise
- 0-29: Too vague, reject

IMPORTANT:
- Only extract promises that meet ALL criteria above
- Return empty array if no valid promises found
- Include direct quotes when available
- Note the politician's name and party if mentioned`;

export function buildPromiseExtractionPrompt(
  content: string,
  sourceUrl: string,
  sourceType: 'media' | 'parliamentary' | 'manifesto' | 'press_release',
  sourceTitle?: string
): string {
  return `Analyze this Irish political content and extract SPECIFIC commitments, targets, or achievements.

SOURCE TYPE: ${sourceType}
SOURCE URL: ${sourceUrl}

CONTENT:
${content}

WHAT TO EXTRACT:
- Future promises ("will build X homes by YEAR")
- Current targets ("aiming for X by YEAR")
- Recent achievements with numbers ("delivered X homes in 2024")
- Policy commitments ("introducing new scheme")
- Funding announcements ("€X million investment")

EXTRACTION RULES:
1. Must have SPECIFIC details (numbers, amounts, quantities)
2. Must be ACTIONABLE and MEASURABLE
3. Can be past achievement, current target, or future promise
4. Title format: [Action Verb] + [Specific Number/Details] + [Timeline if available]
   Examples:
   - "Deliver 54,000 homes in 2024"
   - "Invest €4 billion in housing"
   - "Build 300,000 homes by 2030"

5. Only include if mentioned by/attributed to Irish Government, Ministers, TDs, or Councillors
6. Be LENIENT - if it has a specific number or target, include it

Return JSON in this exact format. If no valid promises are found, return {"promises": []}.

RESPONSE FORMAT (JSON only, no markdown):
{
  "promises": [
    {
      "politician_name": "Full Name OR 'Government' OR 'Coalition Government' if no specific person mentioned",
      "party": "Party Name OR 'Coalition Government' OR 'Government' - NEVER leave empty",
      "promise_title": "Action Verb + Specific Details + Timeline",
      "description": "Full context with direct quote if available. Include details about conditions, scope, and timeline.",
      "category": "Housing|Health|Education|Transport|Climate|Employment|Taxation|Social Welfare|Law & Order|Infrastructure|Childcare|Other",
      "promise_date": "YYYY-MM-DD (date promise was made, use article date if not specified)",
      "target_date": "YYYY-MM-DD or null (when promise should be fulfilled)",
      "quote": "Direct quote from source if available",
      "confidence": 0-100,
      "source_url": "${sourceUrl}",
      "source_type": "${sourceType}"
    }
  ]
}

Remember: Quality over quantity. Only extract promises that are SPECIFIC and MEASURABLE. Return {"promises": []} if none found.`;
}

/**
 * Validation prompt to verify extracted promises meet quality standards
 */
export function buildValidationPrompt(promises: any[]): string {
  return `Review these extracted political promises and validate they meet Fiacha quality standards.

PROMISES:
${JSON.stringify(promises, null, 2)}

VALIDATION CRITERIA:
1. Title starts with action verb (Build, Deliver, Introduce, etc.)
2. Promise is specific with measurable outcomes
3. Not a vague aspiration (e.g., "improve things")
4. Has reasonable confidence score (>30)
5. Category is correct
6. Description provides full context

For each promise, return:
{
  "valid": true/false,
  "reason": "why valid or invalid",
  "suggested_fixes": "improvements if needed"
}

Return JSON array matching the input order.`;
}
