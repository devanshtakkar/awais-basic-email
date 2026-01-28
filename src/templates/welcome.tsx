import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Column,
  Row,
  Font,
} from '@react-email/components';
import type { Review } from '../types/email.types.js';

interface WelcomeEmailProps {
  fullName: string;
  email: string;
  reviews?: Review[];
  startNowUrl?: string;
  unsubscribeUrl?: string;
}

const starIcon = '⭐';

export default function WelcomeEmail({
  fullName,
  email,
  reviews = [
    {
      name: 'Sarah M.',
      stars: 5,
      heading: 'Life-Changing Results',
      content: 'The strategies shared here helped me build a second income stream in just 3 months.',
    },
    {
      name: 'James K.',
      stars: 5,
      heading: 'Transparent & Reliable',
      content: 'No hidden fees, no pressure - just proven strategies that actually work.',
    },
    {
      name: 'Emily R.',
      stars: 5,
      heading: 'Expert Guidance',
      content: 'Tan\'s expertise in DeFi is unmatched. His frameworks are truly innovative.',
    },
  ],
  startNowUrl,
  unsubscribeUrl,
}: WelcomeEmailProps) {
  const renderStars = (count: number) => {
    return Array(count).fill(starIcon).join('');
  };

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Build Your Second Income Stream with Acron Trading</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={headerSection}>
            <Row>
              <Column align="left">
                <Heading style={logoText}>Acron Trading</Heading>
              </Column>
            </Row>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Heading style={heroHeading}>Dear {fullName},</Heading>
            <Text style={heroText}>
              Noticed you applied for a job and are working to improve your life. A job helps you manage today, but growth requires something more. That is why many people now focus on building a second income stream.
            </Text>
            <Text style={heroText}>
              This email outlines how they did it. Take your time to read it and review the feedback and progress shared here.
            </Text>
          </Section>

          {/* Success Reviews Section */}
          <Section style={reviewsSection}>
            <Heading style={sectionHeading}>Success Reviews</Heading>
            <Row>
              {reviews.map((review, index) => (
                <Column key={index} style={reviewColumn}>
                  <Section style={reviewCard}>
                    <Text style={reviewName}>{review.name}</Text>
                    <Text style={reviewStars}>{renderStars(review.stars)}</Text>
                    <Heading style={reviewHeading}>{review.heading}</Heading>
                    <Text style={reviewContent}>{review.content}</Text>
                    {review.readMoreUrl && (
                      <Link href={review.readMoreUrl} style={readMoreLink}>
                        Read More
                      </Link>
                    )}
                  </Section>
                </Column>
              ))}
            </Row>
          </Section>

          {/* Strategy Section */}
          <Section style={strategySection}>
            <Heading style={sectionHeading}>Our Strategy</Heading>
            <Text style={strategyText}>
              Our strategy is simple and transparent. We share our personal, proven strategies with you to help you succeed.
            </Text>
            <Text style={strategyText}>
              We do not charge any upfront fees and we never ask for personal information. If anyone claims to represent us and asks for money or details, do not share anything. Only after you start earning do we take our agreed share.
            </Text>
            <Text style={strategyText}>
              Before that, we ask for nothing at all.
            </Text>
            <Section style={buttonSection}>
              <Button style={ctaButton} href={startNowUrl}>
                Start Now
              </Button>
            </Section>
          </Section>

          {/* Tan's Bio Section */}
          <Section style={bioSection}>
            <Row>
              <Column style={bioImageColumn} align="center">
                <div style={bioImagePlaceholder}>
                  <Text style={bioImageText}>Tan</Text>
                </div>
              </Column>
              <Column style={bioContentColumn}>
                <Heading style={bioName}>Tan</Heading>
                <Text style={bioTitle}>Founder & Visionary</Text>
                <Text style={bioText}>
                  Tan quickly emerged as a rising star in the world of finance, earning recognition in global investment circles from a young age.
                </Text>
                <Text style={bioText}>
                  Fluent in four languages and having lived in Paris, New York, Amsterdam, and Dubai, his international experience helped him build a powerful cross-continental network and a rare global perspective.
                </Text>
                <Text style={bioText}>
                  A CFA charterholder with a background in investment banking, Tan made a bold pivot, stepping away from the traditional system to pioneer the future of decentralized finance.
                </Text>
                <Text style={bioText}>
                  Today, as a respected Nasdaq Contributor and the driving force behind Acron Trading, he develops innovative frameworks that combine the discipline of institutional portfolio management with the speed and edge of next-generation financial technology.
                </Text>
                <Text style={bioText}>
                  Through Acron Trading, his battle-tested strategies have helped thousands navigate and thrive in the fast-evolving DeFi landscape.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Footer Section */}
          <Section style={footerSection}>
            <Text style={footerText}>
              This email was sent to {email}. If you didn't request this, please ignore it.
            </Text>
            {unsubscribeUrl && (
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Unsubscribe
              </Link>
            )}
            <Text style={footerDisclaimer}>
              © {new Date().getFullYear()} Acron Trading. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  startNowUrl: 'https://acrontrading.com/start',
  unsubscribeUrl: 'https://acrontrading.com/unsubscribe',
} as WelcomeEmailProps;

// Styles
const main = {
  backgroundColor: '#F8FAFC',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
};

const headerSection = {
  backgroundColor: '#0F172A',
  padding: '24px 40px',
  borderBottom: '3px solid #F59E0B',
};

const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  margin: '0',
  padding: '0',
};

const heroSection = {
  padding: '40px 40px 32px',
  backgroundColor: '#ffffff',
};

const heroHeading = {
  color: '#0F172A',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 20px 0',
};

const heroText = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 16px 0',
};

const reviewsSection = {
  padding: '32px 40px',
  backgroundColor: '#F1F5F9',
};

const sectionHeading = {
  color: '#0F172A',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const reviewColumn = {
  width: '33.33%',
  padding: '0 8px',
};

const reviewCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
};

const reviewName = {
  color: '#0F172A',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const reviewStars = {
  color: '#F59E0B',
  fontSize: '16px',
  margin: '0 0 12px 0',
};

const reviewHeading = {
  color: '#1E40AF',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
};

const reviewContent = {
  color: '#475569',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
};

const readMoreLink = {
  color: '#1E40AF',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
};

const strategySection = {
  padding: '40px 40px',
  backgroundColor: '#ffffff',
  textAlign: 'center' as const,
};

const strategyText = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 16px 0',
};

const buttonSection = {
  marginTop: '32px',
};

const ctaButton = {
  backgroundColor: '#1E40AF',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 40px',
  textDecoration: 'none',
  display: 'inline-block',
};

const bioSection = {
  padding: '40px 40px',
  backgroundColor: '#F1F5F9',
};

const bioImageColumn = {
  width: '120px',
  paddingRight: '24px',
};

const bioImagePlaceholder = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: '#1E40AF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const bioImageText = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
};

const bioContentColumn = {
  width: 'calc(100% - 120px)',
};

const bioName = {
  color: '#0F172A',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px 0',
};

const bioTitle = {
  color: '#1E40AF',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const bioText = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0 0 12px 0',
};

const footerSection = {
  padding: '32px 40px',
  backgroundColor: '#0F172A',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#94A3B8',
  fontSize: '13px',
  margin: '0 0 12px 0',
};

const unsubscribeLink = {
  color: '#94A3B8',
  fontSize: '13px',
  textDecoration: 'underline',
  display: 'block',
  margin: '0 0 12px 0',
};

const footerDisclaimer = {
  color: '#64748B',
  fontSize: '11px',
  margin: '0',
};
