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

export interface Review {
  name: string;
  stars: number;
  heading: string;
  content: string;
  readMoreUrl?: string;
}

export interface TemplateData {
  fullName: string;
  email: string;
  reviews?: Review[];
  startNowUrl?: string;
  unsubscribeUrl?: string;
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

export interface TrackingStats {
  openedAt: Date | null;
  openCount: number;
  lastOpenedAt: Date | null;
  clickedAt: Date | null;
  clickCount: number;
  lastClickedAt: Date | null;
  clickedUrl: string | null;
}

export interface AggregateTrackingStats {
  totalEmails: number;
  totalOpens: number;
  totalClicks: number;
  uniqueOpens: number;
  uniqueClicks: number;
}
