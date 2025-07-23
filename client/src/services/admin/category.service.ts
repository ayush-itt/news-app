import { ApiService } from "../api.service";
import {
  Category,
  CreateCategoryDto,
  CategoryResponse,
} from "../../interfaces";

export class CategoryService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all categories (including inactive ones)
   */
  async getAllCategories(activeOnly: boolean = false): Promise<Category[]> {
    return await this.apiService.get<Category[]>(
      `/categories?activeOnly=${activeOnly}`
    );
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<Category> {
    return await this.apiService.get<Category>(`/categories/${id}`);
  }

  /**
   * Create new category
   */
  async createCategory(
    categoryData: CreateCategoryDto
  ): Promise<CategoryResponse> {
    return await this.apiService.post<CategoryResponse>(
      "/categories",
      categoryData
    );
  }

  /**
   * Toggle category active status (enable/disable)
   */
  async toggleCategoryStatus(id: number): Promise<CategoryResponse> {
    return await this.apiService.put<CategoryResponse>(
      `/categories/${id}/toggle-status`
    );
  }
}
