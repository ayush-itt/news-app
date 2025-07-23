export interface IArticleFilters {
  categoryIds?: number[];
  search?: string;
  author?: string;
  source?: string;
  publishedAfter?: Date;
  publishedBefore?: Date;
  includeInactive?: boolean; // For admin use - includes inactive articles
}
