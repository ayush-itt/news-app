import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { BannedKeywordsService } from '../../src/banned-keywords/banned-keywords.service';
import { BannedKeywordRepository } from '../../src/database/repositories/banned-keyword.repository';
import {
  CreateBannedKeywordDto,
  UpdateBannedKeywordDto,
  GetBannedKeywordsQueryDto,
} from '../../src/banned-keywords/dto';
import { BannedKeyword } from '../../src/database/entities/banned-keyword.entity';

describe('BannedKeywordsService', () => {
  let service: BannedKeywordsService;
  let repository: BannedKeywordRepository;

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

  const mockBannedKeywords: BannedKeyword[] = [
    mockBannedKeyword,
    {
      id: 2,
      keyword: 'illegal',
      description: 'Illegal content',
      isActive: false,
      isCaseSensitive: true,
      isRegex: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockBannedKeywordRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByKeyword: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggleActive: jest.fn(),
    findAllActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannedKeywordsService,
        {
          provide: BannedKeywordRepository,
          useValue: mockBannedKeywordRepository,
        },
      ],
    }).compile();

    service = module.get<BannedKeywordsService>(BannedKeywordsService);
    repository = module.get<BannedKeywordRepository>(BannedKeywordRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create banned keyword successfully', async () => {
      const createDto: CreateBannedKeywordDto = {
        keyword: 'spam',
        description: 'Spam content',
        isCaseSensitive: false,
        isRegex: false,
      };

      mockBannedKeywordRepository.findByKeyword.mockResolvedValue(null);
      mockBannedKeywordRepository.create.mockResolvedValue(mockBannedKeyword);

      const result = await service.create(createDto);

      expect(repository.findByKeyword).toHaveBeenCalledWith(createDto.keyword);
      expect(repository.create).toHaveBeenCalledWith({
        keyword: createDto.keyword,
        description: createDto.description,
        isCaseSensitive: false,
        isRegex: false,
        isActive: true,
      });
      expect(result).toEqual(mockBannedKeyword);
    });

    it('should throw ConflictException if keyword already exists', async () => {
      const createDto: CreateBannedKeywordDto = {
        keyword: 'existing',
        description: 'Test',
      };

      mockBannedKeywordRepository.findByKeyword.mockResolvedValue(
        mockBannedKeyword,
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByKeyword).toHaveBeenCalledWith(createDto.keyword);
    });

    it('should throw BadRequestException for invalid regex', async () => {
      const createDto: CreateBannedKeywordDto = {
        keyword: '[invalid',
        description: 'Test',
        isRegex: true,
      };

      mockBannedKeywordRepository.findByKeyword.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByKeyword).toHaveBeenCalledWith(createDto.keyword);
    });

    it('should create regex keyword with valid pattern', async () => {
      const createDto: CreateBannedKeywordDto = {
        keyword: 'spam.*',
        description: 'Spam pattern',
        isRegex: true,
      };

      mockBannedKeywordRepository.findByKeyword.mockResolvedValue(null);
      mockBannedKeywordRepository.create.mockResolvedValue({
        ...mockBannedKeyword,
        keyword: 'spam.*',
        isRegex: true,
      });

      const result = await service.create(createDto);

      expect(repository.findByKeyword).toHaveBeenCalledWith(createDto.keyword);
      expect(repository.create).toHaveBeenCalledWith({
        keyword: createDto.keyword,
        description: createDto.description,
        isCaseSensitive: false,
        isRegex: true,
        isActive: true,
      });
      expect(result.isRegex).toBe(true);
    });
  });

  describe('getList', () => {
    it('should return paginated list of banned keywords', async () => {
      const queryDto: GetBannedKeywordsQueryDto = {
        page: 1,
        limit: 10,
      };

      mockBannedKeywordRepository.findAll.mockResolvedValue(mockBannedKeywords);

      const result = await service.getList(queryDto);

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        keywords: mockBannedKeywords,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by active status', async () => {
      const queryDto: GetBannedKeywordsQueryDto = {
        page: 1,
        limit: 10,
        isActive: true,
      };

      mockBannedKeywordRepository.findAll.mockResolvedValue(mockBannedKeywords);

      const result = await service.getList(queryDto);

      expect(repository.findAll).toHaveBeenCalled();
      expect(result.keywords).toHaveLength(1);
      expect(result.keywords[0].isActive).toBe(true);
    });

    it('should filter by search term', async () => {
      const queryDto: GetBannedKeywordsQueryDto = {
        page: 1,
        limit: 10,
        search: 'spam',
      };

      mockBannedKeywordRepository.findAll.mockResolvedValue(mockBannedKeywords);

      const result = await service.getList(queryDto);

      expect(repository.findAll).toHaveBeenCalled();
      expect(result.keywords).toHaveLength(1);
      expect(result.keywords[0].keyword).toBe('spam');
    });

    it('should handle pagination correctly', async () => {
      const queryDto: GetBannedKeywordsQueryDto = {
        page: 2,
        limit: 1,
      };

      mockBannedKeywordRepository.findAll.mockResolvedValue(mockBannedKeywords);

      const result = await service.getList(queryDto);

      expect(repository.findAll).toHaveBeenCalled();
      expect(result.keywords).toHaveLength(1);
      expect(result.keywords[0].id).toBe(2);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('getById', () => {
    it('should return banned keyword by ID', async () => {
      const keywordId = 1;

      mockBannedKeywordRepository.findById.mockResolvedValue(mockBannedKeyword);

      const result = await service.getById(keywordId);

      expect(repository.findById).toHaveBeenCalledWith(keywordId);
      expect(result).toEqual(mockBannedKeyword);
    });

    it('should throw NotFoundException if keyword not found', async () => {
      const keywordId = 999;

      mockBannedKeywordRepository.findById.mockResolvedValue(null);

      await expect(service.getById(keywordId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(keywordId);
    });
  });

  describe('update', () => {
    it('should update banned keyword successfully', async () => {
      const keywordId = 1;
      const updateDto: UpdateBannedKeywordDto = {
        description: 'Updated description',
        isActive: false,
      };
      const updatedKeyword = { ...mockBannedKeyword, ...updateDto };

      mockBannedKeywordRepository.findById.mockResolvedValue(mockBannedKeyword);
      mockBannedKeywordRepository.update.mockResolvedValue(updatedKeyword);

      const result = await service.update(keywordId, updateDto);

      expect(repository.findById).toHaveBeenCalledWith(keywordId);
      expect(repository.update).toHaveBeenCalledWith(keywordId, updateDto);
      expect(result).toEqual(updatedKeyword);
    });

    it('should throw ConflictException if new keyword already exists', async () => {
      const keywordId = 1;
      const updateDto: UpdateBannedKeywordDto = {
        keyword: 'existing',
      };

      mockBannedKeywordRepository.findById.mockResolvedValue(mockBannedKeyword);
      mockBannedKeywordRepository.findByKeyword.mockResolvedValue(
        mockBannedKeywords[1],
      );

      await expect(service.update(keywordId, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findById).toHaveBeenCalledWith(keywordId);
      expect(repository.findByKeyword).toHaveBeenCalledWith(updateDto.keyword);
    });

    it('should throw BadRequestException for invalid regex', async () => {
      const keywordId = 1;
      const updateDto: UpdateBannedKeywordDto = {
        keyword: '[invalid',
        isRegex: true,
      };

      mockBannedKeywordRepository.findById.mockResolvedValue(mockBannedKeyword);

      await expect(service.update(keywordId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findById).toHaveBeenCalledWith(keywordId);
    });
  });

  describe('delete', () => {
    it('should delete banned keyword successfully', async () => {
      const keywordId = 1;

      mockBannedKeywordRepository.findById.mockResolvedValue(mockBannedKeyword);
      mockBannedKeywordRepository.delete.mockResolvedValue(true);

      await service.delete(keywordId);

      expect(repository.findById).toHaveBeenCalledWith(keywordId);
      expect(repository.delete).toHaveBeenCalledWith(keywordId);
    });

    it('should throw NotFoundException if keyword not found', async () => {
      const keywordId = 999;

      mockBannedKeywordRepository.findById.mockResolvedValue(null);

      await expect(service.delete(keywordId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(keywordId);
    });

    it('should throw NotFoundException if deletion fails', async () => {
      const keywordId = 1;

      mockBannedKeywordRepository.findById.mockResolvedValue(mockBannedKeyword);
      mockBannedKeywordRepository.delete.mockResolvedValue(false);

      await expect(service.delete(keywordId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).toHaveBeenCalledWith(keywordId);
    });
  });

  describe('toggle', () => {
    it('should toggle banned keyword active status', async () => {
      const keywordId = 1;
      const toggledKeyword = { ...mockBannedKeyword, isActive: false };

      mockBannedKeywordRepository.toggleActive.mockResolvedValue(
        toggledKeyword,
      );

      const result = await service.toggle(keywordId);

      expect(repository.toggleActive).toHaveBeenCalledWith(keywordId);
      expect(result).toEqual(toggledKeyword);
    });

    it('should throw NotFoundException if keyword not found', async () => {
      const keywordId = 999;

      mockBannedKeywordRepository.toggleActive.mockResolvedValue(null);

      await expect(service.toggle(keywordId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.toggleActive).toHaveBeenCalledWith(keywordId);
    });
  });

  describe('getActiveList', () => {
    it('should return active banned keywords', async () => {
      const activeKeywords = [mockBannedKeyword];

      mockBannedKeywordRepository.findAllActive.mockResolvedValue(
        activeKeywords,
      );

      const result = await service.getActiveList();

      expect(repository.findAllActive).toHaveBeenCalled();
      expect(result).toEqual(activeKeywords);
    });
  });

  describe('validateContent', () => {
    it('should detect banned keywords in content', async () => {
      const content = 'This is spam content';
      const activeKeywords = [mockBannedKeyword];

      mockBannedKeywordRepository.findAllActive.mockResolvedValue(
        activeKeywords,
      );

      const result = await service.validateContent(content);

      expect(repository.findAllActive).toHaveBeenCalled();
      expect(result).toEqual({
        hasBanned: true,
        matchedKeywords: ['spam'],
      });
    });

    it('should detect regex patterns in content', async () => {
      const content = 'This is spam123 content';
      const regexKeyword = {
        ...mockBannedKeyword,
        keyword: 'spam\\d+',
        isRegex: true,
      };

      mockBannedKeywordRepository.findAllActive.mockResolvedValue([
        regexKeyword,
      ]);

      const result = await service.validateContent(content);

      expect(repository.findAllActive).toHaveBeenCalled();
      expect(result).toEqual({
        hasBanned: true,
        matchedKeywords: ['spam\\d+'],
      });
    });

    it('should handle case sensitivity correctly', async () => {
      const content = 'This is SPAM content';
      const caseSensitiveKeyword = {
        ...mockBannedKeyword,
        keyword: 'spam',
        isCaseSensitive: true,
      };

      mockBannedKeywordRepository.findAllActive.mockResolvedValue([
        caseSensitiveKeyword,
      ]);

      const result = await service.validateContent(content);

      expect(repository.findAllActive).toHaveBeenCalled();
      expect(result).toEqual({
        hasBanned: false,
        matchedKeywords: [],
      });
    });

    it('should return no matches for clean content', async () => {
      const content = 'This is clean content';
      const activeKeywords = [mockBannedKeyword];

      mockBannedKeywordRepository.findAllActive.mockResolvedValue(
        activeKeywords,
      );

      const result = await service.validateContent(content);

      expect(repository.findAllActive).toHaveBeenCalled();
      expect(result).toEqual({
        hasBanned: false,
        matchedKeywords: [],
      });
    });

    it('should handle invalid regex gracefully', async () => {
      const content = 'This is spam content';
      const invalidRegexKeyword = {
        ...mockBannedKeyword,
        keyword: '[invalid',
        isRegex: true,
      };

      mockBannedKeywordRepository.findAllActive.mockResolvedValue([
        invalidRegexKeyword,
      ]);

      const result = await service.validateContent(content);

      expect(repository.findAllActive).toHaveBeenCalled();
      expect(result).toEqual({
        hasBanned: false,
        matchedKeywords: [],
      });
    });
  });
});
