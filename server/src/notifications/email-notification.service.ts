import { Injectable, Logger } from '@nestjs/common';
import { EmailService, EmailNotificationData } from '@/email/email.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { UserPreferencesService } from '@/user-preferences/user-preferences.service';
import { Article } from '@/database/entities/article.entity';
import { Notification } from '@/database/entities/notification.entity';
import { IEmailArticleData } from './interfaces';

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  /**
   * Sends notification emails to users based on their notifications
   */
  async sendNotificationsToUsers(
    notifications: Notification[],
    articles: Article[],
  ): Promise<void> {
    if (notifications.length === 0) {
      this.logger.log('No notifications to send emails for');
      return;
    }

    this.logger.log(
      `Sending email notifications for ${notifications.length} notifications`,
    );

    // Group notifications by user (one email per user)
    const notificationsByUser = this.groupNotificationsByUser(notifications);

    this.logger.log(`Sending emails to ${notificationsByUser.size} users`);

    // Send email to each user
    for (const [userId, userNotifications] of notificationsByUser) {
      await this.sendEmailToUser(userId, userNotifications, articles);
    }

    this.logger.log('Email notification process completed');
  }

  private groupNotificationsByUser(
    notifications: Notification[],
  ): Map<number, Notification[]> {
    const notificationsByUser = new Map<number, Notification[]>();

    for (const notification of notifications) {
      const userId = notification.userId;
      if (!notificationsByUser.has(userId)) {
        notificationsByUser.set(userId, []);
      }
      notificationsByUser.get(userId).push(notification);
    }

    return notificationsByUser;
  }

  private async sendEmailToUser(
    userId: number,
    notifications: Notification[],
    articles: Article[],
  ): Promise<void> {
    try {
      // Get user details
      const userPreferences =
        await this.userPreferencesService.getSubscribedUserPreferences();
      const userPref = userPreferences.find((pref) => pref.userId === userId);

      if (!userPref?.user?.email) {
        this.logger.warn(
          `No email found for user ${userId}, skipping email notification`,
        );
        return;
      }

      // Build articles for email
      const articleData = this.buildArticleDataForEmail(
        notifications,
        articles,
      );

      if (articleData.length === 0) {
        this.logger.warn(
          `No valid articles found for user ${userId} notifications`,
        );
        return;
      }

      // Prepare email data
      const emailData: EmailNotificationData = {
        userId,
        userEmail: userPref.user.email,
        userName: userPref.user.username || userPref.user.email,
        articles: articleData,
      };

      // Send email using generic email service
      const emailSent =
        await this.emailService.sendNotificationEmail(emailData);

      if (emailSent) {
        // Mark notifications as emailed
        await this.markNotificationsAsEmailed(notifications.map((n) => n.id));
        this.logger.log(
          `Email sent successfully to user ${userId} (${userPref.user.email})`,
        );
      } else {
        this.logger.error(
          `Failed to send email to user ${userId} (${userPref.user.email})`,
        );
      }
    } catch (error) {
      this.logger.error(`Error sending email to user ${userId}:`, error);
    }
  }

  private buildArticleDataForEmail(
    notifications: Notification[],
    articles: Article[],
  ): IEmailArticleData[] {
    return notifications
      .map((notification) => {
        const article = articles.find((a) => a.id === notification.articleId);
        if (!article) return null;

        const category = notification.categoryId
          ? article.categories?.find((c) => c.id === notification.categoryId)
              ?.name
          : undefined;

        // Get keyword name if notification is keyword-based
        let keywordName: string | undefined;
        if (notification.keywordId) {
          // We'll need to fetch the keyword separately or pass it through
          // For now, we'll leave it undefined and enhance later if needed
        }

        return {
          id: article.id,
          title: article.title,
          url: article.originalUrl,
          category,
          keyword: keywordName,
        };
      })
      .filter(Boolean);
  }

  private async markNotificationsAsEmailed(
    notificationIds: number[],
  ): Promise<void> {
    try {
      await this.notificationsService.markAsEmailed(notificationIds);
    } catch (error) {
      this.logger.error('Error marking notifications as emailed:', error);
      throw error;
    }
  }
}
