import { render } from '@react-email/render';
import type { TemplateData } from '../types/email.types.js';
import { Logger } from '../utils/logger.js';

const templateLogger = new Logger('TemplateService');

export interface TemplateResult {
  html: string;
  subject: string;
}

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
    return this.templates.has(templateName);
  }
}

export const templateService = new TemplateService();
