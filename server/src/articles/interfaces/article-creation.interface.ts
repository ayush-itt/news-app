export interface IArticleCreation {
  title: string;
  content?: string;
  author?: string;
  source?: string;
  originalUrl: string;
  publishedAt: string;
  categoryIds?: number[];
}

export interface IArticleUpdate {
  title?: string;
  content?: string;
  author?: string;
  source?: string;
  categoryIds?: number[];
}
