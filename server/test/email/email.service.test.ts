import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { EmailService } from '../../src/email/email.service';
import { AppConfigService } from '../../src/config/app-config/app-config.service';
import { EmailTemplateService } from '../../src/email/email-template.helper';
import { EMAIL_TRANSPORTER } from '../../src/email/email-transporter.factory';
import {
  IEmailNotificationData,
  IGenericEmailData,
} from '../../src/email/interfaces';

describe('EmailService', () => {
  let service: EmailService;
  let appConfigService: AppConfigService;
  let emailTemplateService: EmailTemplateService;
  let mockTransporter: any;

  const mockAppConfigService = {
    getMailFromName: jest.fn(),
    getMailFromAddress: jest.fn(),
  };

  const mockEmailTemplateService = {
    generateHtmlTemplate: jest.fn(),
    generateTextTemplate: jest.fn(),
  };

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
        {
          provide: EmailTemplateService,
          useValue: mockEmailTemplateService,
        },
        {
          provide: EMAIL_TRANSPORTER,
          useValue: mockTransporter,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    appConfigService = module.get<AppConfigService>(AppConfigService);
    emailTemplateService =
      module.get<EmailTemplateService>(EmailTemplateService);

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully with provided from address', async () => {
      const emailData: IGenericEmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>',
        from: {
          name: 'Custom Sender',
          address: 'custom@example.com',
        },
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendEmail(emailData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Email sent successfully to test@example.com',
      );
    });

    it('should send email successfully with default from address', async () => {
      const emailData: IGenericEmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>',
      };

      mockAppConfigService.getMailFromName.mockReturnValue('Default Sender');
      mockAppConfigService.getMailFromAddress.mockReturnValue(
        'default@example.com',
      );
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendEmail(emailData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: {
          name: 'Default Sender',
          address: 'default@example.com',
        },
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });
      expect(appConfigService.getMailFromName).toHaveBeenCalledTimes(1);
      expect(appConfigService.getMailFromAddress).toHaveBeenCalledTimes(1);
    });

    it('should handle email sending failure', async () => {
      const emailData: IGenericEmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>',
      };

      const errorMessage = 'SMTP connection failed';
      mockTransporter.sendMail.mockRejectedValue(new Error(errorMessage));
      mockAppConfigService.getMailFromName.mockReturnValue('Default Sender');
      mockAppConfigService.getMailFromAddress.mockReturnValue(
        'default@example.com',
      );

      const result = await service.sendEmail(emailData);

      expect(result).toBe(false);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to send email to test@example.com:',
        errorMessage,
      );
    });

    it('should handle email with minimal data', async () => {
      const emailData: IGenericEmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
      };

      mockAppConfigService.getMailFromName.mockReturnValue('Default Sender');
      mockAppConfigService.getMailFromAddress.mockReturnValue(
        'default@example.com',
      );
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendEmail(emailData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: {
          name: 'Default Sender',
          address: 'default@example.com',
        },
        to: emailData.to,
        subject: emailData.subject,
        text: undefined,
        html: undefined,
      });
    });
  });

  describe('sendNotificationEmail', () => {
    it('should send notification email successfully', async () => {
      const notificationData: IEmailNotificationData = {
        userId: 1,
        userEmail: 'user@example.com',
        userName: 'John Doe',
        articles: [
          {
            id: 1,
            title: 'Test Article',
            url: 'https://example.com/article',
            category: 'Technology',
          },
        ],
      };

      const mockHtmlContent = '<div>HTML notification content</div>';
      const mockTextContent = 'Text notification content';

      mockEmailTemplateService.generateHtmlTemplate.mockReturnValue(
        mockHtmlContent,
      );
      mockEmailTemplateService.generateTextTemplate.mockReturnValue(
        mockTextContent,
      );
      mockAppConfigService.getMailFromName.mockReturnValue('News Aggregator');
      mockAppConfigService.getMailFromAddress.mockReturnValue(
        'noreply@example.com',
      );
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendNotificationEmail(notificationData);

      expect(result).toBe(true);
      expect(emailTemplateService.generateHtmlTemplate).toHaveBeenCalledWith(
        notificationData,
      );
      expect(emailTemplateService.generateTextTemplate).toHaveBeenCalledWith(
        notificationData,
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: {
          name: 'News Aggregator',
          address: 'noreply@example.com',
        },
        to: 'user@example.com',
        subject: 'New Articles Available - 1 article(s)',
        text: mockTextContent,
        html: mockHtmlContent,
      });
    });

    it('should handle multiple articles in notification', async () => {
      const notificationData: IEmailNotificationData = {
        userId: 1,
        userEmail: 'user@example.com',
        userName: 'John Doe',
        articles: [
          {
            id: 1,
            title: 'Test Article 1',
            url: 'https://example.com/article1',
            category: 'Technology',
          },
          {
            id: 2,
            title: 'Test Article 2',
            url: 'https://example.com/article2',
            category: 'Science',
          },
        ],
      };

      const mockHtmlContent = '<div>HTML notification content</div>';
      const mockTextContent = 'Text notification content';

      mockEmailTemplateService.generateHtmlTemplate.mockReturnValue(
        mockHtmlContent,
      );
      mockEmailTemplateService.generateTextTemplate.mockReturnValue(
        mockTextContent,
      );
      mockAppConfigService.getMailFromName.mockReturnValue('News Aggregator');
      mockAppConfigService.getMailFromAddress.mockReturnValue(
        'noreply@example.com',
      );
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendNotificationEmail(notificationData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New Articles Available - 2 article(s)',
        }),
      );
    });

    it('should handle notification email sending failure', async () => {
      const notificationData: IEmailNotificationData = {
        userId: 1,
        userEmail: 'user@example.com',
        userName: 'John Doe',
        articles: [
          {
            id: 1,
            title: 'Test Article',
            url: 'https://example.com/article',
            category: 'Technology',
          },
        ],
      };

      const mockHtmlContent = '<div>HTML notification content</div>';
      const mockTextContent = 'Text notification content';

      mockEmailTemplateService.generateHtmlTemplate.mockReturnValue(
        mockHtmlContent,
      );
      mockEmailTemplateService.generateTextTemplate.mockReturnValue(
        mockTextContent,
      );
      mockAppConfigService.getMailFromName.mockReturnValue('News Aggregator');
      mockAppConfigService.getMailFromAddress.mockReturnValue(
        'noreply@example.com',
      );
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await service.sendNotificationEmail(notificationData);

      expect(result).toBe(false);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to send email to user@example.com:',
        'SMTP error',
      );
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await service.testConnection();

      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalledTimes(1);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Email connection verified successfully',
      );
    });

    it('should return false when connection fails', async () => {
      const errorMessage = 'Connection failed';
      mockTransporter.verify.mockRejectedValue(new Error(errorMessage));

      const result = await service.testConnection();

      expect(result).toBe(false);
      expect(mockTransporter.verify).toHaveBeenCalledTimes(1);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Email connection failed:',
        errorMessage,
      );
    });
  });
});
