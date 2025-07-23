import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { NotificationRepository } from '../../src/database/repositories/notification.repository';
import { Notification } from '../../src/database/entities/notification.entity';
import {
  NotificationQueryDto,
  NotificationResponseDto,
} from '../../src/notifications/dto';
import { mockUsers } from '../mock-data';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: NotificationRepository;

  const mockUser = mockUsers[0] as any;

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

  const mockNotificationRepository = {
    findByUserIdWithReadStatus: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
    create: jest.fn(),
    saveNotifications: jest.fn(),
    markAsEmailed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<NotificationRepository>(NotificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return paginated user notifications', async () => {
      const userId = 1;
      const query: NotificationQueryDto = {
        page: 1,
        limit: 10,
        isRead: false,
      };
      const mockNotifications = [mockNotification];

      mockNotificationRepository.findByUserIdWithReadStatus.mockResolvedValue(
        mockNotifications,
      );

      const result = await service.getUserNotifications(userId, query);

      expect(result).toHaveProperty('notifications');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages', 1);
      expect(repository.findByUserIdWithReadStatus).toHaveBeenCalledWith(
        userId,
        false,
      );
    });

    it('should return notifications with default pagination', async () => {
      const userId = 1;
      const query: NotificationQueryDto = {};
      const mockNotifications = [mockNotification];

      mockNotificationRepository.findByUserIdWithReadStatus.mockResolvedValue(
        mockNotifications,
      );

      const result = await service.getUserNotifications(userId, query);

      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(repository.findByUserIdWithReadStatus).toHaveBeenCalledWith(
        userId,
        undefined,
      );
    });

    it('should handle empty notifications list', async () => {
      const userId = 1;
      const query: NotificationQueryDto = { page: 1, limit: 10 };

      mockNotificationRepository.findByUserIdWithReadStatus.mockResolvedValue(
        [],
      );

      const result = await service.getUserNotifications(userId, query);

      expect(result.notifications).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should filter by read status', async () => {
      const userId = 1;
      const query: NotificationQueryDto = { isRead: true };
      const readNotifications = [{ ...mockNotification, isRead: true }];

      mockNotificationRepository.findByUserIdWithReadStatus.mockResolvedValue(
        readNotifications,
      );

      const result = await service.getUserNotifications(userId, query);

      expect(repository.findByUserIdWithReadStatus).toHaveBeenCalledWith(
        userId,
        true,
      );
      expect(result.notifications).toHaveLength(1);
    });

    it('should handle pagination correctly', async () => {
      const userId = 1;
      const query: NotificationQueryDto = { page: 2, limit: 5 };
      const mockNotifications = Array(10).fill(mockNotification);

      mockNotificationRepository.findByUserIdWithReadStatus.mockResolvedValue(
        mockNotifications,
      );

      const result = await service.getUserNotifications(userId, query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.total).toBe(10);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      const userId = 1;
      const notificationId = 1;
      const readNotification = { ...mockNotification, isRead: true };

      mockNotificationRepository.markAsRead.mockResolvedValue(readNotification);

      const result = await service.markNotificationAsRead(
        userId,
        notificationId,
      );

      expect(result).toEqual(
        NotificationResponseDto.fromEntity(readNotification),
      );
      expect(repository.markAsRead).toHaveBeenCalledWith(
        notificationId,
        userId,
      );
    });

    it('should throw NotFoundException when notification not found', async () => {
      const userId = 1;
      const notificationId = 999;

      mockNotificationRepository.markAsRead.mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead(userId, notificationId),
      ).rejects.toThrow(NotFoundException);
      expect(repository.markAsRead).toHaveBeenCalledWith(
        notificationId,
        userId,
      );
    });

    it('should throw NotFoundException with correct message', async () => {
      const userId = 1;
      const notificationId = 999;

      mockNotificationRepository.markAsRead.mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead(userId, notificationId),
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read and return count', async () => {
      const userId = 1;
      const unreadCount = 5;

      mockNotificationRepository.getUnreadCount.mockResolvedValue(unreadCount);
      mockNotificationRepository.markAllAsRead.mockResolvedValue(undefined);

      const result = await service.markAllNotificationsAsRead(userId);

      expect(result).toEqual({ count: unreadCount });
      expect(repository.getUnreadCount).toHaveBeenCalledWith(userId);
      expect(repository.markAllAsRead).toHaveBeenCalledWith(userId);
    });

    it('should return zero count when no unread notifications', async () => {
      const userId = 1;

      mockNotificationRepository.getUnreadCount.mockResolvedValue(0);
      mockNotificationRepository.markAllAsRead.mockResolvedValue(undefined);

      const result = await service.markAllNotificationsAsRead(userId);

      expect(result).toEqual({ count: 0 });
      expect(repository.getUnreadCount).toHaveBeenCalledWith(userId);
      expect(repository.markAllAsRead).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notifications count', async () => {
      const userId = 1;
      const expectedCount = 3;

      mockNotificationRepository.getUnreadCount.mockResolvedValue(
        expectedCount,
      );

      const result = await service.getUnreadCount(userId);

      expect(result).toEqual({ count: expectedCount });
      expect(repository.getUnreadCount).toHaveBeenCalledWith(userId);
    });

    it('should return zero when no unread notifications', async () => {
      const userId = 1;

      mockNotificationRepository.getUnreadCount.mockResolvedValue(0);

      const result = await service.getUnreadCount(userId);

      expect(result).toEqual({ count: 0 });
      expect(repository.getUnreadCount).toHaveBeenCalledWith(userId);
    });
  });

  describe('createNotification', () => {
    it('should create a single notification', async () => {
      const notificationData = {
        userId: 1,
        articleId: 1,
        categoryId: 1,
        keywordId: null,
      };

      mockNotificationRepository.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification(notificationData);

      expect(result).toEqual(mockNotification);
      expect(repository.create).toHaveBeenCalledWith(notificationData);
    });

    it('should handle notification creation with all fields', async () => {
      const notificationData = {
        userId: 1,
        articleId: 1,
        categoryId: 1,
        keywordId: 1,
      };

      mockNotificationRepository.create.mockResolvedValue({
        ...mockNotification,
        keywordId: 1,
      });

      const result = await service.createNotification(notificationData);

      expect(result).toEqual(
        expect.objectContaining({
          userId: 1,
          articleId: 1,
          categoryId: 1,
          keywordId: 1,
        }),
      );
      expect(repository.create).toHaveBeenCalledWith(notificationData);
    });
  });

  describe('createNotifications', () => {
    it('should create multiple notifications', async () => {
      const notifications = [
        { userId: 1, articleId: 1, categoryId: 1 },
        { userId: 2, articleId: 1, categoryId: 2 },
      ];
      const createdNotifications = [
        mockNotification,
        { ...mockNotification, id: 2, userId: 2, categoryId: 2 },
      ];

      mockNotificationRepository.saveNotifications.mockResolvedValue(
        createdNotifications,
      );

      const result = await service.createNotifications(notifications);

      expect(result).toEqual(createdNotifications);
      expect(repository.saveNotifications).toHaveBeenCalledWith(notifications);
    });

    it('should handle empty notifications array', async () => {
      const notifications = [];

      mockNotificationRepository.saveNotifications.mockResolvedValue([]);

      const result = await service.createNotifications(notifications);

      expect(result).toEqual([]);
      expect(repository.saveNotifications).toHaveBeenCalledWith(notifications);
    });
  });

  describe('markAsEmailed', () => {
    it('should mark notifications as emailed', async () => {
      const notificationIds = [1, 2, 3];

      mockNotificationRepository.markAsEmailed.mockResolvedValue(undefined);

      await service.markAsEmailed(notificationIds);

      expect(repository.markAsEmailed).toHaveBeenCalledWith(notificationIds);
    });

    it('should handle empty notification IDs array', async () => {
      const notificationIds = [];

      mockNotificationRepository.markAsEmailed.mockResolvedValue(undefined);

      await service.markAsEmailed(notificationIds);

      expect(repository.markAsEmailed).toHaveBeenCalledWith(notificationIds);
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      const userId = 1;
      const error = new Error('Database error');

      mockNotificationRepository.findByUserIdWithReadStatus.mockRejectedValue(
        error,
      );

      await expect(service.getUserNotifications(userId, {})).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle repository connection errors', async () => {
      const userId = 1;
      const connectionError = new Error('Database connection failed');

      mockNotificationRepository.getUnreadCount.mockRejectedValue(
        connectionError,
      );

      await expect(service.getUnreadCount(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle constraint violations', async () => {
      const notificationData = {
        userId: 1,
        articleId: 1,
        categoryId: 1,
      };
      const constraintError = new Error('Unique constraint violation');

      mockNotificationRepository.create.mockRejectedValue(constraintError);

      await expect(
        service.createNotification(notificationData),
      ).rejects.toThrow('Unique constraint violation');
    });
  });

  describe('data validation', () => {
    it('should handle invalid user ID', async () => {
      const invalidUserId = -1;
      const query: NotificationQueryDto = {};

      mockNotificationRepository.findByUserIdWithReadStatus.mockResolvedValue(
        [],
      );

      const result = await service.getUserNotifications(invalidUserId, query);

      expect(result.notifications).toEqual([]);
      expect(repository.findByUserIdWithReadStatus).toHaveBeenCalledWith(
        invalidUserId,
        undefined,
      );
    });

    it('should handle invalid notification ID', async () => {
      const userId = 1;
      const invalidNotificationId = -1;

      mockNotificationRepository.markAsRead.mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead(userId, invalidNotificationId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
