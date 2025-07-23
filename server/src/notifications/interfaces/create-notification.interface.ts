/**
 * Interface for creating new notifications
 */
export interface ICreateNotificationData {
  /**
   * User ID for the notification
   */
  userId: number;

  /**
   * Article ID (optional)
   */
  articleId?: number;

  /**
   * Category ID (optional)
   */
  categoryId?: number;

  /**
   * Keyword ID (optional)
   */
  keywordId?: number;
}
