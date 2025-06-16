export interface ArticleFilters {
  categoryIds?: number[];
  search?: string;
  author?: string;
  source?: string;
  publishedAfter?: Date;
  publishedBefore?: Date;
}
