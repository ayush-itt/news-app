export interface UserBookmark {
  id: number;
  userId: number;
  articleId: number;
  createdAt: string;
  article?: {
    id: number;
    title: string;
    source?: string;
    publishedAt: string;
    categories?: Array<{ id: number; name: string }>;
  };
}

export interface SaveBookmarkRequest {
  articleId: number;
}

export interface BookmarkStatusResponse {
  message: string;
  success: boolean;
}

export interface BookmarkCheckResult {
  isBookmarked: boolean;
  articleId: number;
}
