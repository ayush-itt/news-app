import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SimpleNewsApiService } from '@/news-aggregation/simple-news-api.service';
import { ArticlesService } from '@/articles/articles.service';
import { UserPreferencesService } from '@/user-preferences/user-preferences.service';
import { KeywordsService } from '@/keywords/keywords.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { Article } from '@/database/entities/article.entity';
import { Notification } from '@/database/entities/notification.entity';
import { UserPreference } from '@/database/entities/user-preference.entity';
import { Keyword } from '@/database/entities/keyword.entity';

@Injectable()
export class NewsAggregationCron {
  private readonly logger = new Logger(NewsAggregationCron.name);

  constructor(
    private readonly simpleNewsApiService: SimpleNewsApiService,
    private readonly articlesService: ArticlesService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly keywordsService: KeywordsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleNewsAggregation(): Promise<void> {
    this.logger.log('Starting scheduled news aggregation...');
    try {
      await this.simpleNewsApiService.fetchAndStoreArticles();
      this.logger.log('News aggregation completed successfully');

      await this.createNotificationsForNewArticles();
      this.logger.log('Notification creation completed successfully');
    } catch (error) {
      this.logger.error('Error during scheduled news aggregation:', error);
    }
  }

  private async createNotificationsForNewArticles(): Promise<void> {
    try {
      this.logger.log('Starting notification creation for new articles...');

      const unprocessedArticles =
        await this.articlesService.getUnprocessedArticles();

      if (unprocessedArticles.length === 0) {
        this.logger.log('No unprocessed articles found for notifications');
        return;
      }

      this.logger.log(
        `Found ${unprocessedArticles.length} unprocessed articles for notification creation`,
      );

      const userPreferences =
        await this.userPreferencesService.getSubscribedUserPreferences();
      const keywords = await this.keywordsService.getActiveKeywords();

      const notifications: Partial<Notification>[] = [];

      for (const article of unprocessedArticles) {
        const categoryNotifications = this.getCategoryBasedNotifications(
          article,
          userPreferences,
        );
        notifications.push(...categoryNotifications);

        const keywordNotifications = this.getKeywordBasedNotifications(
          article,
          keywords,
        );
        notifications.push(...keywordNotifications);
      }

      const uniqueNotifications =
        this.removeDuplicateNotifications(notifications);

      if (uniqueNotifications.length > 0) {
        await this.notificationsService.createNotifications(
          uniqueNotifications,
        );
        this.logger.log(
          `Created ${uniqueNotifications.length} notifications for ${unprocessedArticles.length} articles`,
        );
      }

      await this.articlesService.markArticlesAsProcessed(
        unprocessedArticles.map((a) => a.id),
      );

      this.logger.log('Marked articles as processed for notifications');
    } catch (error) {
      this.logger.error(
        'Error creating notifications for new articles:',
        error,
      );
    }
  }

  private getCategoryBasedNotifications(
    article: Article,
    userPreferences: UserPreference[],
  ): Partial<Notification>[] {
    if (!article.categories || article.categories.length === 0) {
      return [];
    }

    const articleCategoryIds = article.categories.map((cat) => cat.id);
    const matchingPreferences = userPreferences.filter((pref) =>
      articleCategoryIds.includes(pref.categoryId),
    );

    return matchingPreferences.map((userPref) => ({
      userId: userPref.userId,
      articleId: article.id,
      categoryId: userPref.categoryId,
      keywordId: null,
      isRead: false,
      isEmailed: false,
    }));
  }

  private getKeywordBasedNotifications(
    article: Article,
    keywords: Keyword[],
  ): Partial<Notification>[] {
    const notifications: Partial<Notification>[] = [];
    const articleText =
      `${article.title} ${article.content || ''}`.toLowerCase();

    for (const keyword of keywords) {
      if (articleText.includes(keyword.keyword.toLowerCase())) {
        if (keyword.categoryId) {
          const articleInCategory = article.categories?.some(
            (cat) => cat.id === keyword.categoryId,
          );
          if (!articleInCategory) {
            continue;
          }
        }

        notifications.push({
          userId: keyword.userId,
          articleId: article.id,
          categoryId: keyword.categoryId,
          keywordId: keyword.id,
          isRead: false,
          isEmailed: false,
        });
      }
    }

    return notifications;
  }

  private removeDuplicateNotifications(
    notifications: Partial<Notification>[],
  ): Partial<Notification>[] {
    const uniqueMap = new Map<string, Partial<Notification>>();

    for (const notification of notifications) {
      const key = `${notification.userId}-${notification.articleId}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, notification);
      } else {
        const existing = uniqueMap.get(key);
        if (notification.keywordId && !existing.keywordId) {
          uniqueMap.set(key, notification);
        }
      }
    }

    return Array.from(uniqueMap.values());
  }
}
