import { templateService } from '../services/template.service.js';
import WelcomeEmail from './welcome.js';


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



  // Add more templates here as needed
  // templateService.registerTemplate('template-name', (data) => ({ ... }));
}

// Auto-register templates when this module is imported
registerTemplates();
