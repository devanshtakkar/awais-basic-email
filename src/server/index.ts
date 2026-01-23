import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { applicantService } from '../services/applicant.service.js';
import { emailSenderService } from '../services/email-sender.service.js';
import { emailLogsService } from '../services/email-logs.service.js';
import { Logger } from '../utils/logger.js';
// Import templates to register them with the TemplateService
import '../templates/index.js';

const logger = new Logger('ExpressServer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Interface for Excel row data
interface ExcelRow {
  Name: string;
  Email: string;
  'Job Title'?: string;
  phone?: string;
  country?: string;
}

// Interface for upload-single request body
interface UploadSingleRequestBody {
  data: ExcelRow;
  templateName: string;
  force?: boolean;
  country?: string;
}

// POST /api/upload-single - Upload single applicant and send email
app.post('/api/upload-single', async (req: Request, res: Response) => {
  try {
    const { data, templateName, force = false, country }: UploadSingleRequestBody = req.body;

    // Validate required fields
    if (!data || !data.Name || !data.Email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Name and Email are required.'
      });
    }

    if (!templateName) {
      return res.status(400).json({
        success: false,
        error: 'templateName is required.'
      });
    }

    const email = data.Email.trim().toLowerCase();
    const fullName = data.Name.trim();
    const jobTitle = data['Job Title'] ? data['Job Title'].trim() : null;
    const phone = data.phone ? data.phone.trim() : null;
    const applicantCountry = country ? country.trim() : (data.country ? data.country.trim() : null);

    logger.info(`Processing upload-single for ${email} (force: ${force})`);

    // Check if applicant exists by email
    let applicant = await applicantService.getApplicantByEmail(email);
    let action: 'created' | 'existing' | 'skipped';

    if (!applicant) {
      // Create new applicant
      const createData: {
        full_name: string;
        email: string;
        job_title?: string | null;
        phone?: string | null;
        country?: string | null;
      } = {
        full_name: fullName,
        email: email,
      };

      if (jobTitle !== undefined) {
        createData.job_title = jobTitle;
      }
      if (phone !== undefined) {
        createData.phone = phone;
      }
      if (applicantCountry !== undefined) {
        createData.country = applicantCountry;
      }

      applicant = await prisma.applicants.create({
        data: createData,
      });

      logger.success(`Created new applicant: ${email}`);
      action = 'created';
    } else {
      logger.info(`Using existing applicant: ${email}`);
      action = 'existing';
    }

    // Check if applicant is unsubscribed
    if (applicant.unsubscribed) {
      logger.info(`Applicant ${email} is unsubscribed (from: ${applicant.unsubscribedFromEmail}), skipping email`);
      return res.json({
        success: true,
        message: 'Applicant is unsubscribed',
        applicantId: applicant.id,
        applicantEmail: applicant.email,
        action: 'skipped',
        emailResult: {
          sent: false,
          skipped: true,
          reason: 'unsubscribed',
          unsubscribedFrom: applicant.unsubscribedFromEmail,
        },
      });
    }

    // Check force flag and successful email log
    if (!force) {
      const hasSuccessfulLog = await emailLogsService.hasSuccessfulEmailLog(applicant.id, templateName);
      if (hasSuccessfulLog) {
        logger.info(`Email already sent to ${email} with template '${templateName}', skipping`);
        return res.json({
          success: true,
          message: 'Email already sent',
          applicantId: applicant.id,
          applicantEmail: applicant.email,
          action: 'skipped',
          emailResult: {
            sent: false,
            skipped: true,
            reason: 'already sent',
          },
        });
      }
    }

    // Send email with retry logic
    const emailResult = await emailSenderService.sendEmailToApplicant(applicant, templateName, false);

    const response = {
      success: emailResult.success,
      message: emailResult.success ? 'Email sent successfully' : 'Email failed',
      applicantId: applicant.id,
      applicantEmail: applicant.email,
      action,
      emailResult: {
        sent: emailResult.success,
        skipped: false,
        retryCount: emailResult.success ? 0 : 3,
        errorMessage: emailResult.errorMessage,
      },
    };

    if (emailResult.success) {
      logger.success(`Email sent successfully to ${email}`);
    } else {
      logger.error(`Email failed for ${email}: ${emailResult.errorMessage}`);
    }

    res.json(response);
  } catch (error) {
    logger.error(`Error processing upload-single: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// POST /api/unsubscribe/:applicantId - Handle one-click unsubscribe
app.post('/api/unsubscribe/:applicantId', async (req: Request, res: Response) => {
  try {
    const { applicantId } = req.params;
    const { email: emailTemplate } = req.query;

    if (!applicantId || typeof applicantId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Applicant ID is required.'
      });
    }

    // Verify applicant exists
    const applicant = await applicantService.getApplicantById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found.'
      });
    }

    const success = await applicantService.markAsUnsubscribed(
      applicantId,
      typeof emailTemplate === 'string' ? emailTemplate : 'unknown'
    );

    if (success) {
      logger.success(`Unsubscribed applicant: ${applicant.email} from email: ${emailTemplate || 'unknown'}`);
      return res.json({
        success: true,
        message: 'You have been successfully unsubscribed.'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to process unsubscribe request.'
      });
    }
  } catch (error) {
    logger.error(`Error processing unsubscribe: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/unsubscribe/:applicantId - For GET requests (fallback)
app.get('/api/unsubscribe/:applicantId', async (req: Request, res: Response) => {
  try {
    const { applicantId } = req.params;
    const { email: emailTemplate } = req.query;

    if (!applicantId || typeof applicantId !== 'string') {
      return res.status(400).send('Applicant ID is required.');
    }

    const applicant = await applicantService.getApplicantById(applicantId);
    if (!applicant) {
      return res.status(404).send('Applicant not found.');
    }

    const success = await applicantService.markAsUnsubscribed(
      applicantId,
      typeof emailTemplate === 'string' ? emailTemplate : 'unknown'
    );

    if (success) {
      return res.send('You have been successfully unsubscribed.');
    } else {
      return res.status(500).send('Failed to process unsubscribe request.');
    }
  } catch (error) {
    logger.error(`Error processing unsubscribe: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).send('Internal server error');
  }
});

// GET /api/health - Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  logger.success(`Express server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Upload endpoint: http://localhost:${PORT}/api/upload-single`);
});

export { app };
