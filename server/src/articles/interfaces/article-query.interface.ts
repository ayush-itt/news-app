export interface IArticleQuery {
  page?: number;
  limit?: number;
  search?: string;
  author?: string;
  source?: string;
  categoryIds?: number[];
  publishedAfter?: string;
  publishedBefore?: string;
}

export interface IArticleResponse {
  id: number;
  title: string;
  content?: string | null;
  author?: string | null;
  source?: string | null;
  originalUrl: string;
  publishedAt: Date;
  scrapedAt: Date;
  categories?: any[];
}
