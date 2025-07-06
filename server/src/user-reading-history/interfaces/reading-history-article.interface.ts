export interface IReadingHistoryArticle {
  id: number;
  title: string;
  source: string;
  publishedAt: Date;
  categories: Array<{ id: number; name: string }>;
}
