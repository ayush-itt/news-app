export interface IBannedKeywordValidation {
  hasBanned: boolean;
  matchedKeywords: string[];
  details?: string;
}
