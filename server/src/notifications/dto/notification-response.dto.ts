import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '@/database/entities/notification.entity';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Notification ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Article information',
    example: {
      id: 1,
      title: 'Breaking News: Tech Industry Updates',
      url: 'https://example.com/article/1',
    },
    nullable: true,
  })
  article: {
    id: number;
    title: string;
    url: string;
  } | null;

  @ApiProperty({
    description: 'Category that triggered the notification',
    example: {
      id: 1,
      name: 'Technology',
    },
    nullable: true,
  })
  category: {
    id: number;
    name: string;
  } | null;

  @ApiProperty({
    description: 'Keyword that triggered the notification',
    example: {
      id: 1,
      name: 'AI',
    },
    nullable: true,
  })
  keyword: {
    id: number;
    name: string;
  } | null;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'When the notification was created',
    example: '2025-06-25T10:30:00Z',
  })
  createdAt: Date;

  static fromEntity(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      article: notification.article
        ? {
            id: notification.article.id,
            title: notification.article.title,
            url: notification.article.originalUrl,
          }
        : null,
      category: notification.category
        ? {
            id: notification.category.id,
            name: notification.category.name,
          }
        : null,
      keyword: notification.keyword
        ? {
            id: notification.keyword.id,
            name: notification.keyword.keyword,
          }
        : null,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }

  static fromEntities(
    notifications: Notification[],
  ): NotificationResponseDto[] {
    return notifications.map((notification) =>
      NotificationResponseDto.fromEntity(notification),
    );
  }
}
