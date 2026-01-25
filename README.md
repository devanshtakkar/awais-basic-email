# Acorn Email System

A complete email dispatch system with open/click tracking, unsubscribe handling, and Excel import functionality.

## Features

- **Email Sending** - Send emails to applicants using React Email templates
- **Open Tracking** - 1x1 pixel tracking to detect when emails are opened
- **Click Tracking** - Track when recipients click links in emails
- **Unsubscribe Handling** - One-click unsubscribe support (RFC 8058)
- **Excel Import** - Bulk import applicants from Excel files
- **Deduplication** - Prevent duplicate emails to the same recipient
- **Retry Logic** - Automatic retry (up to 3 attempts) for failed emails
- **Email Logging** - Complete audit trail of all sent emails

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
DATABASE_URL="file:./dev.db"
PORT=3003

# SMTP Configuration
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@example.com"
SMTP_FROM_NAME="Acorn Email"

# URLs (use your production domain)
BASE_URL="https://acorn-email.anisht.com"
TRACKING_BASE_URL="https://acorn-email.anisht.com"
TRACKING_CLICK_SUBDOMAIN="https://acorn-email.anisht.com"
```

### 3. Setup Database
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start the Server
```bash
npm run server
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/upload-single` | POST | Upload applicant and send email |
| `/api/unsubscribe/:applicantId` | GET/POST | Handle unsubscribe |
| `/t/open/:emailLogId.png` | GET | Open tracking pixel |
| `/c/:emailLogId?url=<url>` | GET | Click tracking redirect |
| `/api/tracking/stats` | GET | Get overall tracking stats |
| `/api/tracking/:emailLogId` | GET | Get tracking for specific email |

## CLI Commands

### Send Emails
```bash
npm run send-emails -- send -l <limit> -t <template> [-c <country>] [--dry-run]
```

**Options:**
| Option | Description |
|--------|-------------|
| `-l, --limit` | Max number of applicants |
| `-t, --template-name` | Template name (e.g., `welcome`) |
| `-c, --country` | Filter by country (optional) |
| `--dry-run` | Preview without sending |

**Examples:**
```bash
# Send to 10 applicants
npm run send-emails -- send -l 10 -t welcome

# Send to USA applicants only
npm run send-emails -- send -l 5 -t welcome -c USA

# Preview without sending
npm run send-emails -- send -l 10 -t welcome --dry-run
```

### Import from Excel
```bash
npm run excel-import -- process -f <file> -t <template> [-c <country>] [--dry-run]
```

**Options:**
| Option | Description |
|--------|-------------|
| `-f, --file` | Path to Excel file |
| `-t, --template-name` | Template name |
| `-c, --country` | Country to assign |
| `--dry-run` | Preview without sending |

**Examples:**
```bash
# Import and send emails
npm run excel-import -- process -f sheets/data.xlsx -t welcome -c USA

# Preview import
npm run excel-import -- process -f sheets/data.xlsx -t welcome --dry-run
```

### Excel File Format

| Column | Required | Description |
|--------|----------|-------------|
| Name | Yes | Full name |
| Email | Yes | Email address |
| Job Title | No | Job title |
| phone | No | Phone number |
| country | Yes | Country |

## Project Structure

```
awais-basic-email/
├── src/
│   ├── cli/                 # CLI commands
│   ├── server/              # Express server
│   ├── services/            # Business logic
│   │   ├── applicant.service.ts
│   │   ├── email.service.ts
│   │   ├── email-sender.service.ts
│   │   ├── email-logs.service.ts
│   │   ├── template.service.ts
│   │   └── tracking.service.ts
│   ├── templates/           # React Email templates
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities (logger)
│   └── lib/                 # Prisma client
├── prisma/                  # Database schema & migrations
├── scripts/                 # Helper scripts
├── sheets/                  # Excel data files
└── package.json
```

## Adding New Templates

1. Create template in `src/templates/`:
```tsx
import { Body, Container, Html, Text } from '@react-email/components';

interface Props {
  fullName: string;
  email: string;
}

export function MyTemplate({ fullName, email }: Props) {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Hello {fullName}!</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

2. Register in `src/templates/index.ts`:
```typescript
templateService.registerTemplate('my-template', (data) => ({
  subject: `Hello, ${data.fullName}!`,
  component: MyTemplate(data),
}));
```

## Database Models

### Applicants
- `id` - UUID
- `full_name` - Full name
- `email` - Unique email address
- `phone` - Phone number
- `country` - Country
- `job_title` - Job title
- `unsubscribed` - Unsubscribe status
- `unsubscribedAt` - Unsubscribe timestamp
- `unsubscribedFromEmail` - Which email triggered unsubscribe

### EmailLogs
- `id` - UUID
- `applicantId` - Reference to applicant
- `templateName` - Template used
- `status` - success/failed/pending
- `emailSubject` - Subject line
- `emailBody` - HTML content
- `openedAt` - First open timestamp
- `openCount` - Total opens
- `clickedAt` - First click timestamp
- `clickCount` - Total clicks
- `clickedUrl` - Last clicked URL

## License

ISC
