export interface IArticleReportResponse {
  id: number;
  articleId: number;
  userId: number;
  reason?: string;
  createdAt: Date;
}

export interface IReportCountResponse {
  articleId: number;
  reportCount: number;
}

export interface IPaginatedReportsResponse {
  reports: IArticleReportResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: IReportSummaryResponse;
}

export interface IReportSummaryResponse {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
}
