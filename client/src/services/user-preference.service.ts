import { ApiService } from "./api.service";
import {
  UserPreference,
  UpdateUserPreferenceRequest,
  UserPreferenceStats,
} from "../interfaces/user-preference.interface";

export class UserPreferenceService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * Get all user preferences
   */
  async getUserPreferences(): Promise<UserPreference[]> {
    try {
      const response = await this.apiService.get<UserPreference[]>(
        "/user-preferences"
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      throw error;
    }
  }

  /**
   * Update user preference for a specific category
   */
  async updatePreference(
    categoryId: number,
    isSubscribed: boolean
  ): Promise<UserPreference> {
    try {
      const preferenceData: UpdateUserPreferenceRequest = { isSubscribed };
      const response = await this.apiService.put<UserPreference>(
        `/user-preferences/${categoryId}`,
        preferenceData
      );
      if (!response) {
        throw new Error("Failed to update preference - no data returned");
      }
      return response;
    } catch (error) {
      console.error("Error updating preference:", error);
      throw error;
    }
  }

  /**
   * Subscribe to a category
   */
  async subscribeToCategory(categoryId: number): Promise<UserPreference> {
    return this.updatePreference(categoryId, true);
  }

  /**
   * Unsubscribe from a category
   */
  async unsubscribeFromCategory(categoryId: number): Promise<UserPreference> {
    return this.updatePreference(categoryId, false);
  }

  /**
   * Get subscribed categories only
   */
  async getSubscribedCategories(): Promise<UserPreference[]> {
    try {
      const allPreferences = await this.getUserPreferences();
      return allPreferences.filter((pref) => pref.isSubscribed);
    } catch (error) {
      console.error("Error fetching subscribed categories:", error);
      throw error;
    }
  }

  /**
   * Get unsubscribed categories only
   */
  async getUnsubscribedCategories(): Promise<UserPreference[]> {
    try {
      const allPreferences = await this.getUserPreferences();
      return allPreferences.filter((pref) => !pref.isSubscribed);
    } catch (error) {
      console.error("Error fetching unsubscribed categories:", error);
      throw error;
    }
  }

  /**
   * Check if user is subscribed to a specific category
   */
  async isSubscribedToCategory(categoryId: number): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences();
      const preference = preferences.find(
        (pref) => pref.categoryId === categoryId
      );
      return preference?.isSubscribed || false;
    } catch (error) {
      console.error("Error checking category subscription:", error);
      return false;
    }
  }

  /**
   * Get user preference statistics
   */
  async getPreferenceStats(): Promise<UserPreferenceStats> {
    try {
      const preferences = await this.getUserPreferences();
      const subscribedCount = preferences.filter(
        (pref) => pref.isSubscribed
      ).length;
      const unsubscribedCount = preferences.filter(
        (pref) => !pref.isSubscribed
      ).length;

      return {
        totalPreferences: preferences.length,
        subscribedCategories: subscribedCount,
        unsubscribedCategories: unsubscribedCount,
      };
    } catch (error) {
      console.error("Error getting preference stats:", error);
      return {
        totalPreferences: 0,
        subscribedCategories: 0,
        unsubscribedCategories: 0,
      };
    }
  }

  /**
   * Bulk update multiple preferences
   */
  async bulkUpdatePreferences(
    updates: Array<{ categoryId: number; isSubscribed: boolean }>
  ): Promise<UserPreference[]> {
    try {
      const results: UserPreference[] = [];

      for (const update of updates) {
        const result = await this.updatePreference(
          update.categoryId,
          update.isSubscribed
        );
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error("Error bulk updating preferences:", error);
      throw error;
    }
  }
}
