import { templateService } from '../services/template.service.js';
import WelcomeEmail from './welcome.js';
import MarketingEmail, { MarketingReview } from './marketing.js';


/**
 * Register all email templates with the TemplateService
 * This file should be imported before the server starts to ensure all templates are available
 */
export function registerTemplates() {
  // Register welcome template (Acron Trading email)
  templateService.registerTemplate('welcome', (data) => ({
    subject: 'Build Your Second Income Stream with Acron Trading',
    component: WelcomeEmail({
      fullName: data.fullName,
      email: data.email,
      reviews: data.reviews,
      startNowUrl: data.startNowUrl || 'https://acrontrading.com',
      unsubscribeUrl: data.unsubscribeUrl,
    }),
  }));

  // Register marketing template (Acorns Trade email)
  templateService.registerTemplate('marketing', (data) => ({
    subject: 'Build Your Financial Independence - Limited Spots Available',
    component: MarketingEmail({
      fullName: data.fullName,
      email: data.email,
      reviews: data.reviews as MarketingReview[] | undefined,
      baseUrl: data.baseUrl || 'https://acornstrade.com',
      journeyUrl: data.journeyUrl || 'https://acornstrade.com?cta=start_journey',
      reviewsUrl: data.reviewsUrl || 'https://acornstrade.com?cta=more_reviews',
      spotUrl: data.spotUrl || 'https://acornstrade.com?cta=claim_spot',
      unsubscribeUrl: data.unsubscribeUrl,
      deadlineDate: data.deadlineDate,
    }),
  }));

  // Add more templates here as needed
  // templateService.registerTemplate('template-name', (data) => ({ ... }));
}

// Auto-register templates when this module is imported
registerTemplates();
