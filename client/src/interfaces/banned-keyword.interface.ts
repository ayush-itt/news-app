export interface BannedKeyword {
  id: number;
  keyword: string;
  description?: string;
  isActive: boolean;
  isCaseSensitive: boolean;
  isRegex: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBannedKeywordDto {
  keyword: string;
  description?: string;
  isCaseSensitive?: boolean;
  isRegex?: boolean;
}

export interface GetBannedKeywordsQueryDto {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BannedKeywordListResponse {
  keywords: BannedKeyword[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
