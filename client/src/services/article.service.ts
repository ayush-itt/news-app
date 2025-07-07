import { ApiService } from "./api.service";
import {
  IArticle,
  PaginatedArticleResponse,
  ArticleQuery,
  ArticleSearchQuery,
} from "../interfaces";

export class ArticleService {
  private api: ApiService;

  constructor() {
    this.api = ApiService.getInstance();
  }

  /**
   * Get all articles with filtering and pagination
   */
  async getArticles(
    query: ArticleQuery = {}
  ): Promise<PaginatedArticleResponse> {
    try {
      const params = new URLSearchParams();

      if (query.page) params.append("page", query.page.toString());
      if (query.limit) params.append("limit", query.limit.toString());
      if (query.search) params.append("search", query.search);
      if (query.author) params.append("author", query.author);
      if (query.source) params.append("source", query.source);
      if (query.categoryIds && query.categoryIds.length > 0) {
        params.append("categoryIds", query.categoryIds.join(","));
      }
      if (query.publishedAfter)
        params.append("publishedAfter", query.publishedAfter);
      if (query.publishedBefore)
        params.append("publishedBefore", query.publishedBefore);

      const queryString = params.toString();
      const url = queryString ? `/articles?${queryString}` : "/articles";

      const response = await this.api.get<PaginatedArticleResponse>(url);
      return response;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  }

  /**
   * Search articles by term
   */
  async searchArticles(
    searchQuery: ArticleSearchQuery
  ): Promise<PaginatedArticleResponse> {
    try {
      const params = new URLSearchParams();

      params.append("q", searchQuery.q);
      if (searchQuery.page) params.append("page", searchQuery.page.toString());
      if (searchQuery.limit)
        params.append("limit", searchQuery.limit.toString());

      const queryString = params.toString();
      const url = `/articles/search?${queryString}`;

      const response = await this.api.get<PaginatedArticleResponse>(url);
      return response;
    } catch (error) {
      console.error("Error searching articles:", error);
      throw error;
    }
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedArticleResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const queryString = params.toString();
      const url = `/articles/category/${categoryId}?${queryString}`;

      const response = await this.api.get<PaginatedArticleResponse>(url);
      return response;
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      throw error;
    }
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: number): Promise<IArticle> {
    try {
      const response = await this.api.get<IArticle>(`/articles/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching article by ID:", error);
      throw error;
    }
  }

  /**
   * Get today's headlines
   */
  async getTodaysHeadlines(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedArticleResponse> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.toISOString();

      return this.getArticles({
        publishedAfter: startOfDay,
        page,
        limit,
      });
    } catch (error) {
      console.error("Error fetching today's headlines:", error);
      throw error;
    }
  }

  /**
   * Get articles by date range
   */
  async getArticlesByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedArticleResponse> {
    try {
      return this.getArticles({
        publishedAfter: startDate,
        publishedBefore: endDate,
        page,
        limit,
      });
    } catch (error) {
      console.error("Error fetching articles by date range:", error);
      throw error;
    }
  }
}
