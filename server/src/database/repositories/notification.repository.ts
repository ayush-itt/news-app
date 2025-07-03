import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async findByUserId(
    userId: number,
    limit?: number,
    offset?: number,
  ): Promise<[Notification[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.article', 'article')
      .leftJoinAndSelect('notification.category', 'category')
      .leftJoinAndSelect('notification.keyword', 'keyword')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (limit !== undefined) {
      queryBuilder.limit(limit);
    }

    if (offset !== undefined) {
      queryBuilder.offset(offset);
    }

    return queryBuilder.getManyAndCount();
  }

  async findByUserIdWithReadStatus(
    userId: number,
    isRead?: boolean,
  ): Promise<Notification[]> {
    const whereCondition: any = { userId };

    if (isRead !== undefined) {
      whereCondition.isRead = isRead;
    }

    return this.repository.find({
      where: whereCondition,
      relations: ['article', 'category', 'keyword'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    const notification = await this.repository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      return null;
    }

    notification.isRead = true;
    return this.repository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.repository.update({ userId, isRead: false }, { isRead: true });
  }

  async create(notificationData: {
    userId: number;
    articleId?: number;
    categoryId?: number;
    keywordId?: number;
  }): Promise<Notification> {
    const notification = this.repository.create(notificationData);
    return this.repository.save(notification);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.repository.count({
      where: { userId, isRead: false },
    });
  }

  async saveNotifications(
    notifications: Partial<Notification>[],
  ): Promise<Notification[]> {
    return this.repository.save(notifications);
  }
}
