export interface ArticleReport {
  id: number;
  articleId: number;
  userId: number;
  reason?: string;
  createdAt: Date;
  article?: {
    id: number;
    title: string;
    isActive: boolean;
    author?: string;
    url?: string;
  };
  user?: {
    id: number;
    username: string;
  };
}

export interface CreateArticleReportDto {
  reason?: string;
}

export interface GetReportsQueryDto {
  page?: number;
  limit?: number;
}

export interface ReportSummary {
  totalReports: number;
}

export interface ReportCountResponse {
  articleId: number;
  reportCount: number;
}

export interface PaginatedReportsResponse {
  reports: ArticleReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
