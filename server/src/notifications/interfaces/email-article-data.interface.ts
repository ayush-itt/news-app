/**
 * Interface for article data used in email notifications
 */
export interface IEmailArticleData {
  /**
   * Article ID
   */
  id: number;

  /**
   * Article title
   */
  title: string;

  /**
   * Article URL
   */
  url: string;

  /**
   * Category name (optional)
   */
  category?: string;

  /**
   * Keyword name (optional)
   */
  keyword?: string;
}
