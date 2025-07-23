/**
 * Interface for bookmark status check result
 */
export interface IBookmarkCheckResult {
  /**
   * Whether the article is bookmarked by the user
   */
  isBookmarked: boolean;

  /**
   * Article ID that was checked
   */
  articleId: number;
}
