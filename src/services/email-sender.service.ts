import type { Applicants } from '../generated/prisma/client.js';
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
    const { id, email, first_name, last_name } = applicant;

    try {
      // Render template
      const { html, subject } = await templateService.renderTemplate(templateName, {
        firstName: first_name,
        lastName: last_name,
        email,
      });

      if (dryRun) {
        senderLogger.dryRun(`Would send email to ${email} (${first_name} ${last_name})`);
        senderLogger.dryRun(`Subject: ${subject}`);
        return {
          success: true,
          applicantId: id,
          applicantEmail: email,
        };
      }

      // Send email with retry
      const emailResult = await emailService.sendEmailWithRetry({
        to: email,
        subject,
        html,
      });

      // Log the result
      await emailLogsService.createEmailLog({
        applicantId: id,
        templateName,
        status: emailResult.success ? 'success' : 'failed',
        errorMessage: emailResult.error?.message,
        emailSubject: subject,
        emailBody: html,
        retryCount: emailResult.success ? 0 : 3,
      });

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
