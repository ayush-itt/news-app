/**
 * Interface for bulk keyword creation data
 */
export interface IBulkKeywordData {
  /**
   * Category ID for the keyword
   */
  categoryId: number;

  /**
   * The keyword text
   */
  keyword: string;

  /**
   * Whether the keyword is active
   */
  isActive?: boolean;
}

/**
 * Interface for bulk keyword update data
 */
export interface IBulkKeywordUpdate {
  /**
   * Keyword ID to update
   */
  id: number;

  /**
   * New keyword text (optional)
   */
  keyword?: string;

  /**
   * New category ID (optional)
   */
  categoryId?: number;

  /**
   * New active status (optional)
   */
  isActive?: boolean;
}

/**
 * Interface for bulk operation results
 */
export interface IBulkOperationResult {
  /**
   * Number of successful operations
   */
  successCount: number;

  /**
   * Number of failed operations
   */
  failedCount: number;

  /**
   * Array of errors for failed operations
   */
  errors: IBulkOperationError[];
}

/**
 * Interface for bulk operation errors
 */
export interface IBulkOperationError {
  /**
   * Index or ID of the failed item
   */
  item: number | string;

  /**
   * Error message
   */
  error: string;
}
