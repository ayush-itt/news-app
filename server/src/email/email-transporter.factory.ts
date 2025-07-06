import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '@/config/app-config/app-config.service';
import * as nodemailer from 'nodemailer';
import { IEmailTransporterConfig } from './interfaces';

export const EMAIL_TRANSPORTER = 'EMAIL_TRANSPORTER';

@Injectable()
export class EmailTransporterFactory {
  private static readonly logger = new Logger(EmailTransporterFactory.name);

  static async createTransporter(
    appConfigService: AppConfigService,
  ): Promise<nodemailer.Transporter> {
    try {
      const config: IEmailTransporterConfig = {
        host: appConfigService.getMailHost(),
        port: appConfigService.getMailPort(),
        secure: appConfigService.getMailSecure(),
        auth: {
          user: appConfigService.getMailUser(),
          pass: appConfigService.getMailPassword(),
        },
      };

      const transporter = nodemailer.createTransport(config);

      // Verify the connection
      await transporter.verify();
      this.logger.log(
        'Email transporter created and verified successfully (factory)',
      );

      return transporter;
    } catch (error) {
      this.logger.error('Failed to create email transporter:', error);
      throw error;
    }
  }
}
