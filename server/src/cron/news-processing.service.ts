import { Injectable, Logger } from '@nestjs/common';
import { ArticlesService } from '@/articles/articles.service';
import { NotificationCreationService } from '@/notifications/notification-creation.service';
import { EmailNotificationService } from '@/notifications/email-notification.service';

@Injectable()
export class NewsProcessingService {
  private readonly logger = new Logger(NewsProcessingService.name);

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly notificationCreationService: NotificationCreationService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  /**
   * Processes new articles: creates notifications and sends emails
   */
  async processNewArticles(): Promise<void> {
    this.logger.log('Starting processing of new articles...');

    // 1. Get unprocessed articles
    const unprocessedArticles =
      await this.articlesService.getUnprocessedArticles();

    if (unprocessedArticles.length === 0) {
      this.logger.log('No unprocessed articles found');
      return;
    }

    this.logger.log(`Found ${unprocessedArticles.length} unprocessed articles`);

    // 2. Create notifications based on user preferences
    const notifications =
      await this.notificationCreationService.createNotificationsForArticles(
        unprocessedArticles,
      );

    // 3. Send email notifications if any were created
    if (notifications.length > 0) {
      await this.emailNotificationService.sendNotificationsToUsers(
        notifications,
        unprocessedArticles,
      );
    }

    // 4. Mark articles as processed
    await this.articlesService.markArticlesAsProcessed(
      unprocessedArticles.map((a) => a.id),
    );

    this.logger.log('News processing completed successfully');
  }
}
