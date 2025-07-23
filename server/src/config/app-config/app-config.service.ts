import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IServerConfig,
  IEnvironmentConfig,
  IDatabaseConfig,
  IJwtConfig,
  IMailConfig,
  IConfigService,
} from '../interfaces';

@Injectable()
export class AppConfigService implements IConfigService {
  constructor(private readonly configService: ConfigService) {}

  public getServerPort(): number {
    return Number(this.getValue('SERVER_PORT'));
  }

  public getEnvironment(): string {
    return this.getValue('NODE_ENV', false) || 'development';
  }

  public getDatabaseHost(): string {
    return this.getValue('DATABASE_HOST');
  }

  public getDatabasePort(): number {
    return Number(this.getValue('DATABASE_PORT'));
  }

  public getDatabaseUsername(): string {
    return this.getValue('DATABASE_USERNAME');
  }

  public getDatabasePassword(): string {
    return this.getValue('DATABASE_PASSWORD');
  }

  public getDatabaseName(): string {
    return this.getValue('DATABASE_NAME');
  }

  // Environment utility methods
  public isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  public isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  public getJwtSecret(): string {
    return this.getValue('JWT_SECRET');
  }

  public getJwtExpiresIn(): string {
    return this.getValue('JWT_EXPIRES_IN', false) || '7d';
  }

  // Email configuration methods
  public getMailHost(): string {
    return this.getValue('MAIL_HOST');
  }

  public getMailPort(): number {
    return Number(this.getValue('MAIL_PORT'));
  }

  public getMailSecure(): boolean {
    return this.getValue('MAIL_SECURE', false) === 'true';
  }

  public getMailUser(): string {
    return this.getValue('MAIL_USER');
  }

  public getMailPassword(): string {
    return this.getValue('MAIL_PASS');
  }

  public getMailFromName(): string {
    return this.getValue('MAIL_FROM_NAME', false) || 'News Aggregator';
  }

  public getMailFromAddress(): string {
    return this.getValue('MAIL_FROM_ADDRESS');
  }

  // Grouped configuration methods
  public getServerConfig(): IServerConfig {
    return {
      port: this.getServerPort(),
      environment: this.getEnvironment(),
    };
  }

  public getDatabaseConfig(): IDatabaseConfig {
    return {
      host: this.getDatabaseHost(),
      port: this.getDatabasePort(),
      username: this.getDatabaseUsername(),
      password: this.getDatabasePassword(),
      name: this.getDatabaseName(),
    };
  }

  public getJwtConfig(): IJwtConfig {
    return {
      secret: this.getJwtSecret(),
      expiresIn: this.getJwtExpiresIn(),
    };
  }

  public getMailConfig(): IMailConfig {
    return {
      host: this.getMailHost(),
      port: this.getMailPort(),
      secure: this.getMailSecure(),
      user: this.getMailUser(),
      password: this.getMailPassword(),
      fromName: this.getMailFromName(),
      fromAddress: this.getMailFromAddress(),
    };
  }

  public getEnvironmentConfig(): IEnvironmentConfig {
    return {
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      nodeEnv: this.getEnvironment(),
    };
  }

  // Legacy methods (deprecated - use grouped config methods instead)
  /** @deprecated Use getServerPort() instead */
  public getPort(): number {
    return this.getServerPort();
  }

  /** @deprecated Use getEnvironment() instead */
  public getNodeEnv(): string {
    return this.getEnvironment();
  }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.configService.get<string>(key);

    if (!value && throwOnMissing) {
      throw new Error(`Configuration key '${key}' is missing`);
    }

    return value;
  }
}
