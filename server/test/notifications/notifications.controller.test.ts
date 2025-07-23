import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../../src/notifications/notifications.controller';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { EmailService } from '../../src/email/email.service';
import { User } from '../../src/database/entities/user.entity';
import { Notification } from '../../src/database/entities/notification.entity';
import {
  NotificationQueryDto,
  NotificationResponseDto,
  PaginatedNotificationResponseDto,
} from '../../src/notifications/dto';
import { mockUsers } from '../mock-data';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: NotificationsService;
  let emailService: EmailService;

  const mockUser: User = mockUsers[0] as User;

  const mockNotification: Notification = {
    id: 1,
    userId: 1,
    articleId: 1,
    categoryId: 1,
    keywordId: null,
    isRead: false,
    isEmailed: false,
    createdAt: new Date('2023-01-01'),
    user: mockUser,
    article: null,
    category: null,
    keyword: null,
  };

  const mockNotificationsService = {
    getUserNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
    createNotification: jest.fn(),
    createNotifications: jest.fn(),
    markAsEmailed: jest.fn(),
  };

  const mockEmailService = {
    sendNotificationEmail: jest.fn(),
    sendEmail: jest.fn(),
    testConnection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return paginated user notifications', async () => {
      const query: NotificationQueryDto = {
        page: 1,
        limit: 10,
        isRead: false,
      };

      const mockPaginatedResponse = {
        notifications: [NotificationResponseDto.fromEntity(mockNotification)],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      } as PaginatedNotificationResponseDto;

      mockNotificationsService.getUserNotifications.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.getUserNotifications(mockUser, query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
        mockUser.id,
        query,
      );
    });

    it('should return notifications with default pagination', async () => {
      const query: NotificationQueryDto = {};

      const mockPaginatedResponse = {
        notifications: [NotificationResponseDto.fromEntity(mockNotification)],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      } as PaginatedNotificationResponseDto;

      mockNotificationsService.getUserNotifications.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.getUserNotifications(mockUser, query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
        mockUser.id,
        query,
      );
    });

    it('should handle empty notifications list', async () => {
      const query: NotificationQueryDto = { page: 1, limit: 10 };

      const mockEmptyResponse = {
        notifications: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      } as PaginatedNotificationResponseDto;

      mockNotificationsService.getUserNotifications.mockResolvedValue(
        mockEmptyResponse,
      );

      const result = await controller.getUserNotifications(mockUser, query);

      expect(result).toEqual(mockEmptyResponse);
      expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
        mockUser.id,
        query,
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notifications count', async () => {
      const mockCount = { count: 5 };
      mockNotificationsService.getUnreadCount.mockResolvedValue(mockCount);

      const result = await controller.getUnreadCount(mockUser);

      expect(result).toEqual(mockCount);
      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith(
        mockUser.id,
      );
    });

    it('should return zero when no unread notifications', async () => {
      const mockCount = { count: 0 };
      mockNotificationsService.getUnreadCount.mockResolvedValue(mockCount);

      const result = await controller.getUnreadCount(mockUser);

      expect(result).toEqual(mockCount);
      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notificationId = 1;
      const readNotification = { ...mockNotification, isRead: true };
      const mockResponse = NotificationResponseDto.fromEntity(readNotification);

      mockNotificationsService.markNotificationAsRead.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.markAsRead(mockUser, notificationId);

      expect(result).toEqual(mockResponse);
      expect(notificationsService.markNotificationAsRead).toHaveBeenCalledWith(
        mockUser.id,
        notificationId,
      );
    });

    it('should throw NotFoundException when notification not found', async () => {
      const notificationId = 999;
      mockNotificationsService.markNotificationAsRead.mockRejectedValue(
        new Error('Notification not found'),
      );

      await expect(
        controller.markAsRead(mockUser, notificationId),
      ).rejects.toThrow();
      expect(notificationsService.markNotificationAsRead).toHaveBeenCalledWith(
        mockUser.id,
        notificationId,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockCount = { count: 3 };
      mockNotificationsService.markAllNotificationsAsRead.mockResolvedValue(
        mockCount,
      );

      const result = await controller.markAllAsRead(mockUser);

      expect(result).toEqual(mockCount);
      expect(
        notificationsService.markAllNotificationsAsRead,
      ).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return zero when no unread notifications to mark', async () => {
      const mockCount = { count: 0 };
      mockNotificationsService.markAllNotificationsAsRead.mockResolvedValue(
        mockCount,
      );

      const result = await controller.markAllAsRead(mockUser);

      expect(result).toEqual(mockCount);
      expect(
        notificationsService.markAllNotificationsAsRead,
      ).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('sendTestEmail', () => {
    it('should send test email successfully', async () => {
      mockEmailService.sendNotificationEmail.mockResolvedValue(true);

      const result = await controller.sendTestEmail(mockUser);

      expect(result).toEqual({
        success: true,
        message: 'Test email sent successfully',
      });
      expect(emailService.sendNotificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          userEmail: mockUser.email,
          userName: mockUser.username,
          articles: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              title: 'Test Article: Breaking News in Technology',
              url: 'https://example.com/test-article-1',
              category: 'Technology',
              keyword: 'AI',
            }),
            expect.objectContaining({
              id: 2,
              title: 'Test Article: Sports Update',
              url: 'https://example.com/test-article-2',
              category: 'Sports',
            }),
          ]),
        }),
      );
    });

    it('should handle test email sending failure', async () => {
      mockEmailService.sendNotificationEmail.mockResolvedValue(false);

      const result = await controller.sendTestEmail(mockUser);

      expect(result).toEqual({
        success: false,
        message: 'Failed to send test email. Check server logs for details.',
      });
      expect(emailService.sendNotificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          userEmail: mockUser.email,
          userName: mockUser.username,
        }),
      );
    });

    it('should include test articles in email data', async () => {
      mockEmailService.sendNotificationEmail.mockResolvedValue(true);

      await controller.sendTestEmail(mockUser);

      expect(emailService.sendNotificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          articles: expect.arrayContaining([
            expect.objectContaining({
              title: 'Test Article: Breaking News in Technology',
              category: 'Technology',
              keyword: 'AI',
            }),
            expect.objectContaining({
              title: 'Test Article: Sports Update',
              category: 'Sports',
            }),
          ]),
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      mockNotificationsService.getUserNotifications.mockRejectedValue(error);

      await expect(
        controller.getUserNotifications(mockUser, {}),
      ).rejects.toThrow('Service error');
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockNotificationsService.getUnreadCount.mockRejectedValue(dbError);

      await expect(controller.getUnreadCount(mockUser)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid notification ID');
      mockNotificationsService.markNotificationAsRead.mockRejectedValue(
        validationError,
      );

      await expect(controller.markAsRead(mockUser, 1)).rejects.toThrow(
        'Invalid notification ID',
      );
    });
  });

  describe('authentication', () => {
    it('should use user from authentication decorator', async () => {
      const mockCount = { count: 2 };
      mockNotificationsService.getUnreadCount.mockResolvedValue(mockCount);

      await controller.getUnreadCount(mockUser);

      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith(
        mockUser.id,
      );
    });

    it('should pass user context to all service methods', async () => {
      const query: NotificationQueryDto = {};
      const mockResponse = {
        notifications: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      } as PaginatedNotificationResponseDto;

      mockNotificationsService.getUserNotifications.mockResolvedValue(
        mockResponse,
      );

      await controller.getUserNotifications(mockUser, query);

      expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
        mockUser.id,
        query,
      );
    });
  });
});
