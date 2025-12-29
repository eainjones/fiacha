import { Resend } from 'resend';
import type { ExtractedPromise } from '../types';

interface CrawlSummary {
  timestamp: Date;
  sourcesCrawled: number;
  promisesExtracted: number;
  politiciansMatched: number;
  queuedForReview: number;
  unmatched: number;
  promises: Array<{
    promise: ExtractedPromise;
    matched: boolean;
  }>;
  errors?: string[];
}

export class EmailNotifier {
  private resend: Resend;
  private fromEmail: string;
  private toEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.NOTIFICATION_FROM_EMAIL;
    const toEmail = process.env.NOTIFICATION_EMAIL;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    if (!fromEmail) {
      throw new Error('NOTIFICATION_FROM_EMAIL not configured');
    }
    if (!toEmail) {
      throw new Error('NOTIFICATION_EMAIL not configured');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
    this.toEmail = toEmail;
  }

  async sendDailySummary(summary: CrawlSummary): Promise<void> {
    try {
      const subject = summary.promisesExtracted > 0
        ? `Fiacha Crawler: ${summary.promisesExtracted} promise(s) found`
        : 'Fiacha Crawler: Daily summary (no new promises)';

      const html = this.generateSummaryEmail(summary);

      await this.resend.emails.send({
        from: this.fromEmail,
        to: this.toEmail,
        subject,
        html,
      });

      console.log(`[Email] ✓ Daily summary sent to ${this.toEmail}`);
    } catch (error) {
      console.error('[Email] ✗ Failed to send daily summary:', error);
      // Don't throw - email failure shouldn't break the crawler
    }
  }

  private generateSummaryEmail(summary: CrawlSummary): string {
    const { sourcesCrawled, promisesExtracted, politiciansMatched, queuedForReview, unmatched, promises, errors } = summary;

    let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .stats { background: #f7fafc; padding: 20px; border-radius: 0 0 8px 8px; margin-bottom: 20px; }
    .stat { display: inline-block; margin-right: 30px; margin-bottom: 10px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #718096; text-transform: uppercase; }
    .promise { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
    .promise-title { font-size: 18px; font-weight: 600; color: #2d3748; margin-bottom: 10px; }
    .promise-desc { color: #4a5568; margin-bottom: 10px; }
    .promise-meta { font-size: 14px; color: #718096; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge-matched { background: #c6f6d5; color: #22543d; }
    .badge-review { background: #fef5e7; color: #7c2d12; }
    .error { background: #fff5f5; border: 1px solid #fc8181; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .footer { text-align: center; color: #a0aec0; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Fiacha Crawler Daily Summary</h1>
      <p>${summary.timestamp.toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'full', timeStyle: 'short' })}</p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${sourcesCrawled}</div>
        <div class="stat-label">Sources Crawled</div>
      </div>
      <div class="stat">
        <div class="stat-value">${promisesExtracted}</div>
        <div class="stat-label">Promises Found</div>
      </div>
      <div class="stat">
        <div class="stat-value">${politiciansMatched}</div>
        <div class="stat-label">Matched</div>
      </div>
      <div class="stat">
        <div class="stat-value">${queuedForReview}</div>
        <div class="stat-label">Needs Review</div>
      </div>
    </div>
`;

    if (errors && errors.length > 0) {
      html += `
    <div class="error">
      <strong>⚠️ Errors Occurred:</strong>
      <ul>
        ${errors.map(err => `<li>${err}</li>`).join('')}
      </ul>
    </div>
`;
    }

    if (promises.length > 0) {
      html += `<h2 style="margin-top: 30px;">Promises Extracted</h2>`;

      promises.forEach(({ promise, matched }) => {
        html += `
    <div class="promise">
      <div class="promise-title">${promise.promise_title}</div>
      <div class="promise-desc">${promise.description}</div>
      <div class="promise-meta">
        <strong>Politician:</strong> ${promise.politician_name}
        <span class="badge ${matched ? 'badge-matched' : 'badge-review'}">
          ${matched ? '✓ Matched' : '⚠ Needs Review'}
        </span>
        <br>
        <strong>Source:</strong> ${promise.source_url}
        <br>
        <strong>Date:</strong> ${promise.date_made}
      </div>
    </div>
`;
      });
    } else {
      html += `
    <div style="text-align: center; padding: 40px; color: #718096;">
      <p style="font-size: 18px;">No new promises found today.</p>
      <p>The crawler is running normally and monitoring configured sources.</p>
    </div>
`;
    }

    html += `
    <div class="footer">
      <p>This is an automated email from the Fiacha Promise Crawler.</p>
      <p>Running on EC2 • Next crawl scheduled for 3:00 AM UTC</p>
    </div>
  </div>
</body>
</html>
`;

    return html;
  }
}
