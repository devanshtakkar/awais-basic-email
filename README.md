# Crypto Email CLI

A CLI tool for sending emails to applicants using nodemailer and React Email templates.

## Features

- Send emails to applicants stored in the database
- Select email templates by name
- Filter applicants by country
- Dry-run mode for testing
- Automatic retry logic (up to 3 retries) for failed emails
- Email logging to track all sent emails
- One applicant can receive multiple emails

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your SMTP settings:
```env
DATABASE_URL="file:./dev.db"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@example.com"
SMTP_FROM_NAME="Crypto Email"
```

3. Run database migrations:
```bash
npx prisma migrate dev --name init
```

4. (Optional) Seed test applicants:
```bash
npx tsx scripts/seed-applicants.ts
```

## Usage

### Send emails to applicants

```bash
npm run send-emails -- send -l <limit> -t <template-name> [options]
```

### Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--limit` | `-l` | Maximum number of applicants to send emails to | Yes |
| `--template-name` | `-t` | Name of the email template to use | Yes |
| `--country` | `-c` | Filter applicants by country (optional) | No |
| `--dry-run` | N/A | Preview without sending actual emails | No |

### Examples

Send emails to first 10 applicants:
```bash
npm run send-emails -- send -l 10 -t welcome
```

Send emails to first 5 applicants from Canada:
```bash
npm run send-emails -- send -l 5 -t welcome -c Canada
```

Dry run to preview:
```bash
npm run send-emails -- send -l 10 -t welcome --dry-run
```

## Available Templates

Currently available templates:
- `welcome` - Welcome email for new applicants

## Adding New Templates

1. Create a new template file in `src/templates/`:
```tsx
// src/templates/my-template.tsx
import { Body, Container, Head, Html, Text } from '@react-email/components';

interface MyTemplateProps {
  firstName: string;
  lastName: string;
  email: string;
}

export function MyTemplate({ firstName, lastName, email }: MyTemplateProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hello {firstName}!</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

2. Register the template in `src/cli/index.ts`:
```typescript
import { MyTemplate } from '../templates/my-template.js';

templateService.registerTemplate('my-template', (data) => ({
  subject: `Hello, ${data.firstName}!`,
  component: MyTemplate(data),
}));
```

## Database Schema

### Applicants
```prisma
model Applicants {
  id         String     @id @default(uuid())
  first_name String
  last_name  String
  email      String     @unique
  phone      String?
  country    String?
  emailLogs  EmailLogs[]
}
```

### EmailLogs
```prisma
model EmailLogs {
  id            String     @id @default(uuid())
  applicantId   String
  applicant     Applicants @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  templateName  String
  sentAt        DateTime   @default(now())
  status        String     // 'success' | 'failed'
  errorMessage  String?
  emailSubject  String
  emailBody     String
  retryCount    Int        @default(0)
}
```

## Project Structure

```
crypto-email/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── cli/
│   │   └── index.ts           # CLI entry point with commander
│   ├── services/
│   │   ├── applicant.service.ts
│   │   ├── email.service.ts   # Nodemailer configuration
│   │   ├── template.service.ts # React Email rendering
│   │   ├── email-logs.service.ts
│   │   └── email-sender.service.ts
│   ├── templates/
│   │   └── welcome.tsx        # React Email components
│   ├── types/
│   │   └── email.types.ts
│   ├── utils/
│   │   └── logger.ts
│   └── lib/
│       └── prisma.ts
├── scripts/
│   └── seed-applicants.ts
├── .env
├── .env.example
└── package.json
```

## License

ISC
