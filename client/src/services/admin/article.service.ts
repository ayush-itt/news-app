import { ApiService } from "../api.service";
import { IArticle, IArticleListResponse } from "../../interfaces";

export class AdminArticleService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  async getAllArticles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryIds?: number[];
    author?: string;
    source?: string;
    publishedAfter?: string;
    publishedBefore?: string;
  }): Promise<IArticleListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.categoryIds?.length) {
      params.categoryIds.forEach((id) =>
        queryParams.append("categoryIds", id.toString())
      );
    }
    if (params?.author) queryParams.append("author", params.author);
    if (params?.source) queryParams.append("source", params.source);
    if (params?.publishedAfter)
      queryParams.append("publishedAfter", params.publishedAfter);
    if (params?.publishedBefore)
      queryParams.append("publishedBefore", params.publishedBefore);

    const url = queryParams.toString()
      ? `/articles?${queryParams.toString()}`
      : "/articles";
    return this.apiService.get<IArticleListResponse>(url);
  }

  async searchArticles(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IArticleListResponse> {
    const queryParams = new URLSearchParams({
      q: searchTerm,
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.apiService.get<IArticleListResponse>(
      `/articles/search?${queryParams.toString()}`
    );
  }

  async getArticlesByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<IArticleListResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.apiService.get<IArticleListResponse>(
      `/articles/category/${categoryId}?${queryParams.toString()}`
    );
  }

  async getArticleById(id: number): Promise<IArticle> {
    return this.apiService.get<IArticle>(`/articles/${id}`);
  }
}
