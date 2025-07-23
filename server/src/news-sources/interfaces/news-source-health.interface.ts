/**
 * Interface for news source health check result
 */
export interface INewsSourceHealth {
  /**
   * News source ID
   */
  id: number;

  /**
   * News source name
   */
  name: string;

  /**
   * Last time the source was fetched
   */
  lastFetchAt: Date | null;

  /**
   * Last error message from fetching
   */
  lastError: string | null;

  /**
   * Whether the source is considered healthy
   */
  isHealthy: boolean;
}
