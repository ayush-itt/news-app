import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '@/categories/categories.service';
import { Category } from '@/database/entities/category.entity';
import {
  mockCategories,
  mockCategory,
  createMockRepository,
  resetMocks,
} from '../mock-data';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

  const mockCategoryRepository = createMockRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    resetMocks();
  });

  describe('getAllCategories', () => {
    it('should return all active categories when activeOnly is true', async () => {
      const activeCategories = mockCategories.filter((cat) => cat.isActive);
      mockCategoryRepository.find.mockResolvedValue(activeCategories);

      const result = await service.getAllCategories(true);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(activeCategories);
    });

    it('should return all categories when activeOnly is false', async () => {
      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.getAllCategories(false);

      expect(repository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should handle database errors', async () => {
      mockCategoryRepository.find.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getAllCategories(true)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.getCategoryById(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw error when category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.getCategoryById(999)).rejects.toThrow(
        'Category with ID 999 not found',
      );
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryName = 'New Category';
      const categoryDescription = 'A new category description';
      const newCategory = {
        ...mockCategory,
        id: 5,
        name: categoryName,
        description: categoryDescription,
      };

      mockCategoryRepository.findOne.mockResolvedValue(null); // No existing category
      mockCategoryRepository.create.mockReturnValue(newCategory);
      mockCategoryRepository.save.mockResolvedValue(newCategory);

      const result = await service.createCategory(
        categoryName,
        categoryDescription,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: categoryName },
      });
      expect(repository.create).toHaveBeenCalledWith({
        name: categoryName,
        slug: 'new-category',
        description: categoryDescription,
      });
      expect(repository.save).toHaveBeenCalledWith(newCategory);
      expect(result).toEqual({
        message: 'Category created successfully',
        data: newCategory,
      });
    });

    it('should throw error when category name already exists', async () => {
      const existingCategory = mockCategory;
      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

      await expect(
        service.createCategory('Technology', 'Desc'),
      ).rejects.toThrow('Category with name "Technology" already exists');
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const updateData = { name: 'Updated Category' };
      const updatedCategory = { ...mockCategory, name: 'Updated Category' };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(1, updateData);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockCategory,
        ...updateData,
        slug: 'updated-category',
      });
      expect(result).toEqual({
        message: 'Category updated successfully',
        data: updatedCategory,
      });
    });

    it('should throw error when category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCategory(999, { name: 'Test' }),
      ).rejects.toThrow('Category with ID 999 not found');
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.remove.mockResolvedValue(mockCategory);

      const result = await service.deleteCategory(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual({
        message: 'Category deleted successfully',
      });
    });

    it('should throw error when category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteCategory(999)).rejects.toThrow(
        'Category with ID 999 not found',
      );
    });
  });

  describe('toggleCategoryStatus', () => {
    it('should toggle category status from active to inactive', async () => {
      const activeCategory = { ...mockCategory, isActive: true };
      const inactiveCategory = { ...mockCategory, isActive: false };

      mockCategoryRepository.findOne.mockResolvedValue(activeCategory);
      mockCategoryRepository.save.mockResolvedValue(inactiveCategory);

      const result = await service.toggleCategoryStatus(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...activeCategory,
        isActive: false,
      });
      expect(result).toEqual({
        message: 'Category status toggled successfully',
        data: inactiveCategory,
      });
    });

    it('should toggle category status from inactive to active', async () => {
      const inactiveCategory = { ...mockCategory, isActive: false };
      const activeCategory = { ...mockCategory, isActive: true };

      mockCategoryRepository.findOne.mockResolvedValue(inactiveCategory);
      mockCategoryRepository.save.mockResolvedValue(activeCategory);

      const result = await service.toggleCategoryStatus(1);

      expect(repository.save).toHaveBeenCalledWith({
        ...inactiveCategory,
        isActive: true,
      });
      expect(result).toEqual({
        message: 'Category status toggled successfully',
        data: activeCategory,
      });
    });

    it('should throw error when category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.toggleCategoryStatus(999)).rejects.toThrow(
        'Category with ID 999 not found',
      );
    });
  });
});
