export class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }

  info(message: string): void {
    console.log(`\x1b[36m${this.formatMessage(message)}\x1b[0m`);
  }

  success(message: string): void {
    console.log(`\x1b[32m✓ ${this.formatMessage(message)}\x1b[0m`);
  }

  error(message: string): void {
    console.error(`\x1b[31m✗ ${this.formatMessage(message)}\x1b[0m`);
  }

  warn(message: string): void {
    console.warn(`\x1b[33m⚠ ${this.formatMessage(message)}\x1b[0m`);
  }

  dryRun(message: string): void {
    console.log(`\x1b[90m[DRY RUN] ${this.formatMessage(message)}\x1b[0m`);
  }

  section(message: string): void {
    console.log(`\n\x1b[1m\x1b[36m${message}\x1b[0m`);
  }
}

export const logger = new Logger();
