import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { KeywordsService } from '../../src/keywords/keywords.service';
import { KeywordRepository } from '../../src/database/repositories/keyword.repository';
import { CategoriesService } from '../../src/categories/categories.service';
import { CreateKeywordDto, UpdateKeywordDto } from '../../src/keywords/dto';
import { Keyword } from '../../src/database/entities/keyword.entity';
import { mockCreateKeywordDto } from '../mock-data/dto.mock';
import { mockUser } from '../mock-data/user.mock';
import { mockCategory } from '../mock-data/interactions.mock';

describe('KeywordsService', () => {
  let service: KeywordsService;
  let keywordRepository: KeywordRepository;
  let categoriesService: CategoriesService;

  const mockKeyword: Keyword = {
    id: 1,
    userId: 1,
    categoryId: 1,
    keyword: 'technology',
    isActive: true,
    createdAt: new Date(),
    user: mockUser as any,
    category: mockCategory as any,
  };

  const mockKeywords: Keyword[] = [
    mockKeyword,
    {
      id: 2,
      userId: 1,
      categoryId: 2,
      keyword: 'sports',
      isActive: false,
      createdAt: new Date(),
      user: mockUser as any,
      category: mockCategory as any,
    },
  ];

  const mockKeywordRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findByUserAndCategory: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    existsByUserCategoryKeyword: jest.fn(),
    getUserKeywordCount: jest.fn(),
    getKeywordsByCategory: jest.fn(),
    findActiveKeywords: jest.fn(),
  };

  const mockCategoriesService = {
    getCategoryById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeywordsService,
        {
          provide: KeywordRepository,
          useValue: mockKeywordRepository,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    service = module.get<KeywordsService>(KeywordsService);
    keywordRepository = module.get<KeywordRepository>(KeywordRepository);
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createKeyword', () => {
    it('should create keyword successfully', async () => {
      const userId = 1;
      const createDto: CreateKeywordDto = mockCreateKeywordDto;

      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockKeywordRepository.existsByUserCategoryKeyword.mockResolvedValue(
        false,
      );
      mockKeywordRepository.create.mockResolvedValue(mockKeyword);

      const result = await service.createKeyword(userId, createDto);

      expect(categoriesService.getCategoryById).toHaveBeenCalledWith(
        createDto.categoryId,
      );
      expect(
        keywordRepository.existsByUserCategoryKeyword,
      ).toHaveBeenCalledWith(
        userId,
        createDto.categoryId,
        createDto.keyword.toLowerCase().trim(),
      );
      expect(keywordRepository.create).toHaveBeenCalledWith({
        userId: userId,
        categoryId: createDto.categoryId,
        keyword: createDto.keyword.toLowerCase().trim(),
        isActive: true,
      });
      expect(result).toEqual(mockKeyword);
    });

    it('should throw NotFoundException if category not found', async () => {
      const userId = 1;
      const createDto: CreateKeywordDto = mockCreateKeywordDto;

      mockCategoriesService.getCategoryById.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(service.createKeyword(userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoriesService.getCategoryById).toHaveBeenCalledWith(
        createDto.categoryId,
      );
    });

    it('should throw ConflictException if keyword already exists for user and category', async () => {
      const userId = 1;
      const createDto: CreateKeywordDto = mockCreateKeywordDto;

      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockKeywordRepository.existsByUserCategoryKeyword.mockResolvedValue(true);

      await expect(service.createKeyword(userId, createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        keywordRepository.existsByUserCategoryKeyword,
      ).toHaveBeenCalledWith(
        userId,
        createDto.categoryId,
        createDto.keyword.toLowerCase().trim(),
      );
    });

    it('should throw BadRequestException if creation fails', async () => {
      const userId = 1;
      const createDto: CreateKeywordDto = mockCreateKeywordDto;

      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockKeywordRepository.existsByUserCategoryKeyword.mockResolvedValue(
        false,
      );
      mockKeywordRepository.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.createKeyword(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(keywordRepository.create).toHaveBeenCalled();
    });

    it('should handle isActive flag correctly', async () => {
      const userId = 1;
      const createDto: CreateKeywordDto = {
        ...mockCreateKeywordDto,
        isActive: false,
      };

      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockKeywordRepository.existsByUserCategoryKeyword.mockResolvedValue(
        false,
      );
      mockKeywordRepository.create.mockResolvedValue({
        ...mockKeyword,
        isActive: false,
      });

      const result = await service.createKeyword(userId, createDto);

      expect(keywordRepository.create).toHaveBeenCalledWith({
        userId: userId,
        categoryId: createDto.categoryId,
        keyword: createDto.keyword.toLowerCase().trim(),
        isActive: false,
      });
      expect(result.isActive).toBe(false);
    });
  });

  describe('findAllKeywords', () => {
    it('should return all keywords', async () => {
      mockKeywordRepository.findAll.mockResolvedValue(mockKeywords);

      const result = await service.findAllKeywords();

      expect(keywordRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockKeywords);
    });
  });

  describe('findUserKeywords', () => {
    it('should return user keywords', async () => {
      const userId = 1;

      mockKeywordRepository.findByUserId.mockResolvedValue(mockKeywords);

      const result = await service.findUserKeywords(userId);

      expect(keywordRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockKeywords);
    });
  });

  describe('findUserKeywordsByCategory', () => {
    it('should return user keywords by category', async () => {
      const userId = 1;
      const categoryId = 1;

      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockKeywordRepository.findByUserAndCategory.mockResolvedValue([
        mockKeyword,
      ]);

      const result = await service.findUserKeywordsByCategory(
        userId,
        categoryId,
      );

      expect(categoriesService.getCategoryById).toHaveBeenCalledWith(
        categoryId,
      );
      expect(keywordRepository.findByUserAndCategory).toHaveBeenCalledWith(
        userId,
        categoryId,
      );
      expect(result).toEqual([mockKeyword]);
    });

    it('should throw NotFoundException if category not found', async () => {
      const userId = 1;
      const categoryId = 999;

      mockCategoriesService.getCategoryById.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(
        service.findUserKeywordsByCategory(userId, categoryId),
      ).rejects.toThrow(NotFoundException);
      expect(categoriesService.getCategoryById).toHaveBeenCalledWith(
        categoryId,
      );
    });
  });

  describe('findKeywordById', () => {
    it('should return keyword by ID', async () => {
      const keywordId = 1;

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);

      const result = await service.findKeywordById(keywordId);

      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
      expect(result).toEqual(mockKeyword);
    });

    it('should throw NotFoundException if keyword not found', async () => {
      const keywordId = 999;

      mockKeywordRepository.findById.mockResolvedValue(null);

      await expect(service.findKeywordById(keywordId)).rejects.toThrow(
        NotFoundException,
      );
      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
    });
  });

  describe('updateKeyword', () => {
    it('should update keyword successfully', async () => {
      const keywordId = 1;
      const userId = 1;
      const updateDto: UpdateKeywordDto = {
        keyword: 'updated-keyword',
        isActive: false,
      };
      const updatedKeyword = { ...mockKeyword, ...updateDto };

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);
      mockKeywordRepository.existsByUserCategoryKeyword.mockResolvedValue(
        false,
      );
      mockKeywordRepository.update.mockResolvedValue(updatedKeyword);

      const result = await service.updateKeyword(keywordId, userId, updateDto);

      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
      expect(
        keywordRepository.existsByUserCategoryKeyword,
      ).toHaveBeenCalledWith(
        userId,
        mockKeyword.categoryId,
        updateDto.keyword!.toLowerCase().trim(),
        keywordId,
      );
      expect(keywordRepository.update).toHaveBeenCalledWith(keywordId, {
        ...updateDto,
        keyword: updateDto.keyword!.toLowerCase().trim(),
      });
      expect(result).toEqual(updatedKeyword);
    });

    it('should throw ForbiddenException if user does not own keyword', async () => {
      const keywordId = 1;
      const userId = 2; // Different user
      const updateDto: UpdateKeywordDto = {
        keyword: 'updated-keyword',
      };

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);

      await expect(
        service.updateKeyword(keywordId, userId, updateDto),
      ).rejects.toThrow(ForbiddenException);
      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
    });

    it('should throw ConflictException if updated keyword already exists', async () => {
      const keywordId = 1;
      const userId = 1;
      const updateDto: UpdateKeywordDto = {
        keyword: 'existing-keyword',
      };

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);
      mockKeywordRepository.existsByUserCategoryKeyword.mockResolvedValue(true);

      await expect(
        service.updateKeyword(keywordId, userId, updateDto),
      ).rejects.toThrow(ConflictException);
      expect(
        keywordRepository.existsByUserCategoryKeyword,
      ).toHaveBeenCalledWith(
        userId,
        mockKeyword.categoryId,
        updateDto.keyword!.toLowerCase().trim(),
        keywordId,
      );
    });

    it('should throw BadRequestException if update fails', async () => {
      const keywordId = 1;
      const userId = 1;
      const updateDto: UpdateKeywordDto = {
        isActive: false,
      };

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);
      mockKeywordRepository.update.mockResolvedValue(null);

      await expect(
        service.updateKeyword(keywordId, userId, updateDto),
      ).rejects.toThrow(BadRequestException);
      expect(keywordRepository.update).toHaveBeenCalledWith(
        keywordId,
        updateDto,
      );
    });

    it('should update without changing keyword text', async () => {
      const keywordId = 1;
      const userId = 1;
      const updateDto: UpdateKeywordDto = {
        isActive: false,
      };
      const updatedKeyword = { ...mockKeyword, isActive: false };

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);
      mockKeywordRepository.update.mockResolvedValue(updatedKeyword);

      const result = await service.updateKeyword(keywordId, userId, updateDto);

      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
      expect(
        keywordRepository.existsByUserCategoryKeyword,
      ).not.toHaveBeenCalled();
      expect(keywordRepository.update).toHaveBeenCalledWith(
        keywordId,
        updateDto,
      );
      expect(result).toEqual(updatedKeyword);
    });
  });

  describe('deleteKeyword', () => {
    it('should delete keyword successfully', async () => {
      const keywordId = 1;
      const userId = 1;

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);
      mockKeywordRepository.delete.mockResolvedValue(true);

      await service.deleteKeyword(keywordId, userId);

      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
      expect(keywordRepository.delete).toHaveBeenCalledWith(keywordId);
    });

    it('should throw ForbiddenException if user does not own keyword', async () => {
      const keywordId = 1;
      const userId = 2; // Different user

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);

      await expect(service.deleteKeyword(keywordId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
    });

    it('should throw BadRequestException if deletion fails', async () => {
      const keywordId = 1;
      const userId = 1;

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);
      mockKeywordRepository.delete.mockResolvedValue(false);

      await expect(service.deleteKeyword(keywordId, userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(keywordRepository.delete).toHaveBeenCalledWith(keywordId);
    });
  });

  describe('toggleKeywordActive', () => {
    it('should toggle keyword active status successfully', async () => {
      const keywordId = 1;
      const userId = 1;
      const toggledKeyword = { ...mockKeyword, isActive: false };

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);
      mockKeywordRepository.update.mockResolvedValue(toggledKeyword);

      const result = await service.toggleKeywordActive(keywordId, userId);

      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
      expect(keywordRepository.update).toHaveBeenCalledWith(keywordId, {
        isActive: !mockKeyword.isActive,
      });
      expect(result).toEqual(toggledKeyword);
    });

    it('should throw ForbiddenException if user does not own keyword', async () => {
      const keywordId = 1;
      const userId = 2; // Different user

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);

      await expect(
        service.toggleKeywordActive(keywordId, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(keywordRepository.findById).toHaveBeenCalledWith(keywordId);
    });

    it('should throw BadRequestException if toggle fails', async () => {
      const keywordId = 1;
      const userId = 1;

      mockKeywordRepository.findById.mockResolvedValue(mockKeyword);
      mockKeywordRepository.update.mockResolvedValue(null);

      await expect(
        service.toggleKeywordActive(keywordId, userId),
      ).rejects.toThrow(BadRequestException);
      expect(keywordRepository.update).toHaveBeenCalledWith(keywordId, {
        isActive: !mockKeyword.isActive,
      });
    });
  });

  describe('getUserKeywordCount', () => {
    it('should return user keyword count', async () => {
      const userId = 1;
      const count = 5;

      mockKeywordRepository.getUserKeywordCount.mockResolvedValue(count);

      const result = await service.getUserKeywordCount(userId);

      expect(keywordRepository.getUserKeywordCount).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(count);
    });
  });

  describe('getKeywordsByCategory', () => {
    it('should return keywords by category', async () => {
      const categoryId = 1;

      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockKeywordRepository.getKeywordsByCategory.mockResolvedValue([
        mockKeyword,
      ]);

      const result = await service.getKeywordsByCategory(categoryId);

      expect(categoriesService.getCategoryById).toHaveBeenCalledWith(
        categoryId,
      );
      expect(keywordRepository.getKeywordsByCategory).toHaveBeenCalledWith(
        categoryId,
      );
      expect(result).toEqual([mockKeyword]);
    });

    it('should throw NotFoundException if category not found', async () => {
      const categoryId = 999;

      mockCategoriesService.getCategoryById.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(service.getKeywordsByCategory(categoryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoriesService.getCategoryById).toHaveBeenCalledWith(
        categoryId,
      );
    });
  });

  describe('getActiveKeywords', () => {
    it('should return active keywords', async () => {
      const activeKeywords = [mockKeyword];

      mockKeywordRepository.findActiveKeywords.mockResolvedValue(
        activeKeywords,
      );

      const result = await service.getActiveKeywords();

      expect(keywordRepository.findActiveKeywords).toHaveBeenCalled();
      expect(result).toEqual(activeKeywords);
    });
  });
});
