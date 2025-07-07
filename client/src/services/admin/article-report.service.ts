import { ApiService } from "../api.service";
import {
  ArticleReport,
  GetReportsQueryDto,
  PaginatedReportsResponse,
  ReportCountResponse,
  ApiResponse,
} from "../../interfaces";

export class ArticleReportService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all article reports with pagination (Admin only)
   */
  async getAllReports(
    query?: GetReportsQueryDto
  ): Promise<PaginatedReportsResponse> {
    const params = new URLSearchParams();

    if (query?.page) {
      params.append("page", query.page.toString());
    }
    if (query?.limit) {
      params.append("limit", query.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString
      ? `/admin/reports?${queryString}`
      : "/admin/reports";

    const response = await this.apiService.get<
      ApiResponse<PaginatedReportsResponse>
    >(url);
    return response.data;
  }

  /**
   * Get reports for a specific article (Admin only)
   */
  async getReportsByArticleId(articleId: number): Promise<{
    articleId: number;
    reports: ArticleReport[];
    totalReports: number;
  }> {
    const response = await this.apiService.get<
      ApiResponse<{
        articleId: number;
        reports: ArticleReport[];
        totalReports: number;
      }>
    >(`/admin/reports/article/${articleId}`);
    return response.data;
  }

  /**
   * Get reports by a specific user (Admin only)
   */
  async getReportsByUserId(userId: number): Promise<{
    userId: number;
    reports: ArticleReport[];
    totalReports: number;
  }> {
    const response = await this.apiService.get<
      ApiResponse<{
        userId: number;
        reports: ArticleReport[];
        totalReports: number;
      }>
    >(`/admin/reports/user/${userId}`);
    return response.data;
  }

  /**
   * Get report count for an article (Public endpoint)
   */
  async getArticleReportCount(articleId: number): Promise<ReportCountResponse> {
    const response = await this.apiService.get<
      ApiResponse<ReportCountResponse>
    >(`/articles/${articleId}/reports/count`);
    return response.data;
  }
}
