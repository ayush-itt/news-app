export interface UserKeyword {
  id: number;
  userId: number;
  categoryId: number;
  keyword: string;
  isActive: boolean;
  createdAt: string;
  categoryName?: string;
}

export interface CreateKeywordRequest {
  categoryId: number;
  keyword: string;
  isActive?: boolean;
}

export interface UpdateKeywordRequest {
  keyword?: string;
  isActive?: boolean;
}

export interface KeywordStats {
  totalKeywords: number;
  activeKeywords: number;
  inactiveKeywords: number;
  keywordsByCategory: Map<string, number>;
}
