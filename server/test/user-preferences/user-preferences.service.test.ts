import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserPreferencesService } from '../../src/user-preferences/user-preferences.service';
import { UserPreferenceRepository } from '../../src/database/repositories/user-preference.repository';
import { CategoryRepository } from '../../src/database/repositories/category.repository';
import { UpdateUserPreferenceDto } from '../../src/user-preferences/dto';
import { UserPreference } from '../../src/database/entities/user-preference.entity';
import { mockUser } from '../mock-data/user.mock';
import { mockUpdateUserPreferenceDto } from '../mock-data/dto.mock';
import { mockCategory } from '../mock-data/interactions.mock';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let userPreferenceRepository: UserPreferenceRepository;
  let categoryRepository: CategoryRepository;

  const mockUserPreference: UserPreference = {
    id: 1,
    userId: 1,
    categoryId: 1,
    isSubscribed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser as any,
    category: mockCategory as any,
  };

  const mockUserPreferences: UserPreference[] = [
    mockUserPreference,
    {
      id: 2,
      userId: 1,
      categoryId: 2,
      isSubscribed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser as any,
      category: { ...mockCategory, id: 2, name: 'Sports' } as any,
    },
  ];

  const mockCategories = [
    mockCategory,
    { ...mockCategory, id: 2, name: 'Sports', slug: 'sports' },
  ];

  const mockUserPreferenceRepository = {
    findByUserId: jest.fn(),
    findByUserAndCategory: jest.fn(),
    createOrUpdatePreference: jest.fn(),
    bulkUpdatePreferences: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCategoryRepository = {
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        {
          provide: UserPreferenceRepository,
          useValue: mockUserPreferenceRepository,
        },
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
    userPreferenceRepository = module.get<UserPreferenceRepository>(
      UserPreferenceRepository,
    );
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const userId = 1;

      mockUserPreferenceRepository.findByUserId.mockResolvedValue(
        mockUserPreferences,
      );

      const result = await service.getUserPreferences(userId);

      expect(userPreferenceRepository.findByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(mockUserPreferences);
    });

    it('should return empty array if no preferences found', async () => {
      const userId = 1;

      mockUserPreferenceRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getUserPreferences(userId);

      expect(userPreferenceRepository.findByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual([]);
    });
  });

  describe('updatePreference', () => {
    it('should update preference successfully', async () => {
      const userId = 1;
      const categoryId = 1;
      const updateDto: UpdateUserPreferenceDto = mockUpdateUserPreferenceDto;
      const updatedPreference = { ...mockUserPreference, isSubscribed: true };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockUserPreferenceRepository.findByUserAndCategory.mockResolvedValue(
        mockUserPreference,
      );
      mockUserPreferenceRepository.createOrUpdatePreference.mockResolvedValue(
        updatedPreference,
      );

      const result = await service.updatePreference(
        userId,
        categoryId,
        updateDto,
      );

      expect(categoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(
        userPreferenceRepository.findByUserAndCategory,
      ).toHaveBeenCalledWith(userId, categoryId);
      expect(
        userPreferenceRepository.createOrUpdatePreference,
      ).toHaveBeenCalledWith(userId, categoryId, updateDto.isSubscribed);
      expect(result).toEqual(updatedPreference);
    });

    it('should throw NotFoundException if category not found', async () => {
      const userId = 1;
      const categoryId = 999;
      const updateDto: UpdateUserPreferenceDto = mockUpdateUserPreferenceDto;

      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        service.updatePreference(userId, categoryId, updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(categoryRepository.findById).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException if category is inactive', async () => {
      const userId = 1;
      const categoryId = 1;
      const updateDto: UpdateUserPreferenceDto = mockUpdateUserPreferenceDto;
      const inactiveCategory = { ...mockCategory, isActive: false };

      mockCategoryRepository.findById.mockResolvedValue(inactiveCategory);

      await expect(
        service.updatePreference(userId, categoryId, updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(categoryRepository.findById).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException if preference not found', async () => {
      const userId = 1;
      const categoryId = 1;
      const updateDto: UpdateUserPreferenceDto = mockUpdateUserPreferenceDto;

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockUserPreferenceRepository.findByUserAndCategory.mockResolvedValue(
        null,
      );

      await expect(
        service.updatePreference(userId, categoryId, updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(
        userPreferenceRepository.findByUserAndCategory,
      ).toHaveBeenCalledWith(userId, categoryId);
    });

    it('should return existing preference if isSubscribed is undefined', async () => {
      const userId = 1;
      const categoryId = 1;
      const updateDto: UpdateUserPreferenceDto = {}; // isSubscribed is undefined

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockUserPreferenceRepository.findByUserAndCategory.mockResolvedValue(
        mockUserPreference,
      );

      const result = await service.updatePreference(
        userId,
        categoryId,
        updateDto,
      );

      expect(categoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(
        userPreferenceRepository.findByUserAndCategory,
      ).toHaveBeenCalledWith(userId, categoryId);
      expect(
        userPreferenceRepository.createOrUpdatePreference,
      ).not.toHaveBeenCalled();
      expect(result).toEqual(mockUserPreference);
    });
  });

  describe('initializeDefaultPreferences', () => {
    it('should initialize default preferences for all active categories', async () => {
      const userId = 1;

      mockCategoryRepository.findAll.mockResolvedValue(mockCategories);
      mockUserPreferenceRepository.bulkUpdatePreferences.mockResolvedValue(
        mockUserPreferences,
      );

      const result = await service.initializeDefaultPreferences(userId);

      expect(categoryRepository.findAll).toHaveBeenCalledWith(true);
      expect(
        userPreferenceRepository.bulkUpdatePreferences,
      ).toHaveBeenCalledWith(userId, [
        { categoryId: 1, isSubscribed: false },
        { categoryId: 2, isSubscribed: false },
      ]);
      expect(result).toEqual(mockUserPreferences);
    });

    it('should handle empty categories list', async () => {
      const userId = 1;

      mockCategoryRepository.findAll.mockResolvedValue([]);
      mockUserPreferenceRepository.bulkUpdatePreferences.mockResolvedValue([]);

      const result = await service.initializeDefaultPreferences(userId);

      expect(categoryRepository.findAll).toHaveBeenCalledWith(true);
      expect(
        userPreferenceRepository.bulkUpdatePreferences,
      ).toHaveBeenCalledWith(userId, []);
      expect(result).toEqual([]);
    });
  });

  describe('getSubscribedUserPreferences', () => {
    it('should return subscribed user preferences for active categories', async () => {
      const subscribedPreferences = [mockUserPreference];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(subscribedPreferences),
      };

      mockUserPreferenceRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getSubscribedUserPreferences();

      expect(userPreferenceRepository.createQueryBuilder).toHaveBeenCalledWith(
        'preference',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'preference.user',
        'user',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'preference.category',
        'category',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'preference.isSubscribed = :isSubscribed',
        { isSubscribed: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.isActive = :isActive',
        {
          isActive: true,
        },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(subscribedPreferences);
    });

    it('should handle errors in query builder', async () => {
      const errorMessage = 'Database query error';
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error(errorMessage)),
      };

      mockUserPreferenceRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await expect(service.getSubscribedUserPreferences()).rejects.toThrow(
        errorMessage,
      );
      expect(userPreferenceRepository.createQueryBuilder).toHaveBeenCalledWith(
        'preference',
      );
    });
  });
});
