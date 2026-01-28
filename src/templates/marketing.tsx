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
import { config } from 'dotenv';
config();

const BASE_URL = process.env.BASE_URL;

export interface MarketingReview {
    title: string;
    content: string;
    by: string;
}

interface MarketingEmailProps {
    fullName: string;
    email: string;
    reviews?: MarketingReview[];
    baseUrl: string;
    journeyUrl: string;
    reviewsUrl: string;
    spotUrl: string;
    unsubscribeUrl?: string;
    deadlineDate?: string;
}

export default function MarketingEmail({
    fullName,
    email,
    reviews = [
        {
            title: 'The best financial decision I\'ve made in 8 years.',
            content: 'Post self-employment 8 years ago, joining Decentralized Masters is the best financial decision I\'ve ever made. I see the future now more clearly and you just cannot put a price tag on that… I am just in my 9th week and I\'m in the green. I have knowledge for long-term growth outside of the bull market that builds long-term income and is collateralized.',
            by: 'Joseph J.',
        },
        {
            title: 'This has been the best learning experience of my life...',
            content: 'This program has been the most enjoyable and the most productive learning experience I\'ve ever had. Rodrigo is the man and either straightens out my old-fashioned way of thinking or gets me the answers to my questions. He goes above and beyond my expectations and the program has nearly paid for itself. Invest in this and invest in yourself and you will never go wrong.',
            by: 'Andy C.',
        },
    ],
    baseUrl,
    journeyUrl,
    reviewsUrl,
    spotUrl,
    unsubscribeUrl,
    deadlineDate,
}: MarketingEmailProps) {
    // Calculate deadline date if not provided (4 days from now)
    const getDeadlineDate = () => {
        if (deadlineDate) return deadlineDate;
        const date = new Date();
        date.setDate(date.getDate() + 4);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <Html>
            <Head>
                <style>{`
                    @media only screen and (max-width: 380px) {
                        .review-column {
                            width: 100% !important;
                            display: block !important;
                            padding: 0 0 16px 0 !important;
                        }
                        .review-row {
                            display: block !important;
                        }
                    }
                `}</style>
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
            <Preview>Build Your Financial Independence - Limited Spots Available</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header Section */}
                    <Section style={headerSection}>
                      <Row>
                        <Column align="left">
                          <table style={logoTable}>
                            <tr>
                              <td style={logoCell}>
                                <Img
                                  src={`${baseUrl}/public/Acorns-Logo.svg`}
                                  alt="Acorns Logo"
                                  width="32"
                                  height="32"
                                  style={logo}
                                />
                              </td>
                              <td style={logoTextCell}>
                                <Text style={logoText}>Acorns Trade</Text>
                              </td>
                            </tr>
                          </table>
                        </Column>
                      </Row>
                    </Section>

                    {/* Hook Section */}
                    <Section style={hookSection}>
                        <Heading style={hookHeading}>Dear {fullName},</Heading>
                        <Text style={hookText}>
                            Remember when they told us to study hard, get good grades, and find a 'stable' job? That path was supposed to lead to security, but in today's market, it's leading to anxiety and uncertainty.
                        </Text>
                        <Text style={hookText}>
                            But what if you could leverage that sharp, analytical mind they praised in your performance reviews to build something that no one can take away from you? It's time to stop trading hours for dollars and start creating a secondary income stream that works while you sleep.
                        </Text>
                        <Text style={hookText}>
                            This isn't about getting rich overnight – it's about breaking free from the cycle of mediocrity and finally building the independence you've always wanted. The question is, are you ready to stop being an employee and start being the boss of your own financial future?
                        </Text>
                        <Section style={hookCtaSection}>
                            <Button style={hookCtaButton} href={journeyUrl}>
                                Start Your Journey Today
                            </Button>
                        </Section>
                    </Section>

                    {/* Reviews Section */}
                    <Section style={reviewsSection}>
                        <Heading style={sectionHeading}>What Our Members Say</Heading>
                        <Row className="review-row">
                            {reviews.map((review, index) => (
                                <Column key={index} style={reviewColumn} className="review-column">
                                    <Section style={reviewCard}>
                                        <Text style={quotationMark}>"</Text>
                                        <Img
                                            src={`${baseUrl}/public/trustpilot-5stars.svg`}
                                            alt="5 Stars"
                                            width="100"
                                            height="20"
                                            style={starsImage}
                                        />
                                        <Heading style={reviewTitle}>{review.title}</Heading>
                                        <Text style={reviewContent}>{review.content}</Text>
                                        <Text style={reviewBy}>{review.by}</Text>
                                    </Section>
                                </Column>
                            ))}
                        </Row>
                        <Section style={moreReviewsButtonSection}>
                            <Button style={secondaryButton} href={reviewsUrl}>
                                See More Reviews
                            </Button>
                        </Section>
                    </Section>

                    {/* The Secret Section */}
                    <Section style={secretSection}>
                        <Heading style={secretHeading}>The Secret</Heading>
                        <Text style={secretText}>
                            While others sleep or commute, wealth is being made. It's not luck, it's one simple pattern that repeats daily. Our proven strategy helps you succeed.
                        </Text>
                        <Text style={secretText}>
                            For a limited time, there's zero upfront cost. We ask only for your trust. We're opening just <strong>150 spots</strong> till <strong>{getDeadlineDate()}</strong> to maintain quality.
                        </Text>
                        <Text style={secretText}>
                            Click now before they're all gone.
                        </Text>
                        <Section style={ctaButtonSection}>
                            <Button style={ctaButton} href={spotUrl}>
                                Claim Your Spot Now
                            </Button>
                        </Section>
                    </Section>

                    {/* Footer Section */}
                    <Section style={footerSection}>
                        <Section style={footerLinksSection}>
                            <Link href="https://acornstrade.com/terms" style={footerLink}>
                                Terms of Service
                            </Link>
                            <Text style={footerLinkSeparator}>•</Text>
                            <Link href="https://acornstrade.com/privacy" style={footerLink}>
                                Privacy Policy
                            </Link>
                            <Text style={footerLinkSeparator}>•</Text>
                            <Link href="https://acornstrade.com/risk-warning" style={footerLink}>
                                Risk Disclosure
                            </Link>
                        </Section>
                        <Text style={footerText}>
                            This email was sent to {email}.
                        </Text>
                        {unsubscribeUrl && (
                            <Link href={unsubscribeUrl} style={unsubscribeLink}>
                                Unsubscribe from these emails
                            </Link>
                        )}
                        <Text style={footerDisclaimer}>
                            © {new Date().getFullYear()} Acorns Trade. All rights reserved.
                        </Text>
                        <Text style={trademarkText}>
                            Acorns logo are registered trademarks of Acorns Grow Incorporated. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

MarketingEmail.PreviewProps = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    baseUrl: BASE_URL ? BASE_URL : 'https://acornstrade.com',
    journeyUrl: 'https://acornstrade.com?cta=start_journey',
    reviewsUrl: 'https://acornstrade.com?cta=more_reviews',
    spotUrl: 'https://acornstrade.com?cta=claim_spot',
    unsubscribeUrl: 'https://acornstrade.com/unsubscribe',
} as MarketingEmailProps;

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
    backgroundColor: '#FFFFFF',
    padding: '24px 40px',
    borderBottom: '3px solid #22C55E',
};

