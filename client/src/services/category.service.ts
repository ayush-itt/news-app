import { ApiService } from "./api.service";
import { Category } from "../interfaces/category.interface";

export class CategoryService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * Get all categories (optionally active only)
   */
  async getCategories(activeOnly: boolean = true): Promise<Category[]> {
    try {
      const url = activeOnly ? "/categories?activeOnly=true" : "/categories";
      const response = await this.apiService.get<Category[]>(url);
      return response || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Get active categories only
   */
  async getActiveCategories(): Promise<Category[]> {
    return this.getCategories(true);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await this.apiService.get<Category>(`/categories/${id}`);
      if (!response) {
        throw new Error("Failed to get category - no data returned");
      }
      return response;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  }
}
