import { Resend } from 'resend';
import type { ExtractedPromiseType } from '../types';

interface CrawlSummary {
  timestamp: Date;
  sourcesCrawled: number;
  promisesExtracted: number;
  politiciansMatched: number;
  queuedForReview: number;
  unmatched: number;
  promises: Array<{
    promise: ExtractedPromiseType;
    matched: boolean;
  }>;
  errors?: string[];
}

export interface CouncilCrawlSummary {
  weekStarting: string;
  weekEnding: string;
  totalCouncilsChecked: number;
  councilsWithChanges: number;
  councilsWithErrors: number;
  suspiciousChanges: number;
  changesByCounty: {
    county: string;
    added: string[];
    removed: string[];
    date: string;
  }[];
  errors: {
    county: string;
    error: string;
    date: string;
  }[];
  nextScheduledRun?: string;
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

  async sendWeekendCouncilSummary(summary: CouncilCrawlSummary): Promise<void> {
    try {
      let subject = 'Fiacha Council Crawler: Weekend Summary';
      if (summary.councilsWithChanges > 0) {
        subject = `Fiacha Council Crawler: ${summary.councilsWithChanges} council(s) updated`;
      }
      if (summary.suspiciousChanges > 0) {
        subject = `⚠️ Fiacha Council Crawler: ${summary.suspiciousChanges} suspicious change(s) detected`;
      }

      const html = this.generateCouncilSummaryEmail(summary);

      await this.resend.emails.send({
        from: this.fromEmail,
        to: this.toEmail,
        subject,
        html,
      });

      console.log(`[Email] ✓ Weekend council summary sent to ${this.toEmail}`);
    } catch (error) {
      console.error('[Email] ✗ Failed to send weekend council summary:', error);
    }
  }

  async sendSuspiciousChangeAlert(county: string, added: string[], removed: string[], reason: string): Promise<void> {
    try {
      const subject = `⚠️ ALERT: Suspicious councillor change in ${county}`;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fff5f5; border: 2px solid #fc8181; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .alert h2 { color: #c53030; margin-top: 0; }
    .changes { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .added { color: #22543d; }
    .removed { color: #c53030; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <h2>⚠️ Suspicious Change Detected</h2>
      <p><strong>County:</strong> ${county}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>This change requires manual review before being applied.</p>
    </div>

    <div class="changes">
      <h3>Changes Detected</h3>
      ${added.length > 0 ? `<p class="added"><strong>Added (${added.length}):</strong> ${added.join(', ')}</p>` : ''}
      ${removed.length > 0 ? `<p class="removed"><strong>Removed (${removed.length}):</strong> ${removed.join(', ')}</p>` : ''}
    </div>

    <p>Please review these changes manually and update the data if they are legitimate.</p>
  </div>
</body>
</html>
`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: this.toEmail,
        subject,
        html,
      });

      console.log(`[Email] ✓ Suspicious change alert sent for ${county}`);
    } catch (error) {
      console.error('[Email] ✗ Failed to send suspicious change alert:', error);
    }
  }

  private generateCouncilSummaryEmail(summary: CouncilCrawlSummary): string {
    const { totalCouncilsChecked, councilsWithChanges, councilsWithErrors, suspiciousChanges, changesByCounty, errors, nextScheduledRun } = summary;

    let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #38a169 0%, #2f855a 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .stats { background: #f7fafc; padding: 20px; border-radius: 0 0 8px 8px; margin-bottom: 20px; }
    .stat { display: inline-block; margin-right: 25px; margin-bottom: 10px; }
    .stat-value { font-size: 28px; font-weight: bold; color: #38a169; }
    .stat-value.warning { color: #dd6b20; }
    .stat-value.error { color: #c53030; }
    .stat-label { font-size: 12px; color: #718096; text-transform: uppercase; }
    .change-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
    .change-county { font-weight: 600; color: #2d3748; margin-bottom: 8px; }
    .change-added { color: #22543d; font-size: 14px; }
    .change-removed { color: #c53030; font-size: 14px; }
    .error-card { background: #fff5f5; border: 1px solid #fc8181; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
    .footer { text-align: center; color: #a0aec0; font-size: 14px; margin-top: 30px; }
    .no-changes { text-align: center; padding: 30px; color: #718096; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ Council Crawler Weekend Summary</h1>
      <p>${summary.weekStarting} to ${summary.weekEnding}</p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${totalCouncilsChecked}</div>
        <div class="stat-label">Councils Checked</div>
      </div>
      <div class="stat">
        <div class="stat-value${councilsWithChanges > 0 ? '' : ''}">${councilsWithChanges}</div>
        <div class="stat-label">With Changes</div>
      </div>
      <div class="stat">
        <div class="stat-value${councilsWithErrors > 0 ? ' error' : ''}">${councilsWithErrors}</div>
        <div class="stat-label">Errors</div>
      </div>
      <div class="stat">
        <div class="stat-value${suspiciousChanges > 0 ? ' warning' : ''}">${suspiciousChanges}</div>
        <div class="stat-label">Suspicious</div>
      </div>
    </div>
`;

    if (changesByCounty.length > 0) {
      html += `<h2 style="margin-top: 25px;">Changes Detected</h2>`;
      for (const change of changesByCounty) {
        const changeDate = new Date(change.date).toLocaleDateString('en-IE');
        html += `
    <div class="change-card">
      <div class="change-county">${change.county} <span style="color: #a0aec0; font-weight: normal; font-size: 14px;">(${changeDate})</span></div>
      ${change.added.length > 0 ? `<div class="change-added">+ Added: ${change.added.join(', ')}</div>` : ''}
      ${change.removed.length > 0 ? `<div class="change-removed">- Removed: ${change.removed.join(', ')}</div>` : ''}
    </div>
`;
      }
    } else {
      html += `
    <div class="no-changes">
      <p style="font-size: 18px;">✓ No changes detected this weekend</p>
      <p>All councillor data is up to date.</p>
    </div>
`;
    }

    if (errors.length > 0) {
      html += `<h2 style="margin-top: 25px; color: #c53030;">Errors</h2>`;
      for (const err of errors) {
        html += `
    <div class="error-card">
      <strong>${err.county}:</strong> ${err.error}
    </div>
`;
      }
    }

    html += `
    <div class="footer">
      <p>This is an automated email from the Fiacha Council Crawler.</p>
      ${nextScheduledRun ? `<p>Next scheduled run: ${nextScheduledRun}</p>` : ''}
    </div>
  </div>
</body>
</html>
`;

    return html;
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
        <strong>Date:</strong> ${promise.promise_date}
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
