import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { BannedKeywordsController } from '../../src/banned-keywords/banned-keywords.controller';
import { BannedKeywordsService } from '../../src/banned-keywords/banned-keywords.service';
import {
  CreateBannedKeywordDto,
  UpdateBannedKeywordDto,
  GetBannedKeywordsQueryDto,
} from '../../src/banned-keywords/dto';
import { BannedKeyword } from '../../src/database/entities/banned-keyword.entity';

describe('BannedKeywordsController', () => {
  let controller: BannedKeywordsController;
  let service: BannedKeywordsService;

  const mockBannedKeyword: BannedKeyword = {
    id: 1,
    keyword: 'spam',
    description: 'Spam content',
    isActive: true,
    isCaseSensitive: false,
    isRegex: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBannedKeywordsService = {
    create: jest.fn(),
    getList: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannedKeywordsController],
      providers: [
        {
          provide: BannedKeywordsService,
          useValue: mockBannedKeywordsService,
        },
      ],
    }).compile();

    controller = module.get<BannedKeywordsController>(BannedKeywordsController);
    service = module.get<BannedKeywordsService>(BannedKeywordsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBannedKeyword', () => {
    it('should create banned keyword successfully', async () => {
      const createDto: CreateBannedKeywordDto = {
        keyword: 'spam',
        description: 'Spam content',
        isCaseSensitive: false,
        isRegex: false,
      };

      mockBannedKeywordsService.create.mockResolvedValue(mockBannedKeyword);

      const result = await controller.createBannedKeyword(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockBannedKeyword);
    });

    it('should handle creation errors', async () => {
      const createDto: CreateBannedKeywordDto = {
        keyword: 'existing',
        description: 'Test',
      };
      const errorMessage = 'Keyword "existing" is already banned';

      mockBannedKeywordsService.create.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.createBannedKeyword(createDto)).rejects.toThrow(
        errorMessage,
      );
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getBannedKeywords', () => {
    it('should return paginated banned keywords', async () => {
      const queryDto: GetBannedKeywordsQueryDto = {
        page: 1,
        limit: 10,
        isActive: true,
        search: 'spam',
      };
      const mockResponse = {
        keywords: [mockBannedKeyword],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockBannedKeywordsService.getList.mockResolvedValue(mockResponse);

      const result = await controller.getBannedKeywords(queryDto);

      expect(service.getList).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty results', async () => {
      const queryDto: GetBannedKeywordsQueryDto = {
        page: 1,
        limit: 10,
      };
      const mockResponse = {
        keywords: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockBannedKeywordsService.getList.mockResolvedValue(mockResponse);

      const result = await controller.getBannedKeywords(queryDto);

      expect(service.getList).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getBannedKeywordById', () => {
    it('should return banned keyword by ID', async () => {
      const keywordId = 1;

      mockBannedKeywordsService.getById.mockResolvedValue(mockBannedKeyword);

      const result = await controller.getBannedKeywordById(keywordId);

      expect(service.getById).toHaveBeenCalledWith(keywordId);
      expect(result).toEqual(mockBannedKeyword);
    });

    it('should handle keyword not found', async () => {
      const keywordId = 999;
      const errorMessage = 'Banned keyword with ID 999 not found';

      mockBannedKeywordsService.getById.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.getBannedKeywordById(keywordId)).rejects.toThrow(
        errorMessage,
      );
      expect(service.getById).toHaveBeenCalledWith(keywordId);
    });
  });

  describe('updateBannedKeyword', () => {
    it('should update banned keyword successfully', async () => {
      const keywordId = 1;
      const updateDto: UpdateBannedKeywordDto = {
        description: 'Updated description',
        isActive: false,
      };
      const updatedKeyword = { ...mockBannedKeyword, ...updateDto };

      mockBannedKeywordsService.update.mockResolvedValue(updatedKeyword);

      const result = await controller.updateBannedKeyword(keywordId, updateDto);

      expect(service.update).toHaveBeenCalledWith(keywordId, updateDto);
      expect(result).toEqual(updatedKeyword);
    });

    it('should handle update errors', async () => {
      const keywordId = 1;
      const updateDto: UpdateBannedKeywordDto = {
        keyword: 'existing',
      };
      const errorMessage = 'Keyword "existing" is already banned';

      mockBannedKeywordsService.update.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.updateBannedKeyword(keywordId, updateDto),
      ).rejects.toThrow(errorMessage);
      expect(service.update).toHaveBeenCalledWith(keywordId, updateDto);
    });
  });

  describe('deleteBannedKeyword', () => {
    it('should delete banned keyword successfully', async () => {
      const keywordId = 1;

      mockBannedKeywordsService.delete.mockResolvedValue(undefined);

      await controller.deleteBannedKeyword(keywordId);

      expect(service.delete).toHaveBeenCalledWith(keywordId);
    });

    it('should handle deletion errors', async () => {
      const keywordId = 999;
      const errorMessage = 'Banned keyword with ID 999 not found';

      mockBannedKeywordsService.delete.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.deleteBannedKeyword(keywordId)).rejects.toThrow(
        errorMessage,
      );
      expect(service.delete).toHaveBeenCalledWith(keywordId);
    });
  });
});
