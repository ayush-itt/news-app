import { Test, TestingModule } from '@nestjs/testing';
import { KeywordsController } from '../../src/keywords/keywords.controller';
import { KeywordsService } from '../../src/keywords/keywords.service';
import { CreateKeywordDto, UpdateKeywordDto } from '../../src/keywords/dto';
import { Keyword } from '../../src/database/entities/keyword.entity';
import { mockUser } from '../mock-data/user.mock';
import { mockCreateKeywordDto } from '../mock-data/dto.mock';

describe('KeywordsController', () => {
  let controller: KeywordsController;
  let service: KeywordsService;

  const mockKeyword: Keyword = {
    id: 1,
    userId: 1,
    categoryId: 1,
    keyword: 'technology',
    isActive: true,
    createdAt: new Date(),
    user: mockUser as any,
    category: {
      id: 1,
      name: 'Technology',
      slug: 'technology',
      description: 'Tech news',
      isActive: true,
      createdAt: new Date(),
    } as any,
  };

  const mockKeywordsService = {
    createKeyword: jest.fn(),
    findUserKeywords: jest.fn(),
    findUserKeywordsByCategory: jest.fn(),
    findKeywordById: jest.fn(),
    updateKeyword: jest.fn(),
    toggleKeywordActive: jest.fn(),
    deleteKeyword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeywordsController],
      providers: [
        {
          provide: KeywordsService,
          useValue: mockKeywordsService,
        },
      ],
    }).compile();

    controller = module.get<KeywordsController>(KeywordsController);
    service = module.get<KeywordsService>(KeywordsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create keyword successfully', async () => {
      const createDto: CreateKeywordDto = mockCreateKeywordDto;
      const user = mockUser as any;

      mockKeywordsService.createKeyword.mockResolvedValue(mockKeyword);

      const result = await controller.create(createDto, user);

      expect(service.createKeyword).toHaveBeenCalledWith(user.id, createDto);
      expect(result).toBeDefined();
    });

    it('should handle creation errors', async () => {
      const createDto: CreateKeywordDto = mockCreateKeywordDto;
      const user = mockUser as any;
      const errorMessage = 'You already have this keyword for this category';

      mockKeywordsService.createKeyword.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.create(createDto, user)).rejects.toThrow(
        errorMessage,
      );
      expect(service.createKeyword).toHaveBeenCalledWith(user.id, createDto);
    });
  });

  describe('findUserKeywords', () => {
    it('should return user keywords without category filter', async () => {
      const user = mockUser as any;
      const mockKeywords = [mockKeyword];

      mockKeywordsService.findUserKeywords.mockResolvedValue(mockKeywords);

      const result = await controller.findUserKeywords(undefined, user);

      expect(service.findUserKeywords).toHaveBeenCalledWith(user.id);
      expect(result).toBeDefined();
    });

    it('should return user keywords with category filter', async () => {
      const categoryId = 1;
      const user = mockUser as any;
      const mockKeywords = [mockKeyword];

      mockKeywordsService.findUserKeywordsByCategory.mockResolvedValue(
        mockKeywords,
      );

      const result = await controller.findUserKeywords(categoryId, user);

      expect(service.findUserKeywordsByCategory).toHaveBeenCalledWith(
        user.id,
        categoryId,
      );
      expect(result).toBeDefined();
    });

    it('should handle errors when fetching keywords', async () => {
      const user = mockUser as any;
      const errorMessage = 'Database error';

      mockKeywordsService.findUserKeywords.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.findUserKeywords(undefined, user),
      ).rejects.toThrow(errorMessage);
      expect(service.findUserKeywords).toHaveBeenCalledWith(user.id);
    });
  });

  describe('findOne', () => {
    it('should return keyword by ID', async () => {
      const keywordId = 1;

      mockKeywordsService.findKeywordById.mockResolvedValue(mockKeyword);

      const result = await controller.findOne(keywordId);

      expect(service.findKeywordById).toHaveBeenCalledWith(keywordId);
      expect(result).toBeDefined();
    });

    it('should handle keyword not found', async () => {
      const keywordId = 999;
      const errorMessage = 'Keyword not found';

      mockKeywordsService.findKeywordById.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.findOne(keywordId)).rejects.toThrow(errorMessage);
      expect(service.findKeywordById).toHaveBeenCalledWith(keywordId);
    });
  });

  describe('update', () => {
    it('should update keyword successfully', async () => {
      const keywordId = 1;
      const updateDto: UpdateKeywordDto = {
        keyword: 'updated-keyword',
        isActive: false,
      };
      const user = mockUser as any;
      const updatedKeyword = { ...mockKeyword, ...updateDto };

      mockKeywordsService.updateKeyword.mockResolvedValue(updatedKeyword);

      const result = await controller.update(keywordId, updateDto, user);

      expect(service.updateKeyword).toHaveBeenCalledWith(
        keywordId,
        user.id,
        updateDto,
      );
      expect(result).toBeDefined();
    });

    it('should handle update errors', async () => {
      const keywordId = 1;
      const updateDto: UpdateKeywordDto = {
        keyword: 'existing-keyword',
      };
      const user = mockUser as any;
      const errorMessage = 'You already have this keyword for this category';

      mockKeywordsService.updateKeyword.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.update(keywordId, updateDto, user),
      ).rejects.toThrow(errorMessage);
      expect(service.updateKeyword).toHaveBeenCalledWith(
        keywordId,
        user.id,
        updateDto,
      );
    });

    it('should handle forbidden access', async () => {
      const keywordId = 1;
      const updateDto: UpdateKeywordDto = {
        keyword: 'test',
      };
      const user = mockUser as any;
      const errorMessage = 'You can only update your own keywords';

      mockKeywordsService.updateKeyword.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.update(keywordId, updateDto, user),
      ).rejects.toThrow(errorMessage);
      expect(service.updateKeyword).toHaveBeenCalledWith(
        keywordId,
        user.id,
        updateDto,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle keyword active status successfully', async () => {
      const keywordId = 1;
      const user = mockUser as any;
      const toggledKeyword = { ...mockKeyword, isActive: false };

      mockKeywordsService.toggleKeywordActive.mockResolvedValue(toggledKeyword);

      const result = await controller.toggleActive(keywordId, user);

      expect(service.toggleKeywordActive).toHaveBeenCalledWith(
        keywordId,
        user.id,
      );
      expect(result).toBeDefined();
    });

    it('should handle toggle errors', async () => {
      const keywordId = 1;
      const user = mockUser as any;
      const errorMessage = 'You can only modify your own keywords';

      mockKeywordsService.toggleKeywordActive.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.toggleActive(keywordId, user)).rejects.toThrow(
        errorMessage,
      );
      expect(service.toggleKeywordActive).toHaveBeenCalledWith(
        keywordId,
        user.id,
      );
    });
  });

  describe('remove', () => {
    it('should delete keyword successfully', async () => {
      const keywordId = 1;
      const user = mockUser as any;

      mockKeywordsService.deleteKeyword.mockResolvedValue(undefined);

      await controller.remove(keywordId, user);

      expect(service.deleteKeyword).toHaveBeenCalledWith(keywordId, user.id);
    });

    it('should handle deletion errors', async () => {
      const keywordId = 1;
      const user = mockUser as any;
      const errorMessage = 'You can only delete your own keywords';

      mockKeywordsService.deleteKeyword.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.remove(keywordId, user)).rejects.toThrow(
        errorMessage,
      );
      expect(service.deleteKeyword).toHaveBeenCalledWith(keywordId, user.id);
    });
  });
});
