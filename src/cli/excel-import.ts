#!/usr/bin/env node
import { Command } from 'commander';
import xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger.js';

const logger = new Logger('ExcelImportCLI');

// Interface for Excel row data
interface ExcelRow {
  Name?: string;
  Email?: string;
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

// Interface for upload-single response
interface UploadSingleResponse {
  success: boolean;
  message: string;
  applicantId: string;
  applicantEmail: string;
  action: 'created' | 'existing' | 'skipped';
  emailResult: {
    sent: boolean;
    skipped: boolean;
    reason?: string;
    retryCount?: number;
    errorMessage?: string;
  };
}

const program = new Command();

program
  .name('excel-import')
  .description('CLI tool to import Excel file and send emails')
  .version('1.0.0');

program
  .command('process')
  .description('Process Excel file and send data to Express endpoint')
  .requiredOption('-f, --file <path>', 'Path to Excel file')
  .requiredOption('-t, --template-name <name>', 'Name of the email template to use')
  .requiredOption('-c, --country <country>', 'Country to assign to all applicants')
  .option('--force', 'Force resend emails even if already sent')
  .option('-u, --url <url>', 'Express endpoint URL', 'http://localhost:3000/api/upload-single')
  .option('--dry-run', 'Parse and preview without sending to server')
  .action(async (options) => {
    try {
      logger.section('Excel Import CLI');

      // Validate file path
      const filePath = path.resolve(options.file);
      if (!fs.existsSync(filePath)) {
        logger.error(`File not found: ${filePath}`);
        process.exit(1);
      }

      // Read Excel file
      logger.info(`Reading Excel file: ${filePath}`);
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        logger.error('Excel file has no sheets');
        process.exit(1);
      }

      logger.info(`Found sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json<ExcelRow>(worksheet);

      if (rawData.length === 0) {
        logger.error('No data found in Excel file');
        process.exit(1);
      }

      logger.info(`Parsed ${rawData.length} rows from Excel file`);

      // Validate data
      const validRows: ExcelRow[] = [];
      const invalidRows: Array<{ row: number; reason: string; data: any }> = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        console.log(row)
        const rowNum = i + 2; // Excel rows are 1-indexed, plus header row

        if (!row.Name || !row.Email) {
          invalidRows.push({
            row: rowNum,
            reason: 'Missing Name or email',
            data: row,
          });
          continue;
        }

        validRows.push(row);
      }

      logger.info(`Valid rows: ${validRows.length}`);
      if (invalidRows.length > 0) {
        logger.warn(`Invalid rows: ${invalidRows.length}`);
        invalidRows.forEach((inv) => {
          logger.warn(`  Row ${inv.row}: ${inv.reason}`);
        });
      }

      logger.info(`Country: ${options.country}`);

      // Display preview
      logger.section('Preview of valid rows:');
      validRows.slice(0, 5).forEach((row, index) => {
        logger.info(`  ${index + 1}. ${row.Name} (${row.Email})${row['Job Title'] ? ` - ${row['Job Title']}` : ''}`);
      });

      if (validRows.length > 5) {
        logger.info(`  ... and ${validRows.length - 5} more rows`);
      }

      if (options.dryRun) {
        logger.section('Dry Run Mode - No data will be sent to server');
        logger.info(`Template: ${options.templateName}`);
        logger.info(`Country: ${options.country}`);
        logger.info(`Force: ${options.force ? 'true' : 'false'}`);
        logger.info(`Valid rows to process: ${validRows.length}`);
        process.exit(0);
      }

      // Send to Express endpoint
      logger.section('Sending data to Express endpoint');
      logger.info(`URL: ${options.url}`);
      logger.info(`Template: ${options.templateName}`);
      logger.info(`Country: ${options.country}`);
      logger.info(`Force: ${options.force ? 'true' : 'false'}`);

      // Statistics
      let newApplicants = 0;
      let existingApplicants = 0;
      let emailsSent = 0;
      let emailsSkipped = 0;
      let emailsFailed = 0;

      // Process each applicant individually
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        const rowNum = i + 1;

        console.log(`\n[${rowNum}/${validRows.length}] Processing ${row.Email}...`);

        const requestBody: UploadSingleRequestBody = {
          data: row,
          templateName: options.templateName,
          force: options.force,
          country: options.country,
        };

        try {
          const response = await fetch(options.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`  ✗ Server error: ${errorText}`);
            emailsFailed++;
            continue;
          }

          const result: UploadSingleResponse = await response.json();

          // Display action result
          if (result.action === 'created') {
            console.log(`  ✓ Applicant created`);
            newApplicants++;
          } else if (result.action === 'existing') {
            console.log(`  ℹ Applicant already exists`);
            existingApplicants++;
          } else if (result.action === 'skipped') {
            console.log(`  ⊘ Email skipped (${result.emailResult.reason})`);
            emailsSkipped++;
            continue;
          }

          // Display email result
          if (result.emailResult.sent) {
            const forceMsg = options.force ? ' (force resend)' : '';
            console.log(`  ✓ Email sent successfully${forceMsg}`);
            emailsSent++;
          } else if (result.emailResult.skipped) {
            console.log(`  ⊘ Email skipped (${result.emailResult.reason})`);
            emailsSkipped++;
          } else {
            console.log(`  ✗ Email failed: ${result.emailResult.errorMessage || 'Unknown error'}`);
            if (result.emailResult.retryCount && result.emailResult.retryCount > 0) {
              console.log(`  ↻ Retried ${result.emailResult.retryCount} time(s)`);
            }
            emailsFailed++;
          }
        } catch (error) {
          console.log(`  ✗ Request failed: ${error instanceof Error ? error.message : String(error)}`);
          emailsFailed++;
        }
      }

      // Print summary
      logger.section('Server Response Summary');
      logger.info(`Total rows: ${validRows.length}`);
      logger.success(`New applicants: ${newApplicants}`);
      logger.info(`Existing applicants: ${existingApplicants}`);
      logger.info(`Invalid rows: ${invalidRows.length}`);
      logger.success(`Emails sent: ${emailsSent}`);
      logger.info(`Emails skipped: ${emailsSkipped}`);
      if (emailsFailed > 0) {
        logger.error(`Emails failed: ${emailsFailed}`);
      }

      // Exit with error if any emails failed
      if (emailsFailed > 0) {
        process.exit(1);
      }

      process.exit(0);
    } catch (error) {
      logger.error(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
