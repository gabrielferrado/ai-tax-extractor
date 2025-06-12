type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }

  public debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message), data);
    }
  }

  public info(message: string, data?: unknown): void {
    console.info(this.formatMessage('info', message), data);
  }

  public warn(message: string, data?: unknown): void {
    console.warn(this.formatMessage('warn', message), data);
  }

  public error(message: string, data?: unknown): void {
    console.error(this.formatMessage('error', message), data);
  }
}

export const logger = Logger.getInstance(); 