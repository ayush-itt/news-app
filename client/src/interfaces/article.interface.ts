export interface IArticle {
  id: number;
  title: string;
  content: string | null;
  author: string | null;
  source: string | null;
  originalUrl: string;
  publishedAt: string;
  scrapedAt: string;
  categories: ICategory[];
}

export interface ICategory {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface PaginatedArticleResponse {
  data: IArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArticleQuery {
  page?: number;
  limit?: number;
  search?: string;
  author?: string;
  source?: string;
  categoryIds?: number[];
  publishedAfter?: string;
  publishedBefore?: string;
}

export interface ArticleSearchQuery {
  q: string;
  page?: number;
  limit?: number;
}

// Legacy interfaces for backward compatibility
export interface IArticleListResponse {
  articles: IArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IArticleSearchQuery {
  query?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "popular";
}
