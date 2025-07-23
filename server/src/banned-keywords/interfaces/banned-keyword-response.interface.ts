export interface IBannedKeywordResponse {
  id: number;
  keyword: string;
  description?: string;
  isActive: boolean;
  isCaseSensitive: boolean;
  isRegex: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBannedKeywordListResponse {
  keywords: IBannedKeywordResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
