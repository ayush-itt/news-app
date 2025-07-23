/**
 * Interface for preference data used in bulk operations
 */
export interface IPreferenceData {
  /**
   * Category ID for the preference
   */
  categoryId: number;

  /**
   * Whether the user is subscribed to this category
   */
  isSubscribed: boolean;
}
