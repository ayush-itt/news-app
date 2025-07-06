/**
 * Interface for TheNewsAPI article response
 */
export interface ITheNewsApiArticle {
  title: string;
  snippet: string;
  url: string;
  image_url: string | null;
  published_at: string; // Keep as is - this is the API response format
  source: string;
  categories: string[];
}

/**
 * Interface for TheNewsAPI response data
 */
export interface ITheNewsApiResponse {
  data: ITheNewsApiArticle[];
}

/**
 * Interface for category mapping configuration
 */
export interface ICategoryMapping {
  [apiCategory: string]: string;
}

/**
 * Interface for article transformation result
 */
export interface IArticleTransformationResult {
  success: boolean;
  article?: any; // Will be Article entity
  error?: string;
}

/**
 * Interface for aggregation statistics
 */
export interface IAggregationStats {
  totalFetched: number;
  totalStored: number;
  totalSkipped: number;
  errors: string[];
}
