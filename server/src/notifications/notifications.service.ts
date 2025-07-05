import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '@/database/repositories/notification.repository';
import {
  NotificationResponseDto,
  PaginatedNotificationResponseDto,
  NotificationQueryDto,
} from './dto';
import { Notification } from '@/database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  private paginateAndConvertToDto(
    notifications: Notification[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedNotificationResponseDto {
    const paginatedNotifications = notifications.slice(
      (page - 1) * limit,
      page * limit,
    );
    const notificationDtos = NotificationResponseDto.fromEntities(
      paginatedNotifications,
    );
    return PaginatedNotificationResponseDto.fromData(
      notificationDtos,
      total,
      page,
      limit,
    );
  }

  async getUserNotifications(
    userId: number,
    query: NotificationQueryDto,
  ): Promise<PaginatedNotificationResponseDto> {
    const { page = 1, limit = 10, isRead } = query;

    // Handle unread notifications
    const notifications =
      await this.notificationRepository.findByUserIdWithReadStatus(
        userId,
        isRead,
      );
    return this.paginateAndConvertToDto(
      notifications,
      notifications.length,
      page,
      limit,
    );
  }

  async markNotificationAsRead(
    userId: number,
    notificationId: number,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.markAsRead(
      notificationId,
      userId,
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return NotificationResponseDto.fromEntity(notification);
  }

  async markAllNotificationsAsRead(userId: number): Promise<{ count: number }> {
    // Get the count of unread notifications before marking them as read
    const unreadCount =
      await this.notificationRepository.getUnreadCount(userId);
    // Mark all unread notifications as read
    await this.notificationRepository.markAllAsRead(userId);
    return { count: unreadCount };
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.notificationRepository.getUnreadCount(userId);
    return { count };
  }

  // This method will be called by the cron job for creating notifications
  async createNotification(data: {
    userId: number;
    articleId?: number;
    categoryId?: number;
    keywordId?: number;
  }): Promise<Notification> {
    return this.notificationRepository.create(data);
  }

  async createNotifications(
    notifications: Partial<Notification>[],
  ): Promise<Notification[]> {
    return await this.notificationRepository.saveNotifications(notifications);
  }

  async markAsEmailed(notificationIds: number[]): Promise<void> {
    await this.notificationRepository.markAsEmailed(notificationIds);
  }
}
