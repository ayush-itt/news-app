export interface IBannedKeywordUpdate {
  keyword?: string;
  description?: string;
  isCaseSensitive?: boolean;
  isRegex?: boolean;
  isActive?: boolean;
}
