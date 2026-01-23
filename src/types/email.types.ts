export type EmailStatus = 'success' | 'failed';

export interface EmailLogData {
  applicantId: string;
  templateName: string;
  status: EmailStatus;
  errorMessage?: string;
  emailSubject: string;
  emailBody: string;
  retryCount: number;
}

export interface EmailResult {
  success: boolean;
  applicantId: string;
  applicantEmail: string;
  errorMessage?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  unsubscribeUrl?: string;
}

export interface TemplateData {
  fullName: string;
  email: string;
  [key: string]: any;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: Error;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export interface UnsubscribeResponse {
  success: boolean;
  message: string;
}
