import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '@/categories/categories.controller';
import { CategoriesService } from '@/categories/categories.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import {
  mockCategories,
  mockCategory,
  mockCreateCategoryDto,
  mockUser,
  mockAdminUser,
  resetMocks,
} from '../mock-data';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    toggleCategoryStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all active categories by default', async () => {
      const expectedCategories = mockCategories.filter((cat) => cat.isActive);
      mockCategoriesService.getAllCategories.mockResolvedValue(
        expectedCategories,
      );

      const result = await controller.getAllCategories();

      expect(service.getAllCategories).toHaveBeenCalledWith(true);
      expect(result).toEqual(expectedCategories);
    });

    it('should return all categories when activeOnly is false', async () => {
      mockCategoriesService.getAllCategories.mockResolvedValue(mockCategories);

      const result = await controller.getAllCategories('false');

      expect(service.getAllCategories).toHaveBeenCalledWith(false);
      expect(result).toEqual(mockCategories);
    });

    it('should return active categories when activeOnly is true', async () => {
      const expectedCategories = mockCategories.filter((cat) => cat.isActive);
      mockCategoriesService.getAllCategories.mockResolvedValue(
        expectedCategories,
      );

      const result = await controller.getAllCategories('true');

      expect(service.getAllCategories).toHaveBeenCalledWith(true);
      expect(result).toEqual(expectedCategories);
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id', async () => {
      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);

      const result = await controller.getCategoryById(1);

      expect(service.getCategoryById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });

    it('should throw error when category not found', async () => {
      mockCategoriesService.getCategoryById.mockRejectedValue(
        new Error('Category not found'),
      );

      await expect(controller.getCategoryById(999)).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const newCategory = { ...mockCategory, id: 5, name: 'New Category' };
      mockCategoriesService.createCategory.mockResolvedValue(newCategory);

      const result = await controller.createCategory(mockCreateCategoryDto);

      expect(service.createCategory).toHaveBeenCalledWith(
        mockCreateCategoryDto,
      );
      expect(result).toEqual(newCategory);
    });

    it('should throw error when category name already exists', async () => {
      mockCategoriesService.createCategory.mockRejectedValue(
        new Error('Category with this name already exists'),
      );

      await expect(
        controller.createCategory(mockCreateCategoryDto),
      ).rejects.toThrow('Category with this name already exists');
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const updatedCategory = { ...mockCategory, name: 'Updated Category' };
      mockCategoriesService.updateCategory.mockResolvedValue(updatedCategory);

      const updateDto = { name: 'Updated Category' };
      const result = await controller.updateCategory(1, updateDto);

      expect(service.updateCategory).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw error when category not found', async () => {
      mockCategoriesService.updateCategory.mockRejectedValue(
        new Error('Category not found'),
      );

      await expect(
        controller.updateCategory(999, { name: 'Test' }),
      ).rejects.toThrow('Category not found');
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      mockCategoriesService.deleteCategory.mockResolvedValue(undefined);

      await controller.deleteCategory(1);

      expect(service.deleteCategory).toHaveBeenCalledWith(1);
    });

    it('should throw error when category not found', async () => {
      mockCategoriesService.deleteCategory.mockRejectedValue(
        new Error('Category not found'),
      );

      await expect(controller.deleteCategory(999)).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe('toggleCategoryStatus', () => {
    it('should toggle category status', async () => {
      const responseMessage = {
        message: 'Category status toggled successfully',
      };
      mockCategoriesService.toggleCategoryStatus.mockResolvedValue(
        responseMessage,
      );

      const result = await controller.toggleCategoryStatus(1);

      expect(service.toggleCategoryStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual(responseMessage);
    });

    it('should throw error when category not found', async () => {
      mockCategoriesService.toggleCategoryStatus.mockRejectedValue(
        new Error('Category not found'),
      );

      await expect(controller.toggleCategoryStatus(999)).rejects.toThrow(
        'Category not found',
      );
    });
  });
});
