export enum NewsSourceType {
  NEWSAPI = "newsapi",
  RSS = "rss",
  GUARDIAN = "guardian",
  CUSTOM = "custom",
}

export interface NewsSource {
  id: number;
  name: string;
  type: NewsSourceType;
  baseUrl: string;
  apiKeyEnv: string | null;
  isActive: boolean;
  lastFetchAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNewsSourceDto {
  name?: string;
  apiKeyEnv?: string;
}
