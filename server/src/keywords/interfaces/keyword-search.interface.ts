/**
 * Interface for keyword search and filtering criteria
 */
export interface IKeywordSearchFilters {
  /**
   * Filter by user ID
   */
  userId?: number;

  /**
   * Filter by category ID
   */
  categoryId?: number;

  /**
   * Filter by active status
   */
  isActive?: boolean;

  /**
   * Search by keyword text (partial match)
   */
  keyword?: string;

  /**
   * Filter by creation date range
   */
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Interface for advanced keyword search criteria
 */
export interface IKeywordSearchCriteria extends IKeywordSearchFilters {
  /**
   * Sort field
   */
  sortBy?: 'keyword' | 'createdAt' | 'isActive' | 'categoryName';

  /**
   * Sort direction
   */
  sortOrder?: 'ASC' | 'DESC';

  /**
   * Page number for pagination
   */
  page?: number;

  /**
   * Number of items per page
   */
  limit?: number;
}

/**
 * Interface for keyword search results
 */
export interface IKeywordSearchResult {
  /**
   * Array of keywords
   */
  keywords: any[];

  /**
   * Total number of keywords matching the criteria
   */
  total: number;

  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Total number of pages
   */
  totalPages: number;
}
