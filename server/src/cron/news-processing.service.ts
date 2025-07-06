import { Injectable, Logger } from '@nestjs/common';
import { ArticlesService } from '@/articles/articles.service';
import { NotificationCreationService } from '@/notifications/notification-creation.service';
import { EmailNotificationService } from '@/notifications/email-notification.service';
import { INewsProcessingResult } from './interfaces';

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
  async processUnprocessedArticles(): Promise<INewsProcessingResult> {
    const startTime = Date.now();
    this.logger.log('Starting processing of new articles...');

    const result: INewsProcessingResult = {
      unprocessedArticlesCount: 0,
      notificationsCreated: 0,
      emailsSent: 0,
      articlesProcessed: 0,
      processingTimeMs: 0,
      success: false,
      errors: [],
    };

    try {
      // 1. Get unprocessed articles
      const unprocessedArticles =
        await this.articlesService.getUnprocessedArticles();

      result.unprocessedArticlesCount = unprocessedArticles.length;

      if (unprocessedArticles.length === 0) {
        this.logger.log('No unprocessed articles found');
        result.success = true;
        result.processingTimeMs = Date.now() - startTime;
        return result;
      }

      this.logger.log(
        `Found ${unprocessedArticles.length} unprocessed articles`,
      );

      // 2. Create notifications based on user preferences
      const notifications =
        await this.notificationCreationService.createNotificationsForArticles(
          unprocessedArticles,
        );

      result.notificationsCreated = notifications.length;

      // 3. Send email notifications if any were created
      if (notifications.length > 0) {
        await this.emailNotificationService.sendNotificationsToUsers(
          notifications,
          unprocessedArticles,
        );
        result.emailsSent = notifications.length;
      }

      // 4. Mark articles as processed
      await this.articlesService.markArticlesAsProcessed(
        unprocessedArticles.map((a) => a.id),
      );

      result.articlesProcessed = unprocessedArticles.length;
      result.success = true;
      result.processingTimeMs = Date.now() - startTime;

      this.logger.log(
        `News processing completed successfully: ${result.articlesProcessed} articles processed, ${result.notificationsCreated} notifications created`,
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      result.errors = [errorMessage];
      result.processingTimeMs = Date.now() - startTime;
      this.logger.error('Error during news processing:', error);
      throw error;
    }
  }

  /** @deprecated Use processUnprocessedArticles() instead */
  async processNewArticles(): Promise<void> {
    await this.processUnprocessedArticles();
  }
}
