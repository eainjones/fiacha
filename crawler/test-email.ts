#!/usr/bin/env node
import dotenv from 'dotenv';
import { EmailNotifier } from './src/notifications/email-notifier';

// Load environment variables from current working directory
dotenv.config();

/**
 * Test script for email notifications
 * Sends a sample daily summary email
 */
async function testEmail() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║     Email Notification Test                   ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    console.log('[1/3] Initializing email notifier...');
    const emailNotifier = new EmailNotifier();
    console.log('   ✓ EmailNotifier initialized');

    console.log('\n[2/3] Preparing test summary...');
    const testSummary = {
      timestamp: new Date(),
      sourcesCrawled: 3,
      promisesExtracted: 5,
      politiciansMatched: 4,
      queuedForReview: 5,
      unmatched: 1,
      promises: [
        {
          promise: {
            politician_name: 'Mary Lou McDonald',
            party: 'Sinn Féin',
            promise_title: 'Build 100,000 affordable homes',
            description: 'Sinn Féin commits to building 100,000 affordable homes over the next five years to address the housing crisis.',
            date_made: '2024-11-15',
            source_url: 'https://example.com/test-source-1',
            source_type: 'news_article' as const,
            tags: ['housing', 'affordable homes'],
          },
          matched: true,
        },
        {
          promise: {
            politician_name: 'Micheál Martin',
            party: 'Fianna Fáil',
            promise_title: 'Reduce hospital waiting times',
            description: 'Commitment to reduce hospital waiting lists by 50% within two years through additional funding.',
            date_made: '2024-11-10',
            source_url: 'https://example.com/test-source-2',
            source_type: 'news_article' as const,
            tags: ['health', 'hospitals'],
          },
          matched: true,
        },
        {
          promise: {
            politician_name: 'Eamon Ryan',
            party: 'Green Party',
            promise_title: 'Triple renewable energy capacity',
            description: 'Plans to triple Ireland\'s renewable energy capacity by 2030 to meet climate targets.',
            date_made: '2024-11-12',
            source_url: 'https://example.com/test-source-3',
            source_type: 'news_article' as const,
            tags: ['climate', 'renewable energy'],
          },
          matched: true,
        },
        {
          promise: {
            politician_name: 'Leo Varadkar',
            party: 'Fine Gael',
            promise_title: 'Cut income tax for middle earners',
            description: 'Promise to reduce income tax burden for middle-income earners through tax credit increases.',
            date_made: '2024-11-08',
            source_url: 'https://example.com/test-source-4',
            source_type: 'news_article' as const,
            tags: ['taxation', 'economy'],
          },
          matched: true,
        },
        {
          promise: {
            politician_name: 'Unknown Councillor',
            party: 'Independent',
            promise_title: 'Fix local potholes',
            description: 'Commitment to repair all potholes in the constituency within 6 months.',
            date_made: '2024-11-20',
            source_url: 'https://example.com/test-source-5',
            source_type: 'news_article' as const,
            tags: ['infrastructure', 'local'],
          },
          matched: false,
        },
      ],
      errors: [
        'Failed to crawl source: example.com (timeout after 30s)',
      ],
    };

    console.log('   ✓ Test summary prepared');
    console.log(`   • ${testSummary.promisesExtracted} test promises`);
    console.log(`   • ${testSummary.politiciansMatched} matched`);
    console.log(`   • ${testSummary.unmatched} unmatched`);

    console.log('\n[3/3] Sending test email...');
    await emailNotifier.sendDailySummary(testSummary);

    console.log('\n✅ Test complete! Check your inbox at:', process.env.NOTIFICATION_EMAIL);
    console.log('   (Check spam folder if not received within 1-2 minutes)\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        console.error('\n💡 Make sure your .env file has:');
        console.error('   - RESEND_API_KEY');
        console.error('   - NOTIFICATION_EMAIL');
        console.error('   - NOTIFICATION_FROM_EMAIL');
      }
    }

    process.exit(1);
  }
}

// Run test
testEmail();
