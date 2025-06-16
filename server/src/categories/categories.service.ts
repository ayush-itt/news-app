import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoryRepository } from '../database/repositories';
import { generateSlug } from '../common/utils';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(
    name: string,
    description?: string,
  ): Promise<{ message: string; category: any }> {
    const slug = generateSlug(name);

    const exists = await this.categoryRepository.checkIfExists(name, slug);
    if (exists) {
      throw new ConflictException('Category with this name already exists');
    }

    try {
      const category = await this.categoryRepository.create({
        name,
        slug,
        description,
        isActive: true,
      });

      return {
        message: 'Category created successfully',
        category,
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw new BadRequestException('Failed to create category');
    }
  }

  async getAllCategories(activeOnly: boolean = true): Promise<any[]> {
    return await this.categoryRepository.findAll(activeOnly);
  }

  async getCategoryById(id: number): Promise<any> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<any> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }
  async updateCategory(
    id: number,
    updateData: {
      name?: string;
      description?: string;
      isActive?: boolean;
      slug?: string;
    },
  ): Promise<{ message: string; category: any }> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // If name is being updated, generate new slug and check for conflicts
    if (updateData.name && updateData.name !== existingCategory.name) {
      const newSlug = generateSlug(updateData.name);
      const nameExists = await this.categoryRepository.findByName(
        updateData.name,
      );
      const slugExists = await this.categoryRepository.findBySlug(newSlug);

      if (nameExists || slugExists) {
        throw new ConflictException('Category with this name already exists');
      }

      updateData = { ...updateData, slug: newSlug };
    }

    try {
      const updatedCategory = await this.categoryRepository.updateById(
        id,
        updateData,
      );

      return {
        message: 'Category updated successfully',
        category: updatedCategory,
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw new BadRequestException('Failed to update category');
    }
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    try {
      const isDeleted = await this.categoryRepository.deleteById(id);
      if (!isDeleted) {
        throw new BadRequestException('Failed to delete category');
      }

      return {
        message: 'Category deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete category');
    }
  }

  async getCategoriesWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    categories: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.categoryRepository.findWithPagination(
      page,
      limit,
    );

    return {
      categories: result.categories,
      total: result.total,
      page,
      limit,
    };
  }

  async toggleCategoryStatus(
    id: number,
  ): Promise<{ message: string; category: any }> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const updatedCategory = await this.categoryRepository.updateById(id, {
      isActive: !category.isActive,
    });

    return {
      message: `Category ${updatedCategory?.isActive ? 'activated' : 'deactivated'} successfully`,
      category: updatedCategory,
    };
  }
}
