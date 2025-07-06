export interface INewsProcessingResult {
  unprocessedArticlesCount: number;
  notificationsCreated: number;
  emailsSent: number;
  articlesProcessed: number;
  processingTimeMs: number;
  success: boolean;
  errors?: string[];
}

export interface IArticleProcessingStats {
  totalArticles: number;
  successfullyProcessed: number;
  failed: number;
  skipped: number;
}
