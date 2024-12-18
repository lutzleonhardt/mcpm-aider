import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  public debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const formattedMessage = this.formatMessage('DEBUG', message);
    console.error(chalk.gray(formattedMessage), ...args);
  }

  public info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const formattedMessage = this.formatMessage('INFO', message);
    console.error(chalk.blue(formattedMessage), ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const formattedMessage = this.formatMessage('WARN', message);
    console.error(chalk.yellow(formattedMessage), ...args);
  }

  public error(message: string, ...args: unknown[]): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const formattedMessage = this.formatMessage('ERROR', message);
    console.error(chalk.red(formattedMessage), ...args);
  }
}

// Export a singleton instance
export const logger = Logger.getInstance();
