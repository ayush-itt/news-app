export interface IBannedKeyword {
  id: number;
  keyword: string;
  description?: string;
  isActive: boolean;
  isCaseSensitive: boolean;
  isRegex: boolean;
  createdAt: Date;
  updatedAt: Date;
}
