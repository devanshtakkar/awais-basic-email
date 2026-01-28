import { prisma } from '../lib/prisma.js';
import { Logger } from '../utils/logger.js';

const trackingLogger = new Logger('TrackingService');

export class TrackingService {
  // Handle Open Tracking
  async recordOpenEvent(emailLogId: string, ip?: string, userAgent?: string): Promise<void> {
    try {
      trackingLogger.info(`Recording open event for emailLogId: ${emailLogId}`);
      const now = new Date();
      const hasOpenedBefore = await this.hasOpened(emailLogId);
      trackingLogger.info(`Has opened before: ${hasOpenedBefore}`);

      // Build update data conditionally
      const updateData: any = {
        openCount: { increment: 1 },
        lastOpenedAt: now,
        openedFromIp: ip,
        openedFromUserAgent: userAgent,
      };

      // Only set openedAt if it hasn't been opened before
      if (!hasOpenedBefore) {
        updateData.openedAt = now;
        trackingLogger.info(`Setting openedAt to: ${now}`);
      }

      trackingLogger.info(`Updating email log with data: ${JSON.stringify(updateData, null, 2)}`);
      
      const result = await prisma.emailLogs.update({
        where: { id: emailLogId },
        data: updateData,
      });

      trackingLogger.success(`Open event recorded for email log ${emailLogId}. New openCount: ${result.openCount}`);
    } catch (error) {
      trackingLogger.error(`Failed to record open event for ${emailLogId}: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.stack) {
        trackingLogger.error(`Stack trace: ${error.stack}`);
      }
      // Don't re-throw - let the endpoint always return the pixel
    }
  }

  // Handle Click Tracking
  async recordClickEvent(emailLogId: string, clickedUrl: string, ip?: string, userAgent?: string): Promise<void> {
    try {
      const now = new Date();

      await prisma.emailLogs.update({
        where: { id: emailLogId },
        data: {
          clickedAt: !await this.hasClicked(emailLogId) ? now : undefined,
          clickCount: { increment: 1 },
          lastClickedAt: now,
          clickedUrl: clickedUrl,
          clickedFromIp: ip,
          clickedFromUserAgent: userAgent,
        },
      });

      trackingLogger.success(`Click event recorded for email log ${emailLogId} (URL: ${clickedUrl})`);
    } catch (error) {
      trackingLogger.error(`Failed to record click event: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async hasOpened(emailLogId: string): Promise<boolean> {
    try {
      const log = await prisma.emailLogs.findUnique({
        where: { id: emailLogId },
        select: { openedAt: true },
      });
      return log?.openedAt !== null;
    } catch (error) {
      trackingLogger.error(`Failed to check opened status: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  private async hasClicked(emailLogId: string): Promise<boolean> {
    try {
      const log = await prisma.emailLogs.findUnique({
        where: { id: emailLogId },
        select: { clickedAt: true },
      });
      return log?.clickedAt !== null;
    } catch (error) {
      trackingLogger.error(`Failed to check clicked status: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}

export const trackingService = new TrackingService();
