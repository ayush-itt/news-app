/**
 * Interface for keyword statistics data
 */
export interface IKeywordStatistics {
  /**
   * Total number of keywords in the system
   */
  totalKeywords: number;

  /**
   * Number of active keywords
   */
  activeKeywords: number;

  /**
   * Number of inactive keywords
   */
  inactiveKeywords: number;

  /**
   * Keywords per category breakdown
   */
  keywordsByCategory: IKeywordCategoryStats[];

  /**
   * Keywords per user breakdown
   */
  keywordsByUser: IKeywordUserStats[];

  /**
   * Most popular keywords
   */
  popularKeywords: IPopularKeyword[];
}

/**
 * Interface for keyword statistics by category
 */
export interface IKeywordCategoryStats {
  /**
   * Category ID
   */
  categoryId: number;

  /**
   * Category name
   */
  categoryName: string;

  /**
   * Number of keywords in this category
   */
  keywordCount: number;

  /**
   * Number of active keywords in this category
   */
  activeCount: number;
}

/**
 * Interface for keyword statistics by user
 */
export interface IKeywordUserStats {
  /**
   * User ID
   */
  userId: number;

  /**
   * Username
   */
  username: string;

  /**
   * Number of keywords for this user
   */
  keywordCount: number;

  /**
   * Number of active keywords for this user
   */
  activeCount: number;
}

/**
 * Interface for popular keyword data
 */
export interface IPopularKeyword {
  /**
   * The keyword text
   */
  keyword: string;

  /**
   * Number of users using this keyword
   */
  userCount: number;

  /**
   * Category name
   */
  categoryName: string;
}

/**
 * Interface for user keyword summary
 */
export interface IUserKeywordSummary {
  /**
   * User ID
   */
  userId: number;

  /**
   * Total keywords for the user
   */
  totalKeywords: number;

  /**
   * Active keywords for the user
   */
  activeKeywords: number;

  /**
   * Keywords by category for the user
   */
  categoriesSummary: IUserCategorySummary[];
}

/**
 * Interface for user category summary
 */
export interface IUserCategorySummary {
  /**
   * Category ID
   */
  categoryId: number;

  /**
   * Category name
   */
  categoryName: string;

  /**
   * Number of keywords in this category
   */
  count: number;

  /**
   * Number of active keywords in this category
   */
  activeCount: number;
}