const logoTable = {
    borderCollapse: 'collapse' as const,
    borderSpacing: '0',
};

const logoCell = {
    paddingRight: '12px',
    verticalAlign: 'middle',
};

const logoTextCell = {
    verticalAlign: 'middle',
};

const logo = {
    display: 'block',
    margin: '0',
};

const logoText = {
    color: '#166534',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0',
    lineHeight: '1',
};

const hookSection = {
    padding: '40px 40px 32px',
    backgroundColor: '#FFFFFF',
};

const hookHeading = {
    color: '#1A1A1A',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.4',
    margin: '0 0 24px 0',
};

const hookText = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '1.8',
    margin: '0 0 20px 0',
};

const hookCtaSection = {
    marginTop: '24px',
    textAlign: 'center' as const,
};

const hookCtaButton = {
    backgroundColor: '#22C55E',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '700',
    padding: '16px 40px',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
};

const reviewsSection = {
    padding: '40px 40px',
    backgroundColor: '#F0FDF4',
};

const sectionHeading = {
    color: '#166534',
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 32px 0',
    textAlign: 'center' as const,
};

const reviewColumn = {
    width: '50%',
    padding: '0 8px',
};

const reviewCard = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)',
    position: 'relative' as const,
};

const quotationMark = {
    color: '#22C55E',
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: '1',
    margin: '0 0 8px 0',
    fontFamily: 'Georgia, serif',
};

const starsImage = {
    display: 'block',
    margin: '8px 0 16px 0',
};

const reviewTitle = {
    color: '#166534',
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
};

const reviewContent = {
    color: '#4B5563',
    fontSize: '14px',
    lineHeight: '1.7',
    margin: '0 0 16px 0',
};

const reviewBy = {
    color: '#22C55E',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
    fontStyle: 'italic' as const,
};

const moreReviewsButtonSection = {
    marginTop: '32px',
    textAlign: 'center' as const,
};

const secondaryButton = {
    backgroundColor: '#FFFFFF',
    color: '#22C55E',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    padding: '12px 32px',
    textDecoration: 'none',
    display: 'inline-block',
    border: '2px solid #22C55E',
};

const secretSection = {
    padding: '48px 40px',
    backgroundColor: '#FFFFFF',
    textAlign: 'center' as const,
};

const secretHeading = {
    color: '#166534',
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 24px 0',
    letterSpacing: '-0.5px',
};

const secretText = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '1.8',
    margin: '0 0 20px 0',
};

const ctaButtonSection = {
    marginTop: '40px',
};

const ctaButton = {
    backgroundColor: '#22C55E',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '700',
    padding: '18px 48px',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
};

const footerSection = {
    padding: '40px 40px',
    backgroundColor: '#1A1A1A',
    textAlign: 'center' as const,
};

const footerLinksSection = {
    marginBottom: '24px',
};

const footerLink = {
    color: '#9CA3AF',
    fontSize: '13px',
    textDecoration: 'underline',
    display: 'inline-block',
    margin: '0 8px',
};

const footerLinkSeparator = {
    color: '#4B5563',
    fontSize: '13px',
    display: 'inline-block',
    margin: '0 8px',
};

const footerText = {
    color: '#9CA3AF',
    fontSize: '13px',
    margin: '0 0 16px 0',
};

const unsubscribeLink = {
    color: '#D1D5DB',
    fontSize: '13px',
    textDecoration: 'underline',
    display: 'block',
    margin: '0 0 16px 0',
};

const footerDisclaimer = {
    color: '#6B7280',
    fontSize: '12px',
    margin: '0 0 12px 0',
};

const trademarkText = {
    color: '#4B5563',
    fontSize: '11px',
    lineHeight: '1.6',
    margin: '0',
};
