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
  email?: string;
  'job title'?: string;
}

// Interface for upload request body
interface UploadRequestBody {
  data: ExcelRow[];
  templateName: string;
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
  .option('-u, --url <url>', 'Express endpoint URL', 'http://localhost:3000/api/upload')
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
        const rowNum = i + 2; // Excel rows are 1-indexed, plus header row

        if (!row.Name || !row.email) {
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

      // Display preview
      logger.section('Preview of valid rows:');
      validRows.slice(0, 5).forEach((row, index) => {
        logger.info(`  ${index + 1}. ${row.Name} (${row.email})${row['job title'] ? ` - ${row['job title']}` : ''}`);
      });

      if (validRows.length > 5) {
        logger.info(`  ... and ${validRows.length - 5} more rows`);
      }

      if (options.dryRun) {
        logger.section('Dry Run Mode - No data will be sent to server');
        logger.info(`Template: ${options.templateName}`);
        logger.info(`Valid rows to process: ${validRows.length}`);
        process.exit(0);
      }

      // Send to Express endpoint
      logger.section('Sending data to Express endpoint');
      logger.info(`URL: ${options.url}`);
      logger.info(`Template: ${options.templateName}`);

      const requestBody: UploadRequestBody = {
        data: validRows,
        templateName: options.templateName,
      };

      const response = await fetch(options.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Server returned error (${response.status}): ${errorText}`);
        process.exit(1);
      }

      const result = await response.json();

      logger.section('Server Response');
      logger.info(`Total rows: ${result.stats.totalRows}`);
      logger.success(`New applicants: ${result.stats.newApplicants}`);
      logger.info(`Duplicates skipped: ${result.stats.duplicates}`);
      logger.info(`Invalid rows: ${result.stats.invalid}`);
      logger.success(`Emails sent: ${result.emailResults.sent}`);
      if (result.emailResults.failed > 0) {
        logger.error(`Emails failed: ${result.emailResults.failed}`);
      }

      if (result.duplicates.length > 0) {
        logger.section('Duplicate emails:');
        result.duplicates.forEach((email: string) => {
          logger.info(`  - ${email}`);
        });
      }

      if (result.invalid.length > 0) {
        logger.section('Invalid rows from server:');
        result.invalid.forEach((inv: any) => {
          logger.warn(`  Row ${inv.row}: ${inv.reason}`);
        });
      }

      // Exit with error if any emails failed
      if (result.emailResults.failed > 0) {
        process.exit(1);
      }

      process.exit(0);
    } catch (error) {
      logger.error(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
