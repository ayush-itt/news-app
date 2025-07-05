import { Injectable, Logger } from '@nestjs/common';
import { UserPreferencesService } from '@/user-preferences/user-preferences.service';
import { KeywordsService } from '@/keywords/keywords.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { Article } from '@/database/entities/article.entity';
import { Notification } from '@/database/entities/notification.entity';
import { UserPreference } from '@/database/entities/user-preference.entity';
import { Keyword } from '@/database/entities/keyword.entity';

@Injectable()
export class NotificationCreationService {
  private readonly logger = new Logger(NotificationCreationService.name);

  constructor(
    private readonly userPreferencesService: UserPreferencesService,
    private readonly keywordsService: KeywordsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Creates notifications for articles based on user preferences and keywords
   */
  async createNotificationsForArticles(
    articles: Article[],
  ): Promise<Notification[]> {
    if (articles.length === 0) {
      this.logger.log('No articles provided for notification creation');
      return [];
    }

    this.logger.log(`Creating notifications for ${articles.length} articles`);

    const userPreferences =
      await this.userPreferencesService.getSubscribedUserPreferences();
    const keywords = await this.keywordsService.getActiveKeywords();

    const notifications: Partial<Notification>[] = [];

    // Process each article
    for (const article of articles) {
      // Category-based notifications
      const categoryNotifications = this.getCategoryBasedNotifications(
        article,
        userPreferences,
      );
      notifications.push(...categoryNotifications);

      // Keyword-based notifications
      const keywordNotifications = this.getKeywordBasedNotifications(
        article,
        keywords,
      );
      notifications.push(...keywordNotifications);
    }

    // Remove duplicates (same user + same article)
    const uniqueNotifications =
      this.removeDuplicateNotifications(notifications);

    if (uniqueNotifications.length === 0) {
      this.logger.log('No notifications to create');
      return [];
    }

    // Create notifications in database
    const createdNotifications =
      await this.notificationsService.createNotifications(uniqueNotifications);

    this.logger.log(`Created ${createdNotifications.length} notifications`);
    return createdNotifications;
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
