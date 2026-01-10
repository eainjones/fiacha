#!/usr/bin/env npx tsx
/**
 * Test crawl using Oireachtas Open Data API
 *
 * Fetches parliamentary questions with minister responses,
 * then extracts political promises using AI.
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import { extractPromises, checkBudget, isAIConfigured } from './src/ai';
import {
  fetchQuestions,
  fetchDebateXml,
  debateToMarkdown,
  OireachtasQuestion,
  OireachtasDebateSection,
} from './src/crawlers/oireachtas-api';
import { saveSubmission, PromiseSubmission } from './src/database/submissions';

const SOURCE_NAME = 'Oireachtas Parliamentary Questions';

// Rate limiting config
const RATE_LIMIT = {
  delayBetweenRequests: 1000, // 1 second between XML fetches
  maxQuestions: 3,           // Process 3 questions
};

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log(`║   ${SOURCE_NAME}                  ║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Check configuration
  if (!isAIConfigured()) {
    console.error('✗ ANTHROPIC_API_KEY not configured');
    process.exit(1);
  }

  const budget = await checkBudget();
  console.log(`Budget: $${budget.totalSpent.toFixed(4)} / $${budget.budgetLimit.toFixed(2)}`);

  if (!budget.canProceed) {
    console.error('✗ Budget exceeded');
    process.exit(1);
  }

  const startTime = Date.now();

  // Get recent questions from December 2025 (last sitting period)
  const dateStart = '2025-12-15';
  const dateEnd = '2025-12-20';

  console.log(`\n[1/4] Fetching recent parliamentary questions...`);
  console.log(`   Date range: ${dateStart} to ${dateEnd}`);

  const questions = await fetchQuestions({
    limit: 20,
    dateStart,
    dateEnd,
  });

  // Filter to questions with XML (have minister responses)
  const questionsWithXml = questions.filter(q => q.xmlUri).slice(0, RATE_LIMIT.maxQuestions);

  console.log(`\n   Found ${questions.length} questions, ${questionsWithXml.length} with full debates`);
  console.log(`   Processing ${questionsWithXml.length} question(s):\n`);

  questionsWithXml.forEach((q, i) => {
    console.log(`   ${i + 1}. [${q.topic}] ${q.askedBy.name} → ${q.directedTo}`);
  });

  // Fetch debates and extract promises
  console.log(`\n[2/4] Fetching debate transcripts...`);
  const allPromises: any[] = [];

  for (let i = 0; i < questionsWithXml.length; i++) {
    const question = questionsWithXml[i];
    console.log(`\n   📄 Question ${i + 1}: ${question.topic}`);
    console.log(`      Asked by: ${question.askedBy.name}`);
    console.log(`      To: ${question.directedTo}`);

    try {
      // Fetch the XML debate
      const debate = await fetchDebateXml(question.xmlUri!);

      if (!debate) {
        console.log(`      ⚠️ Could not fetch debate XML`);
        continue;
      }

      // Convert to markdown for AI
      const markdown = debateToMarkdown(debate);
      console.log(`      Content: ${markdown.length} chars, ${debate.speeches.length} speeches`);

      if (markdown.length < 200) {
        console.log(`      ⚠️ Content too short, skipping`);
        continue;
      }

      // Extract promises
      console.log(`      🤖 Extracting promises...`);
      const sourceUrl = question.xmlUri!.replace('.xml', '');
      const promises = await extractPromises(markdown, sourceUrl, 50);
      console.log(`      Found ${promises.length} promise(s)`);

      allPromises.push(...promises.map(p => ({
        ...p,
        source_url: sourceUrl,
        topic: question.topic,
        asked_by: question.askedBy.name,
      })));

      // Rate limiting
      if (i < questionsWithXml.length - 1) {
        console.log(`      ⏳ Waiting ${RATE_LIMIT.delayBetweenRequests / 1000}s...`);
        await new Promise(r => setTimeout(r, RATE_LIMIT.delayBetweenRequests));
      }
    } catch (error) {
      console.error(`      ✗ Error: ${error}`);
    }
  }

  // Save to database
  console.log(`\n[3/4] Saving to review queue...`);
  let savedCount = 0;

  for (const promise of allPromises) {
    try {
      const submission: PromiseSubmission = {
        politician_name: promise.politician_name,
        party: promise.party,
        title: promise.title || promise.promise_text.substring(0, 100),
        description: promise.promise_text,
        category: promise.category,
        target_date: promise.target_date,
        source_url: promise.source_url,
        source_type: 'oireachtas',
        source_title: promise.topic,
        confidence_score: promise.confidence,
        extraction_metadata: {
          asked_by: promise.asked_by,
          source_context: promise.source_context,
        },
      };

      const id = await saveSubmission(submission);
      if (id) savedCount++;
    } catch (error) {
      console.error(`   ✗ Failed to save: ${error}`);
    }
  }

  console.log(`   Saved ${savedCount}/${allPromises.length} promises to review queue`);

  console.log(`\n[4/5] Summary`);
  console.log(`   Questions processed: ${questionsWithXml.length}`);
  console.log(`   Total promises extracted: ${allPromises.length}`);
  console.log(`   Saved to review queue: ${savedCount}`);

  // Display results
  console.log('\n[5/5] Extracted Promises');
  console.log('═'.repeat(60));

  if (allPromises.length === 0) {
    console.log('   No promises found in the processed questions.');
    console.log('   This can happen if ministers gave general responses.');
  } else {
    for (const promise of allPromises) {
      console.log(`\n   Topic: ${promise.topic}`);
      console.log(`   Politician: ${promise.politician_name}`);
      console.log(`   Party: ${promise.party || 'Not specified'}`);
      console.log(`   Category: ${promise.category}`);
      console.log(`   Confidence: ${promise.confidence}%`);
      console.log(`   Promise: ${promise.promise_text.substring(0, 200)}...`);
      if (promise.target_date) {
        console.log(`   Target Date: ${promise.target_date}`);
      }
      console.log('   ' + '─'.repeat(50));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`Total time: ${Date.now() - startTime}ms`);
  console.log('✅ Crawl complete!\n');
}

main().catch(console.error);
