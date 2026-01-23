import { prisma } from '../lib/prisma.js';
import type { EmailLogData, EmailStatus } from '../types/email.types.js';
import { Logger } from '../utils/logger.js';

const emailLogsLogger = new Logger('EmailLogsService');

export class EmailLogsService {
  async createEmailLog(data: EmailLogData): Promise<void> {
    try {
      await prisma.emailLogs.create({
        data: {
          applicantId: data.applicantId,
          templateName: data.templateName,
          status: data.status,
          errorMessage: data.errorMessage,
          emailSubject: data.emailSubject,
          emailBody: data.emailBody,
          retryCount: data.retryCount,
        },
      });

      emailLogsLogger.success(`Email log created for applicant ${data.applicantId} (${data.status})`);
    } catch (error) {
      emailLogsLogger.error(`Failed to create email log: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async updateEmailLog(
    logId: string,
    data: Partial<EmailLogData>
  ): Promise<void> {
    try {
      await prisma.emailLogs.update({
        where: { id: logId },
        data: {
          status: data.status,
          errorMessage: data.errorMessage,
          retryCount: data.retryCount,
        },
      });

      emailLogsLogger.success(`Email log ${logId} updated`);
    } catch (error) {
      emailLogsLogger.error(`Failed to update email log ${logId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getEmailLogsByApplicant(applicantId: string): Promise<any[]> {
    try {
      const logs = await prisma.emailLogs.findMany({
        where: { applicantId },
        orderBy: { sentAt: 'desc' },
      });

      emailLogsLogger.info(`Found ${logs.length} email log(s) for applicant ${applicantId}`);

      return logs;
    } catch (error) {
      emailLogsLogger.error(`Failed to fetch email logs for applicant ${applicantId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getEmailLogsByTemplate(templateName: string): Promise<any[]> {
    try {
      const logs = await prisma.emailLogs.findMany({
        where: { templateName },
        orderBy: { sentAt: 'desc' },
      });

      emailLogsLogger.info(`Found ${logs.length} email log(s) for template '${templateName}'`);

      return logs;
    } catch (error) {
      emailLogsLogger.error(`Failed to fetch email logs for template '${templateName}': ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getEmailStats(): Promise<{
    total: number;
    success: number;
    failed: number;
  }> {
    try {
      const [total, success, failed] = await Promise.all([
        prisma.emailLogs.count(),
        prisma.emailLogs.count({ where: { status: 'success' } }),
        prisma.emailLogs.count({ where: { status: 'failed' } }),
      ]);

      return { total, success, failed };
    } catch (error) {
      emailLogsLogger.error(`Failed to fetch email stats: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async hasSuccessfulEmailLog(applicantId: string, templateName: string): Promise<boolean> {
    try {
      const log = await prisma.emailLogs.findFirst({
        where: {
          applicantId,
          templateName,
          status: 'success'
        }
      });
      return log !== null;
    } catch (error) {
      emailLogsLogger.error(`Failed to check email log: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export const emailLogsService = new EmailLogsService();
