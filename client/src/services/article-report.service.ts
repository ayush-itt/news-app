import { ApiService } from "./api.service";
import {
  ArticleReport,
  CreateArticleReportDto,
  ReportCountResponse,
  ApiResponse,
} from "../interfaces";

export class ArticleReportService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * Report an article for inappropriate content
   */
  async reportArticle(
    articleId: number,
    reportData: CreateArticleReportDto
  ): Promise<ArticleReport> {
    try {
      const response = await this.apiService.post<{
        statusCode: number;
        message: string;
        data: ArticleReport;
      }>(`/articles/${articleId}/report`, reportData);

      if (response && response.data) {
        return response.data;
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error(
        "Report article error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 409) {
        throw new Error("You have already reported this article");
      } else if (error.response?.status === 404) {
        throw new Error("Article not found");
      } else if (error.response?.status === 401) {
        throw new Error("You must be logged in to report articles");
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response?.data?.message || "Invalid request data"
        );
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to report article";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get report count for an article
   */
  async getArticleReportCount(articleId: number): Promise<ReportCountResponse> {
    try {
      const response = await this.apiService.get<{
        statusCode: number;
        data: ReportCountResponse;
      }>(`/articles/${articleId}/reports/count`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Article not found");
      }
      throw new Error(
        error.response?.data?.message || "Failed to get report count"
      );
    }
  }

  /**
   * Check if current user has already reported an article
   */
  async hasUserReportedArticle(articleId: number): Promise<boolean> {
    try {
      // Try to report with empty data to check if already reported
      await this.reportArticle(articleId, {});
      return false; // If no error, user hasn't reported yet
    } catch (error: any) {
      if (error.message.includes("already reported")) {
        return true;
      }
      // For other errors, assume not reported
      return false;
    }
  }

  /**
   * Get predefined report reasons
   */
  getPredefinedReasons(): string[] {
    return [
      "spam",
      "inappropriate_content",
      "misleading_information",
      "hate_speech",
      "violence",
      "harassment",
      "copyright_violation",
      "fake_news",
      "other",
    ];
  }

  /**
   * Format report reason for display
   */
  formatReasonForDisplay(reason?: string): string {
    if (!reason) return "No specific reason provided";

    const reasonMap: { [key: string]: string } = {
      spam: "Spam Content",
      inappropriate_content: "Inappropriate Content",
      misleading_information: "Misleading Information",
      hate_speech: "Hate Speech",
      violence: "Violence",
      harassment: "Harassment",
      copyright_violation: "Copyright Violation",
      fake_news: "Fake News",
      other: "Other",
    };

    return reasonMap[reason] || reason;
  }
}
