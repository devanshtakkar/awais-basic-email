import type { Applicants } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { emailService } from './email.service.js';
import { templateService } from './template.service.js';
import { emailLogsService } from './email-logs.service.js';
import type { EmailResult } from '../types/email.types.js';
import { Logger } from '../utils/logger.js';

const senderLogger = new Logger('EmailSenderService');

export class EmailSenderService {
  async sendEmailToApplicant(
    applicant: Applicants,
    templateName: string,
    dryRun: boolean = false
  ): Promise<EmailResult> {
    const { id, email, full_name } = applicant;

    try {
      // Generate URLs
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const trackingBaseUrl = process.env.TRACKING_BASE_URL || baseUrl;
      const trackingClickSubdomain = process.env.TRACKING_CLICK_SUBDOMAIN || baseUrl;
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${id}?email=${encodeURIComponent(templateName)}`;

      // Render template
      const { html, subject } = await templateService.renderTemplate(templateName, {
        fullName: full_name,
        email,
      });

      // Create email log first to get ID
      const emailLogId = await this.createEmailLog(id, templateName, subject, html);

      // Inject tracking pixel and replace links
      const trackedHtml = this.injectTracking(html, emailLogId, trackingBaseUrl, trackingClickSubdomain);
      
      // Log tracking injection for debugging
      senderLogger.info(`Tracking injected for ${email}: pixel=${trackingBaseUrl}/t/open/${emailLogId}.png`);

      if (dryRun) {
        senderLogger.dryRun(`Would send email to ${email} (${full_name})`);
        senderLogger.dryRun(`Subject: ${subject}`);
        senderLogger.dryRun(`Email Log ID: ${emailLogId}`);
        return {
          success: true,
          applicantId: id,
          applicantEmail: email,
        };
      }

      // Update email log with tracked HTML before sending
      senderLogger.info(`Updating email log ${emailLogId} with tracked HTML (length: ${trackedHtml.length})...`);
      await prisma.emailLogs.update({
        where: { id: emailLogId },
        data: { emailBody: trackedHtml },
      });
      senderLogger.success(`Email log ${emailLogId} updated successfully with tracked HTML`);

      // Send email with retry
      const emailResult = await emailService.sendEmailWithRetry({
        to: email,
        subject,
        html: trackedHtml,
        unsubscribeUrl,
      });

      // Update email log with result
      await this.updateEmailLogResult(emailLogId, emailResult);

      return {
        success: emailResult.success,
        applicantId: id,
        applicantEmail: email,
        errorMessage: emailResult.error?.message,
      };
    } catch (error) {
      senderLogger.error(`Error processing email for ${email}: ${error instanceof Error ? error.message : String(error)}`);

      // Log the failure
      if (!dryRun) {
        await emailLogsService.createEmailLog({
          applicantId: id,
          templateName,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
          emailSubject: 'Unknown',
          emailBody: '',
          retryCount: 3,
        });
      }

      return {
        success: false,
        applicantId: id,
        applicantEmail: email,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private injectTracking(
    html: string,
    emailLogId: string,
    trackingBaseUrl: string,
    trackingClickSubdomain: string
  ): string {
    let trackedHtml = html;

    // 1. Inject tracking pixel at the end of body
    // Note: Using inline styles that work across email clients
    const trackingPixel = `<img src="${trackingBaseUrl}/t/open/${emailLogId}.png" width="1" height="1" style="display:block;width:1px;height:1px;border:0;overflow:hidden;" alt="" />`;
    
    // Debug: Log body tag presence
    senderLogger.info(`Checking for body tag in HTML for emailLogId: ${emailLogId}...`);
    
    // Try to inject before </body> tag using regex
    // Note: Use replace directly instead of test() to avoid regex lastIndex issues
    const bodyCloseRegex = /<\/body>/gi;
    const trackedHtmlBefore = trackedHtml;
    trackedHtml = trackedHtml.replace(bodyCloseRegex, `${trackingPixel}</body>`);
    
    if (trackedHtml !== trackedHtmlBefore) {
      senderLogger.info(`Found </body> tag, injected tracking pixel`);
    } else {
      // If no body tag found, append at the end
      senderLogger.info(`No </body> tag found, appending tracking pixel at the end`);
      trackedHtml = trackedHtmlBefore + trackingPixel;
    }
    
    // Verify tracking pixel was injected
    const hasTrackingPixel = trackedHtml.includes('/t/open/');
    senderLogger.info(`Tracking pixel injected: ${hasTrackingPixel}`);
    
    if (!hasTrackingPixel) {
      senderLogger.error(`FAILED to inject tracking pixel for emailLogId: ${emailLogId}`);
    }

    // 2. Replace all links with tracked URLs
    // Match all href attributes except unsubscribe links and mailto links
    const linkRegex = /href=["']((?!mailto:|\/api\/unsubscribe\/)[^"']+)["']/g;
    let linkCount = 0;
    trackedHtml = trackedHtml.replace(linkRegex, (match, url) => {
      linkCount++;
      const encodedUrl = encodeURIComponent(url);
      return `href="${trackingClickSubdomain}/c/${emailLogId}?url=${encodedUrl}"`;
    });
    
    senderLogger.info(`Replaced ${linkCount} links with tracking URLs`);

    return trackedHtml;
  }

  private async createEmailLog(
    applicantId: string,
    templateName: string,
    subject: string,
    html: string
  ): Promise<string> {
    const log = await prisma.emailLogs.create({
      data: {
        applicantId,
        templateName,
        status: 'pending',
        emailSubject: subject,
        emailBody: html,
        retryCount: 0,
      },
    });
    return log.id;
  }

  private async updateEmailLogResult(
    emailLogId: string,
    emailResult: { success: boolean; error?: Error }
  ): Promise<void> {
    await prisma.emailLogs.update({
      where: { id: emailLogId },
      data: {
        status: emailResult.success ? 'success' : 'failed',
        errorMessage: emailResult.error?.message,
        retryCount: emailResult.success ? 0 : 3,
      },
    });
  }

  async sendEmailsToApplicants(
    applicants: Applicants[],
    templateName: string,
    dryRun: boolean = false
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    senderLogger.section(`Sending emails to ${applicants.length} applicant(s)...`);

    for (let i = 0; i < applicants.length; i++) {
      const applicant = applicants[i];
      senderLogger.info(`[${i + 1}/${applicants.length}] Processing ${applicant.email}...`);

      const result = await this.sendEmailToApplicant(applicant, templateName, dryRun);
      results.push(result);
    }

    return results;
  }

  async printSummary(results: EmailResult[]): Promise<void> {
    const success = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    senderLogger.section('Summary');
    senderLogger.success(`Successful: ${success}`);
    if (failed > 0) {
      senderLogger.error(`Failed: ${failed}`);
    }
    senderLogger.info(`Total: ${results.length}`);
  }
}

export const emailSenderService = new EmailSenderService();
