import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components';

interface WelcomeEmailProps {
  fullName: string;
  email: string;
}

export default function WelcomeEmail({ fullName, email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Crypto Email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {fullName}!</Heading>
          <Text style={text}>Dear {fullName},</Text>
          <Text style={text}>
            Thank you for your interest in our crypto program. We're excited to have you on board!
          </Text>
          <Text style={text}>
            Your application has been received and is currently being reviewed. We'll get back to you soon with updates.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href="https://example.com">
              View Application Status
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions, feel free to reach out to us at{' '}
            <Link href="mailto:support@example.com">support@example.com</Link>.
          </Text>
          <Text style={footer}>
            This email was sent to {email}. If you didn't request this, please ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
} as WelcomeEmailProps;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
};

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  fontWeight: 'bold',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
};
