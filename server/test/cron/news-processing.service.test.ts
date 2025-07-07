import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NewsProcessingService } from '../../src/cron/news-processing.service';
import { ArticlesService } from '../../src/articles/articles.service';
import { NotificationCreationService } from '../../src/notifications/notification-creation.service';
import { EmailNotificationService } from '../../src/notifications/email-notification.service';
import { mockArticles } from '../mock-data';

describe('NewsProcessingService', () => {
  let service: NewsProcessingService;
  let articlesService: ArticlesService;
  let notificationCreationService: NotificationCreationService;
  let emailNotificationService: EmailNotificationService;

  const mockArticlesService = {
    getUnprocessedArticles: jest.fn(),
    markArticlesAsProcessed: jest.fn(),
  };

  const mockNotificationCreationService = {
    createNotificationsForArticles: jest.fn(),
  };

  const mockEmailNotificationService = {
    sendNotificationsToUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsProcessingService,
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
        {
          provide: NotificationCreationService,
          useValue: mockNotificationCreationService,
        },
        {
          provide: EmailNotificationService,
          useValue: mockEmailNotificationService,
        },
      ],
    }).compile();

    service = module.get<NewsProcessingService>(NewsProcessingService);
    articlesService = module.get<ArticlesService>(ArticlesService);
    notificationCreationService = module.get<NotificationCreationService>(
      NotificationCreationService,
    );
    emailNotificationService = module.get<EmailNotificationService>(
      EmailNotificationService,
    );

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processUnprocessedArticles', () => {
    it('should successfully process unprocessed articles', async () => {
      const unprocessedArticles = [mockArticles[0], mockArticles[1]];
      const mockNotifications = [
        { id: 1, userId: 1, message: 'New article available' },
        { id: 2, userId: 2, message: 'New article available' },
      ];

      mockArticlesService.getUnprocessedArticles.mockResolvedValue(
        unprocessedArticles,
      );
      mockNotificationCreationService.createNotificationsForArticles.mockResolvedValue(
        mockNotifications,
      );
      mockEmailNotificationService.sendNotificationsToUsers.mockResolvedValue(
        undefined,
      );
      mockArticlesService.markArticlesAsProcessed.mockResolvedValue(undefined);

      const result = await service.processUnprocessedArticles();

      expect(result.success).toBe(true);
      expect(result.unprocessedArticlesCount).toBe(2);
      expect(result.articlesProcessed).toBe(2);
      expect(result.notificationsCreated).toBe(2);
      expect(result.emailsSent).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.processingTimeMs).toBeGreaterThan(0);

      expect(articlesService.getUnprocessedArticles).toHaveBeenCalledTimes(1);
      expect(
        notificationCreationService.createNotificationsForArticles,
      ).toHaveBeenCalledWith(unprocessedArticles);
      expect(
        emailNotificationService.sendNotificationsToUsers,
      ).toHaveBeenCalledWith(mockNotifications, unprocessedArticles);
      expect(articlesService.markArticlesAsProcessed).toHaveBeenCalledWith([
        mockArticles[0].id,
        mockArticles[1].id,
      ]);
    });

    it('should handle case with no unprocessed articles', async () => {
      mockArticlesService.getUnprocessedArticles.mockResolvedValue([]);

      const result = await service.processUnprocessedArticles();

      expect(result.success).toBe(true);
      expect(result.unprocessedArticlesCount).toBe(0);
      expect(result.articlesProcessed).toBe(0);
      expect(result.notificationsCreated).toBe(0);
      expect(result.emailsSent).toBe(0);
      expect(result.errors).toEqual([]);
      expect(result.processingTimeMs).toBeGreaterThan(0);

      expect(articlesService.getUnprocessedArticles).toHaveBeenCalledTimes(1);
      expect(
        notificationCreationService.createNotificationsForArticles,
      ).not.toHaveBeenCalled();
      expect(
        emailNotificationService.sendNotificationsToUsers,
      ).not.toHaveBeenCalled();
      expect(articlesService.markArticlesAsProcessed).not.toHaveBeenCalled();
    });

    it('should handle case with no notifications created', async () => {
      const unprocessedArticles = [mockArticles[0]];
      mockArticlesService.getUnprocessedArticles.mockResolvedValue(
        unprocessedArticles,
      );
      mockNotificationCreationService.createNotificationsForArticles.mockResolvedValue(
        [],
      );
      mockArticlesService.markArticlesAsProcessed.mockResolvedValue(undefined);

      const result = await service.processUnprocessedArticles();

      expect(result.success).toBe(true);
      expect(result.unprocessedArticlesCount).toBe(1);
      expect(result.articlesProcessed).toBe(1);
      expect(result.notificationsCreated).toBe(0);
      expect(result.emailsSent).toBe(0);
      expect(result.errors).toEqual([]);

      expect(articlesService.getUnprocessedArticles).toHaveBeenCalledTimes(1);
      expect(
        notificationCreationService.createNotificationsForArticles,
      ).toHaveBeenCalledWith(unprocessedArticles);
      expect(
        emailNotificationService.sendNotificationsToUsers,
      ).not.toHaveBeenCalled();
      expect(articlesService.markArticlesAsProcessed).toHaveBeenCalledWith([
        mockArticles[0].id,
      ]);
    });

    it('should handle error during getting unprocessed articles', async () => {
      const errorMessage = 'Database error';
      mockArticlesService.getUnprocessedArticles.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.processUnprocessedArticles()).rejects.toThrow(
        errorMessage,
      );

      expect(articlesService.getUnprocessedArticles).toHaveBeenCalledTimes(1);
      expect(
        notificationCreationService.createNotificationsForArticles,
      ).not.toHaveBeenCalled();
      expect(
        emailNotificationService.sendNotificationsToUsers,
      ).not.toHaveBeenCalled();
      expect(articlesService.markArticlesAsProcessed).not.toHaveBeenCalled();
    });

    it('should handle error during notification creation', async () => {
      const unprocessedArticles = [mockArticles[0]];
      const errorMessage = 'Notification creation failed';

      mockArticlesService.getUnprocessedArticles.mockResolvedValue(
        unprocessedArticles,
      );
      mockNotificationCreationService.createNotificationsForArticles.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.processUnprocessedArticles()).rejects.toThrow(
        errorMessage,
      );

      expect(articlesService.getUnprocessedArticles).toHaveBeenCalledTimes(1);
      expect(
        notificationCreationService.createNotificationsForArticles,
      ).toHaveBeenCalledWith(unprocessedArticles);
      expect(
        emailNotificationService.sendNotificationsToUsers,
      ).not.toHaveBeenCalled();
      expect(articlesService.markArticlesAsProcessed).not.toHaveBeenCalled();
    });

    it('should handle error during email sending', async () => {
      const unprocessedArticles = [mockArticles[0]];
      const mockNotifications = [
        { id: 1, userId: 1, message: 'New article available' },
      ];
      const errorMessage = 'Email sending failed';

      mockArticlesService.getUnprocessedArticles.mockResolvedValue(
        unprocessedArticles,
      );
      mockNotificationCreationService.createNotificationsForArticles.mockResolvedValue(
        mockNotifications,
      );
      mockEmailNotificationService.sendNotificationsToUsers.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.processUnprocessedArticles()).rejects.toThrow(
        errorMessage,
      );

      expect(articlesService.getUnprocessedArticles).toHaveBeenCalledTimes(1);
      expect(
        notificationCreationService.createNotificationsForArticles,
      ).toHaveBeenCalledWith(unprocessedArticles);
      expect(
        emailNotificationService.sendNotificationsToUsers,
      ).toHaveBeenCalledWith(mockNotifications, unprocessedArticles);
      expect(articlesService.markArticlesAsProcessed).not.toHaveBeenCalled();
    });

    it('should handle error during marking articles as processed', async () => {
      const unprocessedArticles = [mockArticles[0]];
      const mockNotifications = [
        { id: 1, userId: 1, message: 'New article available' },
      ];
      const errorMessage = 'Database update failed';

      mockArticlesService.getUnprocessedArticles.mockResolvedValue(
        unprocessedArticles,
      );
      mockNotificationCreationService.createNotificationsForArticles.mockResolvedValue(
        mockNotifications,
      );
      mockEmailNotificationService.sendNotificationsToUsers.mockResolvedValue(
        undefined,
      );
      mockArticlesService.markArticlesAsProcessed.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.processUnprocessedArticles()).rejects.toThrow(
        errorMessage,
      );

      expect(articlesService.getUnprocessedArticles).toHaveBeenCalledTimes(1);
      expect(
        notificationCreationService.createNotificationsForArticles,
      ).toHaveBeenCalledWith(unprocessedArticles);
      expect(
        emailNotificationService.sendNotificationsToUsers,
      ).toHaveBeenCalledWith(mockNotifications, unprocessedArticles);
      expect(articlesService.markArticlesAsProcessed).toHaveBeenCalledWith([
        mockArticles[0].id,
      ]);
    });

    it('should handle non-Error exceptions', async () => {
      const errorMessage = 'String error';
      mockArticlesService.getUnprocessedArticles.mockRejectedValue(
        errorMessage,
      );

      try {
        await service.processUnprocessedArticles();
      } catch (error) {
        // The service should rethrow the error
        expect(error).toBe(errorMessage);
      }
    });

    it('should log processing progress', async () => {
      const unprocessedArticles = [mockArticles[0], mockArticles[1]];
      const mockNotifications = [
        { id: 1, userId: 1, message: 'New article available' },
      ];

      mockArticlesService.getUnprocessedArticles.mockResolvedValue(
        unprocessedArticles,
      );
      mockNotificationCreationService.createNotificationsForArticles.mockResolvedValue(
        mockNotifications,
      );
      mockEmailNotificationService.sendNotificationsToUsers.mockResolvedValue(
        undefined,
      );
      mockArticlesService.markArticlesAsProcessed.mockResolvedValue(undefined);

      await service.processUnprocessedArticles();

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Starting processing of new articles...',
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Found 2 unprocessed articles',
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'News processing completed successfully: 2 articles processed, 1 notifications created',
      );
    });

    it('should log when no unprocessed articles found', async () => {
      mockArticlesService.getUnprocessedArticles.mockResolvedValue([]);

      await service.processUnprocessedArticles();

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'No unprocessed articles found',
      );
    });

    it('should log errors properly', async () => {
      const error = new Error('Test error');
      mockArticlesService.getUnprocessedArticles.mockRejectedValue(error);

      try {
        await service.processUnprocessedArticles();
      } catch (e) {
        // Expected to throw
      }

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error during news processing:',
        error,
      );
    });
  });

  describe('processNewArticles (deprecated)', () => {
    it('should call processUnprocessedArticles', async () => {
      const spy = jest
        .spyOn(service, 'processUnprocessedArticles')
        .mockResolvedValue({
          unprocessedArticlesCount: 0,
          notificationsCreated: 0,
          emailsSent: 0,
          articlesProcessed: 0,
          processingTimeMs: 100,
          success: true,
          errors: [],
        });

      await service.processNewArticles();

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });
});
