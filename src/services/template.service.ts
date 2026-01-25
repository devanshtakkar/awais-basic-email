import { render } from '@react-email/render';
import type { TemplateData } from '../types/email.types.js';
import { Logger } from '../utils/logger.js';

const templateLogger = new Logger('TemplateService');

export interface TemplateResult {
  html: string;
  subject: string;
}

// Map of template name to module path for dynamic imports
const templatePaths: Record<string, string> = {
  welcome: '../templates/welcome.js',
};

// Cache for dynamic imports with timestamp to detect file changes
const templateCache = new Map<string, { module: any; timestamp: number }>();

export class TemplateService {
  private templates: Map<string, (data: TemplateData) => { subject: string; component: any }> = new Map();

  registerTemplate(
    name: string,
    templateFn: (data: TemplateData) => { subject: string; component: any }
  ): void {
    this.templates.set(name, templateFn);
    templateLogger.info(`Template '${name}' registered`);
  }

  async renderTemplate(templateName: string, data: TemplateData): Promise<TemplateResult> {
    // Check if we have a dynamic import path for this template
    const templatePath = templatePaths[templateName];
    
    if (templatePath) {
      try {
        // Re-import the template module to get the latest version
        // Adding a timestamp query parameter to bypass module caching
        const timestamp = Date.now();
        const templateModule = await import(`${templatePath}?t=${timestamp}`);
        const WelcomeEmail = templateModule.default;
        
        // Create component with data
        const component = WelcomeEmail({
          fullName: data.fullName,
          email: data.email,
          reviews: data.reviews,
          startNowUrl: data.startNowUrl || 'https://acrontrading.com/start',
          unsubscribeUrl: data.unsubscribeUrl,
        });
        
        const subject = 'Build Your Second Income Stream with Acron Trading';
        const html = await render(component);
        
        templateLogger.success(`Template '${templateName}' rendered successfully (dynamic import)`);
        
        return { html, subject };
      } catch (error) {
        templateLogger.error(`Failed to dynamically import template '${templateName}': ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
    
    // Fall back to registered template if no dynamic path
    const templateFn = this.templates.get(templateName);

    if (!templateFn) {
      throw new Error(`Template '${templateName}' not found`);
    }

    try {
      const { subject, component } = templateFn(data);
      const html = await render(component);

      templateLogger.success(`Template '${templateName}' rendered successfully`);

      return {
        html,
        subject,
      };
    } catch (error) {
      templateLogger.error(`Failed to render template '${templateName}': ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  hasTemplate(templateName: string): boolean {
    return this.templates.has(templateName) || !!templatePaths[templateName];
  }
}

export const templateService = new TemplateService();
