import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationCreationService } from './notification-creation.service';
import { EmailNotificationService } from './email-notification.service';
import { EmailModule } from '@/email/email.module';
import { UserPreferencesModule } from '@/user-preferences/user-preferences.module';
import { KeywordsModule } from '@/keywords/keywords.module';
import { Notification } from '@/database/entities/notification.entity';
import { NotificationRepository } from '@/database/repositories/notification.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    EmailModule,
    UserPreferencesModule,
    KeywordsModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    NotificationCreationService,
    EmailNotificationService,
  ],
  exports: [
    NotificationsService,
    NotificationRepository,
    NotificationCreationService,
    EmailNotificationService,
  ],
})
export class NotificationsModule {}
