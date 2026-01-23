import { templateService } from '../services/template.service.js';
import WelcomeEmail from './welcome.js';

/**
 * Register all email templates with the TemplateService
 * This file should be imported before the server starts to ensure all templates are available
 */
export function registerTemplates() {
  // Register welcome template
  templateService.registerTemplate('welcome', (data) => ({
    subject: 'Welcome to Crypto Email',
    component: WelcomeEmail({
      fullName: data.fullName,
      email: data.email,
    }),
  }));

  // Add more templates here as needed
  // templateService.registerTemplate('template-name', (data) => ({ ... }));
}

// Auto-register templates when this module is imported
registerTemplates();
