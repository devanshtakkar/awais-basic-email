import nodemailer from 'nodemailer';
import type { SendEmailOptions, EmailSendResult, RetryConfig } from '../types/email.types.js';
import { Logger } from '../utils/logger.js';

const emailLogger = new Logger('EmailService');

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;
  private fromName: string;

  constructor() {
    this.fromAddress = process.env.SMTP_FROM || 'noreply@example.com';
    this.fromName = process.env.SMTP_FROM_NAME || 'Crypto Email';

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      emailLogger.success(`Email sent to ${options.to} (Message ID: ${info.messageId})`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      emailLogger.error(`Failed to send email to ${options.to}: ${error instanceof Error ? error.message : String(error)}`);

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async sendEmailWithRetry(
    options: SendEmailOptions,
    retryConfig: RetryConfig = { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
  ): Promise<EmailSendResult> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(retryConfig.baseDelay * Math.pow(2, attempt - 1), retryConfig.maxDelay);
        emailLogger.warn(`Retry attempt ${attempt} after ${delay}ms delay...`);
        await this.sleep(delay);
      }

      const result = await this.sendEmail(options);

      if (result.success) {
        return result;
      }

      lastError = result.error;

      if (attempt < retryConfig.maxRetries) {
        emailLogger.warn(`Attempt ${attempt + 1} failed. Retrying...`);
      }
    }

    emailLogger.error(`All ${retryConfig.maxRetries + 1} attempts failed for ${options.to}`);

    return {
      success: false,
      error: lastError || new Error('Unknown error'),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      emailLogger.success('SMTP connection verified successfully');
      return true;
    } catch (error) {
      emailLogger.error(`SMTP connection failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
