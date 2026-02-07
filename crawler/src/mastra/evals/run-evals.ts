/**
 * Eval Runner
 *
 * Runs extraction quality tests against curated test cases.
 * Can be run via: npx tsx crawler/src/mastra/evals/run-evals.ts
 * Or via npm script: npm run eval
 *
 * Exit code 0 if average score >= 0.6, exit code 1 otherwise.
 */

import { extractionQualityScorer } from './extraction-quality.js';
import { matchingAccuracyScorer } from './matching-accuracy.js';
import { TEST_CASES, type TestCase } from './test-cases.js';
import { extractPromises } from '../../ai/agents/promise-extractor.js';
import { PoliticianMatcher, normalizePoliticianName } from '../../validators/politician-matcher.js';
import { createDatabaseClient } from '../../database/client.js';
import { isAIConfigured } from '../../ai/index.js';

const MIN_AVERAGE_SCORE = 0.6;

interface EvalResult {
  testCase: string;
  extractionScore: number;
  extractionReason?: string;
  matchingScore: number;
  promisesFound: number;
  expected: number;
  passed: boolean;
}

async function runExtractionEval(
  testCase: TestCase,
  matcher: PoliticianMatcher
): Promise<EvalResult> {
  console.log(`\n  [${testCase.id}] ${testCase.name}`);

  // Run extraction
  const promises = await extractPromises(
    testCase.content,
    testCase.sourceUrl,
    30 // lower threshold for eval
  );

  console.log(`    Extracted: ${promises.length} (expected: ${testCase.expectedPromiseCount})`);

  // Run matching on extracted promises
  const matches = promises.map((p) => {
    const normalizedName = normalizePoliticianName(p.politician_name);
    const match = matcher.findPolitician(normalizedName, p.party || undefined, undefined);
    return {
      inputName: p.politician_name,
      matchedName: match?.name || null,
      matchScore: match?.matchScore || 0,
      isExactMatch: match?.isExactMatch || false,
    };
  });

  // Score extraction quality
  const extractionResult = await extractionQualityScorer.run({
    output: {
      content: testCase.content,
      promises: promises.map((p) => ({
        politician_name: p.politician_name,
        promise_title: p.title || '',
        description: p.promise_text,
        confidence: p.confidence,
      })),
    },
    groundTruth: {
      expectedPromiseCount: testCase.expectedPromiseCount,
      expectedPoliticians: testCase.expectedPoliticians,
    },
  });

  // Score matching accuracy
  const matchingResult = await matchingAccuracyScorer.run({
    output: { matches },
  });

  const extractionScore =
    typeof extractionResult.score === 'number' ? extractionResult.score : 0;
  const matchingScore =
    typeof matchingResult.score === 'number' ? matchingResult.score : 0;

  console.log(
    `    Extraction: ${extractionScore.toFixed(2)} | Matching: ${matchingScore.toFixed(2)}`
  );
  if (extractionResult.reason) {
    console.log(`    Reason: ${extractionResult.reason}`);
  }

  return {
    testCase: testCase.id,
    extractionScore,
    extractionReason:
      typeof extractionResult.reason === 'string'
        ? extractionResult.reason
        : undefined,
    matchingScore,
    promisesFound: promises.length,
    expected: testCase.expectedPromiseCount,
    passed: extractionScore >= MIN_AVERAGE_SCORE,
  };
}

async function main() {
  console.log('Fiacha Extraction Quality Evaluation');
  console.log('====================================\n');

  if (!isAIConfigured()) {
    console.error('ANTHROPIC_API_KEY is not set. Cannot run evals.');
    process.exit(1);
  }

  // Initialize matcher for matching accuracy scorer
  let matcher: PoliticianMatcher;
  const db = createDatabaseClient();

  try {
    const dbHealthy = await db.healthCheck();
    if (dbHealthy) {
      const politicians = await db.getAllPoliticians();
      matcher = new PoliticianMatcher(politicians);
      console.log(`Loaded ${politicians.length} politicians for matching`);
    } else {
      console.warn('DB not available — using empty matcher');
      matcher = new PoliticianMatcher([]);
    }
  } catch {
    console.warn('DB connection failed — using empty matcher');
    matcher = new PoliticianMatcher([]);
  }

  const results: EvalResult[] = [];

  for (const testCase of TEST_CASES) {
    try {
      const result = await runExtractionEval(testCase, matcher);
      results.push(result);
    } catch (error) {
      console.error(
        `  [${testCase.id}] Error: ${error instanceof Error ? error.message : String(error)}`
      );
      results.push({
        testCase: testCase.id,
        extractionScore: 0,
        matchingScore: 0,
        promisesFound: 0,
        expected: testCase.expectedPromiseCount,
        passed: false,
      });
    }
  }

  // Summary
  console.log('\n\nResults Summary');
  console.log('===============');

  const avgExtraction =
    results.reduce((sum, r) => sum + r.extractionScore, 0) / results.length;
  const avgMatching =
    results.reduce((sum, r) => sum + r.matchingScore, 0) / results.length;
  const passCount = results.filter((r) => r.passed).length;

  console.log(`\n  Test cases:       ${results.length}`);
  console.log(`  Passed:           ${passCount}/${results.length}`);
  console.log(`  Avg extraction:   ${avgExtraction.toFixed(3)}`);
  console.log(`  Avg matching:     ${avgMatching.toFixed(3)}`);
  console.log(`  Threshold:        ${MIN_AVERAGE_SCORE}`);

  // Table
  console.log('\n  ID                          | Extract | Match  | Found/Exp | Pass');
  console.log('  ' + '-'.repeat(75));
  for (const r of results) {
    console.log(
      `  ${r.testCase.padEnd(29)} | ${r.extractionScore.toFixed(2).padStart(7)} | ${r.matchingScore.toFixed(2).padStart(6)} | ${String(r.promisesFound).padStart(5)}/${String(r.expected).padEnd(3)} | ${r.passed ? 'PASS' : 'FAIL'}`
    );
  }

  await db.close();

  if (avgExtraction < MIN_AVERAGE_SCORE) {
    console.error(
      `\nFAILED: Average extraction score ${avgExtraction.toFixed(3)} < ${MIN_AVERAGE_SCORE}`
    );
    process.exit(1);
  }

  console.log(
    `\nPASSED: Average extraction score ${avgExtraction.toFixed(3)} >= ${MIN_AVERAGE_SCORE}`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error('Eval runner failed:', error);
  process.exit(1);
});
