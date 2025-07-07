import { ApiService } from "./api.service";
import { UserBookmark } from "../interfaces/bookmark.interface";

export class BookmarkService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * Get all bookmarks for the current user
   */
  async getUserBookmarks(): Promise<UserBookmark[]> {
    try {
      const response = await this.apiService.get<UserBookmark[]>(
        "/user-bookmarks"
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
      throw error;
    }
  }

  /**
   * Save an article as bookmark
   */
  async saveBookmark(articleId: number): Promise<UserBookmark> {
    try {
      const response = await this.apiService.post<UserBookmark>(
        `/user-bookmarks/${articleId}`
      );
      return response;
    } catch (error) {
      console.error("Error saving bookmark:", error);
      throw error;
    }
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(articleId: number): Promise<void> {
    try {
      await this.apiService.delete(`/user-bookmarks/${articleId}`);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      throw error;
    }
  }

  /**
   * Check if an article is bookmarked by the current user
   */
  async isArticleBookmarked(articleId: number): Promise<boolean> {
    try {
      const response = await this.apiService.get<{
        isBookmarked: boolean;
        articleId: number;
      }>(`/user-bookmarks/check/${articleId}`);
      return response?.isBookmarked || false;
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      return false;
    }
  }

  /**
   * Get bookmark statistics for the current user
   */
  async getBookmarkStats(): Promise<{ totalBookmarks: number }> {
    try {
      const bookmarks = await this.getUserBookmarks();
      return { totalBookmarks: bookmarks.length };
    } catch (error) {
      console.error("Error getting bookmark stats:", error);
      return { totalBookmarks: 0 };
    }
  }
}
