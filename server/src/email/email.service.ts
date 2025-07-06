import { Injectable, Logger, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from '@/config/app-config/app-config.service';
import { EMAIL_TRANSPORTER } from './email-transporter.factory';
import { EmailTemplateService } from './email-template.helper';
import { IEmailNotificationData, IGenericEmailData } from './interfaces';

export type { IEmailNotificationData as EmailNotificationData };
export type { IGenericEmailData as GenericEmailData };

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    @Inject(EMAIL_TRANSPORTER)
    private readonly transporter: nodemailer.Transporter,
  ) {}

  /**
   * Generic method to send any email to any address
   */
  async sendEmail(emailData: IGenericEmailData): Promise<boolean> {
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
  async sendNotificationEmail(data: IEmailNotificationData): Promise<boolean> {
    const htmlContent = this.emailTemplateService.generateHtmlTemplate(data);
    const textContent = this.emailTemplateService.generateTextTemplate(data);

    const emailData: IGenericEmailData = {
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
