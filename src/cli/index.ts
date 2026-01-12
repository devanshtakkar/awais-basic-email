#!/usr/bin/env node
import { Command } from 'commander';
import { applicantService } from '../services/applicant.service.js';
import { emailSenderService } from '../services/email-sender.service.js';
import { emailService } from '../services/email.service.js';
import { templateService } from '../services/template.service.js';
import { WelcomeEmail } from '../templates/welcome.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('CLI');

// Register templates
templateService.registerTemplate('welcome', (data) => ({
  subject: `Welcome, ${data.firstName}!`,
  component: WelcomeEmail(data),
}));

const program = new Command();

program
  .name('send-emails')
  .description('CLI tool to send emails to applicants')
  .version('1.0.0');

program
  .command('send')
  .description('Send emails to applicants')
  .requiredOption('-l, --limit <number>', 'Maximum number of applicants to send emails to')
  .requiredOption('-t, --template-name <name>', 'Name of the email template to use')
  .option('-c, --country <country>', 'Filter applicants by country (optional)')
  .option('--dry-run', 'Preview without sending actual emails')
  .action(async (options) => {
    try {
      logger.section('Email Sender CLI');

      // Validate template
      if (!templateService.hasTemplate(options.templateName)) {
        logger.error(`Template '${options.templateName}' not found. Available templates: ${templateService.listTemplates().join(', ')}`);
        process.exit(1);
      }

      // Verify SMTP connection (skip for dry-run)
      if (!options.dryRun) {
        const isConnected = await emailService.verifyConnection();
        if (!isConnected) {
          logger.error('Failed to verify SMTP connection. Please check your configuration.');
          process.exit(1);
        }
      }

      // Parse limit
      const limit = parseInt(options.limit, 10);
      if (isNaN(limit) || limit <= 0) {
        logger.error('Limit must be a positive number');
        process.exit(1);
      }

      // Fetch applicants
      logger.info(`Fetching applicants${options.country ? ` from ${options.country}` : ''} (limit: ${limit})...`);
      const applicants = await applicantService.getApplicants(limit, options.country);

      if (applicants.length === 0) {
        logger.warn('No applicants found matching the criteria');
        process.exit(0);
      }

      // Display applicants
      logger.section('Applicants to receive email:');
      applicants.forEach((applicant, index) => {
        logger.info(`  ${index + 1}. ${applicant.first_name} ${applicant.last_name} (${applicant.email})${applicant.country ? ` - ${applicant.country}` : ''}`);
      });

      if (options.dryRun) {
        logger.section('Dry Run Mode - No emails will be sent');
      } else {
        logger.section(`Sending emails using template: ${options.templateName}`);
      }

      // Send emails
      const results = await emailSenderService.sendEmailsToApplicants(
        applicants,
        options.templateName,
        options.dryRun
      );

      // Print summary
      await emailSenderService.printSummary(results);

      // Exit with error code if any emails failed
      const failedCount = results.filter((r) => !r.success).length;
      if (failedCount > 0) {
        process.exit(1);
      }

      process.exit(0);
    } catch (error) {
      logger.error(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
