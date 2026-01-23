# Excel Import CLI - User Instructions

This document provides step-by-step instructions on how to use the Excel Import CLI to programmatically send emails to applicants.

## Step 1: Prepare Your Excel File

### File Location
Save your Excel file in the `sheets/` directory at the root of the project.

### Required Columns

Your Excel file **must** have the following columns in the **exact order** specified below. Column names are **case-sensitive**:

| Column Name | Required | Description |
|-------------|----------|-------------|
| `Name` | Yes | Full name of the applicant |
| `Email` | Yes | Email address of the applicant |
| `Job Title` | No | Job title of the applicant |

### Important Notes

- The columns must appear in the order: **Name → Email → Job Title**
- Column names must match exactly (case-sensitive)
- `Name` and `Email` are required fields
- `Job Title` is optional but should be included as the third column if present
- Additional columns (like `phone`, `country`) are ignored by the CLI

### Example Excel Structure

| Name | Email | Job Title |
|------|-------|-----------|
| John Doe | john.doe@example.com | Software Engineer |
| Jane Smith | jane.smith@example.com | Product Manager |

## Step 2: Run the CLI Script

The Excel Import CLI can be run using the npm script or directly with tsx.

### Using npm Script (Recommended)

```bash
npm run excel-import process [options]
```

### Using tsx Directly

```bash
tsx src/cli/excel-import.ts process [options]
```

## Command Options

### Required Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--file <path>` | `-f` | Path to Excel file | `-f sheets/my-applicants.xlsx` |
| `--template-name <name>` | `-t` | Name of the email template to use | `-t welcome` |
| `--country <country>` | `-c` | Country to assign to all applicants | `-c USA` |

### Optional Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--url <url>` | `-u` | Express endpoint URL | `http://localhost:3000/api/upload-single` |
| `--force` | | Force resend emails even if already sent | `false` |
| `--dry-run` | | Parse and preview without sending to server | `false` |

## Usage Examples

### Basic Usage

Process an Excel file and send emails:

```bash
npm run excel-import process -f sheets/applicants.xlsx -t welcome -c USA
```

### Dry Run Mode

Preview the data without sending emails:

```bash
npm run excel-import process -f sheets/applicants.xlsx -t welcome -c USA --dry-run
```

### Force Resend Emails

Resend emails even if they were previously sent:

```bash
npm run excel-import process -f sheets/applicants.xlsx -t welcome -c USA --force
```

### Custom Server URL

Send data to a different server endpoint:

```bash
npm run excel-import process -f sheets/applicants.xlsx -t welcome -c USA -u https://api.example.com/api/upload-single
```

## Output and Results

### Validation Output

The CLI will display:
- Number of valid rows found
- Number of invalid rows (missing Name or Email)
- Preview of the first 5 valid rows

### Processing Output

For each applicant, the CLI shows:
- Applicant creation status (created / existing / skipped)
- Email sending status (sent / skipped / failed)
- Any error messages or retry attempts

### Final Summary

After processing, a summary is displayed:
- Total rows processed
- New applicants created
- Existing applicants found
- Invalid rows skipped
- Emails sent successfully
- Emails skipped
- Emails failed (if any)

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error occurred (file not found, invalid data, email failures, etc.) |

## Troubleshooting

### File Not Found
Ensure the Excel file path is correct and the file exists in the `sheets/` directory.

### Missing Required Columns
Verify your Excel file has the exact column names `Name` and `Email` in the correct order.

### Server Connection Failed
Ensure the Express server is running and accessible at the specified URL.

### Emails Not Sending
Check the server logs for detailed error messages. Use `--dry-run` first to validate your data.

## Creating a Sample Excel File

You can generate a sample Excel file using the provided script:

```bash
npm run create-sample-excel
```

This will create `sheets/sample-applicants.xlsx` with sample data for testing.
