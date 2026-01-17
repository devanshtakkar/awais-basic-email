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
  email: string;
  'job title'?: string;
  phone?: string;
  country?: string;
}

// Interface for request body
interface UploadRequestBody {
  data: ExcelRow[];
  templateName: string;
}

// POST /api/upload - Upload Excel data and send emails
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { data, templateName }: UploadRequestBody = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array of rows.' });
    }

    if (!templateName) {
      return res.status(400).json({ error: 'templateName is required.' });
    }

    logger.section('Processing Excel Upload');

    // Parse and filter applicants
    const newApplicants: Array<{
      full_name: string;
      email: string;
      job_title?: string | null;
      phone?: string | null;
      country?: string | null;
    }> = [];

    const duplicates: string[] = [];
    const invalid: Array<{ row: number; reason: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;

      // Validate required fields
      if (!row.Name || !row.email) {
        invalid.push({ row: rowNum, reason: 'Missing Name or email' });
        continue;
      }

      // Check if applicant already exists (deduplication)
      const existingApplicant = await applicantService.getApplicantByEmail(row.email);
      if (existingApplicant) {
        duplicates.push(row.email);
        logger.info(`Skipping duplicate: ${row.email}`);
        continue;
      }

      // Parse full name, job title, phone, and country
      const fullName = row.Name.trim();
      const jobTitle = row['job title'] ? row['job title'].trim() : null;
      const phone = row.phone ? row.phone.trim() : null;
      const country = row.country ? row.country.trim() : null;

      newApplicants.push({
        full_name: fullName,
        email: row.email.trim().toLowerCase(),
        job_title: jobTitle,
        phone: phone,
        country: country,
      });
    }

    logger.info(`Found ${newApplicants.length} new applicants`);
    logger.info(`Skipped ${duplicates.length} duplicates`);
    logger.info(`Skipped ${invalid.length} invalid rows`);

    // Save new applicants to database
    const createdApplicants = [];
    for (const applicant of newApplicants) {
      const createData: {
        full_name: string;
        email: string;
        job_title?: string | null;
        phone?: string | null;
        country?: string | null;
      } = {
        full_name: applicant.full_name,
        email: applicant.email,
      };

      if (applicant.job_title !== undefined) {
        createData.job_title = applicant.job_title;
      }
      if (applicant.phone !== undefined) {
        createData.phone = applicant.phone;
      }
      if (applicant.country !== undefined) {
        createData.country = applicant.country;
      }

      const created = await prisma.applicants.create({
        data: createData,
      });
      createdApplicants.push(created);
    }

    logger.success(`Saved ${createdApplicants.length} applicants to database`);

    // Send emails to new applicants
    const emailResults = await emailSenderService.sendEmailsToApplicants(
      createdApplicants,
      templateName,
      false
    );

    // Print summary
    await emailSenderService.printSummary(emailResults);

    // Return response
    res.json({
      success: true,
      message: 'Excel data processed successfully',
      stats: {
        totalRows: data.length,
        newApplicants: createdApplicants.length,
        duplicates: duplicates.length,
        invalid: invalid.length,
      },
      duplicates,
      invalid,
      emailResults: {
        sent: emailResults.filter((r) => r.success).length,
        failed: emailResults.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    logger.error(`Error processing upload: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
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
  logger.info(`Upload endpoint: http://localhost:${PORT}/api/upload`);
});

export { app };
