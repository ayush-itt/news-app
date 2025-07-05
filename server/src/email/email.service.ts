import { Injectable, Logger, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from '@/config/app-config/app-config.service';
import { EMAIL_TRANSPORTER } from './email-transporter.factory';
import { EmailTemplateHelper } from './email-template.helper';

export interface EmailNotificationData {
  userId: number;
  userEmail: string;
  userName: string;
  articles: {
    id: number;
    title: string;
    url: string;
    category?: string;
    keyword?: string;
  }[];
}

export interface GenericEmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: {
    name: string;
    address: string;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly appConfigService: AppConfigService,
    @Inject(EMAIL_TRANSPORTER)
    private readonly transporter: nodemailer.Transporter,
  ) {}

  /**
   * Generic method to send any email to any address
   */
  async sendEmail(emailData: GenericEmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: emailData.from || {
          name: this.appConfigService.getMailFromName(),
          address: this.appConfigService.getMailFromAddress(),
        },
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${emailData.to}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${emailData.to}:`,
        error.message,
      );
      return false;
    }
  }

  /**
   * Specific method for notification emails (uses generic sendEmail internally)
   */
  async sendNotificationEmail(data: EmailNotificationData): Promise<boolean> {
    const htmlContent = EmailTemplateHelper.generateHtmlTemplate(data);
    const textContent = EmailTemplateHelper.generateTextTemplate(data);

    const emailData: GenericEmailData = {
      to: data.userEmail,
      subject: `New Articles Available - ${data.articles.length} article(s)`,
      text: textContent,
      html: htmlContent,
    };

    return this.sendEmail(emailData);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('Email connection failed:', error.message);
      return false;
    }
  }
}
