import { ApiService } from "./api.service";
import {
  UserKeyword,
  CreateKeywordRequest,
  UpdateKeywordRequest,
  KeywordStats,
} from "../interfaces/keyword.interface";

export class KeywordService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * Create a new keyword for the authenticated user
   */
  async createKeyword(createData: CreateKeywordRequest): Promise<UserKeyword> {
    try {
      const response = await this.apiService.post<UserKeyword>(
        "/keywords",
        createData
      );
      if (!response) {
        throw new Error("Failed to create keyword - no data returned");
      }
      return response;
    } catch (error) {
      console.error("Error creating keyword:", error);
      throw error;
    }
  }

  /**
   * Get user keywords with optional category filter
   */
  async getUserKeywords(categoryId?: number): Promise<UserKeyword[]> {
    try {
      const url = categoryId
        ? `/keywords?categoryId=${categoryId}`
        : "/keywords";
      const response = await this.apiService.get<UserKeyword[]>(url);
      return response || [];
    } catch (error) {
      console.error("Error fetching user keywords:", error);
      throw error;
    }
  }

  /**
   * Get keyword by ID
   */
  async getKeywordById(id: number): Promise<UserKeyword> {
    try {
      const response = await this.apiService.get<UserKeyword>(
        `/keywords/${id}`
      );
      if (!response) {
        throw new Error("Failed to get keyword - no data returned");
      }
      return response;
    } catch (error) {
      console.error("Error fetching keyword:", error);
      throw error;
    }
  }

  /**
   * Update keyword (only own keywords)
   */
  async updateKeyword(
    id: number,
    updateData: UpdateKeywordRequest
  ): Promise<UserKeyword> {
    try {
      const response = await this.apiService.put<UserKeyword>(
        `/keywords/${id}`,
        updateData
      );
      if (!response) {
        throw new Error("Failed to update keyword - no data returned");
      }
      return response;
    } catch (error) {
      console.error("Error updating keyword:", error);
      throw error;
    }
  }

  /**
   * Toggle keyword active status
   */
  async toggleKeywordActive(id: number): Promise<UserKeyword> {
    try {
      const response = await this.apiService.put<UserKeyword>(
        `/keywords/${id}/toggle-active`,
        {}
      );
      if (!response) {
        throw new Error("Failed to toggle keyword status - no data returned");
      }
      return response;
    } catch (error) {
      console.error("Error toggling keyword status:", error);
      throw error;
    }
  }

  /**
   * Delete keyword (only own keywords)
   */
  async deleteKeyword(id: number): Promise<void> {
    try {
      await this.apiService.delete(`/keywords/${id}`);
    } catch (error) {
      console.error("Error deleting keyword:", error);
      throw error;
    }
  }

  /**
   * Get keywords filtered by category
   */
  async getKeywordsByCategory(categoryId: number): Promise<UserKeyword[]> {
    return this.getUserKeywords(categoryId);
  }

  /**
   * Get active keywords only
   */
  async getActiveKeywords(): Promise<UserKeyword[]> {
    try {
      const allKeywords = await this.getUserKeywords();
      return allKeywords.filter((keyword) => keyword.isActive);
    } catch (error) {
      console.error("Error fetching active keywords:", error);
      throw error;
    }
  }

  /**
   * Get inactive keywords only
   */
  async getInactiveKeywords(): Promise<UserKeyword[]> {
    try {
      const allKeywords = await this.getUserKeywords();
      return allKeywords.filter((keyword) => !keyword.isActive);
    } catch (error) {
      console.error("Error fetching inactive keywords:", error);
      throw error;
    }
  }

  /**
   * Get keyword statistics
   */
  async getKeywordStats(): Promise<KeywordStats> {
    try {
      const keywords = await this.getUserKeywords();
      const activeCount = keywords.filter((k) => k.isActive).length;
      const inactiveCount = keywords.filter((k) => !k.isActive).length;

      const keywordsByCategory = new Map<string, number>();
      keywords.forEach((keyword) => {
        const categoryName = keyword.categoryName || "Unknown Category";
        const current = keywordsByCategory.get(categoryName) || 0;
        keywordsByCategory.set(categoryName, current + 1);
      });

      return {
        totalKeywords: keywords.length,
        activeKeywords: activeCount,
        inactiveKeywords: inactiveCount,
        keywordsByCategory,
      };
    } catch (error) {
      console.error("Error getting keyword stats:", error);
      return {
        totalKeywords: 0,
        activeKeywords: 0,
        inactiveKeywords: 0,
        keywordsByCategory: new Map(),
      };
    }
  }

  /**
   * Activate a keyword
   */
  async activateKeyword(id: number): Promise<UserKeyword> {
    return this.updateKeyword(id, { isActive: true });
  }

  /**
   * Deactivate a keyword
   */
  async deactivateKeyword(id: number): Promise<UserKeyword> {
    return this.updateKeyword(id, { isActive: false });
  }

  /**
   * Search keywords by text
   */
  async searchKeywords(searchTerm: string): Promise<UserKeyword[]> {
    try {
      const allKeywords = await this.getUserKeywords();
      return allKeywords.filter(
        (keyword) =>
          keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (keyword.categoryName &&
            keyword.categoryName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error("Error searching keywords:", error);
      throw error;
    }
  }

  /**
   * Bulk update keywords
   */
  async bulkUpdateKeywords(
    updates: Array<{ id: number; updateData: UpdateKeywordRequest }>
  ): Promise<UserKeyword[]> {
    try {
      const results: UserKeyword[] = [];

      for (const update of updates) {
        const result = await this.updateKeyword(update.id, update.updateData);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error("Error bulk updating keywords:", error);
      throw error;
    }
  }
}
