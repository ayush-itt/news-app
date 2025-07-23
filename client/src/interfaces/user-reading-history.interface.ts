export interface UserReadingHistory {
  id: number;
  userId: number;
  articleId: number;
  createdAt: string;
  article?: {
    id: number;
    title: string;
    source: string;
    publishedAt: string;
    categories: Array<{ id: number; name: string }>;
  };
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

export interface ReadingHistoryListResponse {
  history: UserReadingHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetReadingHistoryQuery {
  page?: number;
  limit?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
}
