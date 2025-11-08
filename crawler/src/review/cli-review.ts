#!/usr/bin/env node
import * as readline from 'readline/promises';
import { createDatabaseClient } from '../database/client';
import {
  getPendingReviews,
  approvePromiseReview,
  rejectPromiseReview,
  getReviewStats,
} from '../database/queries';
import { PromiseReview } from '../types';

/**
 * Interactive CLI for reviewing extracted promises
 */
class PromiseReviewer {
  private db = createDatabaseClient();
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async start() {
    console.log('\n═══════════════════════════════════════');
    console.log('   Fiacha Promise Review CLI');
    console.log('═══════════════════════════════════════\n');

    try {
      // Check database connection
      const healthy = await this.db.healthCheck();
      if (!healthy) {
        throw new Error('Database connection failed');
      }

      // Show stats
      await this.showStats();

      // Get pending reviews
      const reviews = await getPendingReviews(this.db);

      if (reviews.length === 0) {
        console.log('\n✅ No pending reviews! Queue is empty.\n');
        return;
      }

      console.log(`\nFound ${reviews.length} pending reviews\n`);

      // Review each promise
      for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`Review ${i + 1} of ${reviews.length} (ID: ${review.id})`);
        console.log('─'.repeat(60));

        await this.reviewPromise(review);
      }

      console.log('\n✅ Review session complete!\n');
      await this.showStats();
    } catch (error) {
      console.error('\n❌ Error:', error);
    } finally {
      await this.cleanup();
    }
  }

  async showStats() {
    const stats = await getReviewStats(this.db);
    console.log('📊 Review Queue Stats:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   Approved: ${stats.approved}`);
    console.log(`   Rejected: ${stats.rejected}`);
  }

  async reviewPromise(review: PromiseReview) {
    const promise = review.extracted_promise;
    const match = review.politician_match;

    // Display promise details
    console.log('\n📋 PROMISE:');
    console.log(`   Title: ${promise.promise_title}`);
    console.log(`   Description: ${promise.description.substring(0, 200)}...`);
    console.log(`   Category: ${promise.category}`);
    console.log(`   Promise Date: ${promise.promise_date}`);
    console.log(`   Target Date: ${promise.target_date || 'Not specified'}`);
    console.log(`   Confidence: ${promise.confidence}%`);

    if (promise.quote) {
      console.log(`   Quote: "${promise.quote.substring(0, 150)}..."`);
    }

    console.log(`\n🔗 SOURCE:`);
    console.log(`   Type: ${promise.source_type}`);
    console.log(`   URL: ${promise.source_url}`);

    console.log('\n👤 POLITICIAN MATCH:');
    if (match) {
      console.log(`   Name: ${match.name}`);
      console.log(`   Party: ${match.party}`);
      console.log(`   Constituency: ${match.constituency || 'N/A'}`);
      console.log(`   Match Score: ${match.matchScore}%`);
      console.log(`   Exact Match: ${match.isExactMatch ? 'Yes' : 'No'}`);
    } else {
      console.log('   ⚠️  NO MATCH FOUND');
      console.log(`   Extracted Name: ${promise.politician_name}`);
      console.log(`   Party: ${promise.party || 'Not specified'}`);
    }

    // Get user decision
    while (true) {
      const decision = await this.rl.question(
        '\n👉 Decision? (a)pprove / (r)eject / (s)kip / (q)uit: '
      );

      const choice = decision.toLowerCase().trim();

      if (choice === 'a' || choice === 'approve') {
        if (!match) {
          console.log('❌ Cannot approve without politician match');
          continue;
        }
        await approvePromiseReview(this.db, review.id, 'cli-user');
        console.log('✅ Approved and inserted into database');
        break;
      } else if (choice === 'r' || choice === 'reject') {
        const reason = await this.rl.question('Rejection reason: ');
        await rejectPromiseReview(this.db, review.id, reason, 'cli-user');
        console.log('❌ Rejected');
        break;
      } else if (choice === 's' || choice === 'skip') {
        console.log('⏭️  Skipped (will review later)');
        break;
      } else if (choice === 'q' || choice === 'quit') {
        console.log('👋 Exiting review session');
        process.exit(0);
      } else {
        console.log('Invalid choice. Use a/r/s/q');
      }
    }
  }

  async cleanup() {
    this.rl.close();
    await this.db.close();
  }
}

// Run if executed directly
if (require.main === module) {
  const reviewer = new PromiseReviewer();
  reviewer.start().catch(console.error);
}

export { PromiseReviewer };
