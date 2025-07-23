/**
 * Interface for news sources statistics data
 */
export interface INewsSourceStatistics {
  /**
   * Total number of news sources
   */
  total: number;

  /**
   * Number of active news sources
   */
  active: number;

  /**
   * Number of inactive news sources
   */
  inactive: number;
}
