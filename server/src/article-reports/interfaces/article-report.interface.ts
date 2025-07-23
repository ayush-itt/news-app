export interface IArticleReport {
  id: number;
  articleId: number;
  userId: number;
  reason?: string;
  createdAt: Date;
}

export interface ICreateArticleReport {
  reason?: string;
}

export interface IReportCount {
  articleId: number;
  reportCount: number;
}

export interface IReportSummary {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
}
