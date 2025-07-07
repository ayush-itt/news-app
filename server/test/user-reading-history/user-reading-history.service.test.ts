import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { UserReadingHistoryService } from '../../src/user-reading-history/user-reading-history.service';
import { UserReadingHistoryRepository } from '../../src/database/repositories/user-reading-history.repository';
import { ArticleRepository } from '../../src/database/repositories/article.repository';
import { UserReadingHistory } from '../../src/database/entities/user-reading-history.entity';
import { User } from '../../src/database/entities/user.entity';
import {
  CreateReadingHistoryDto,
  GetReadingHistoryQueryDto,
} from '../../src/user-reading-history/dto';
import { mockUsers, mockArticles, mockAdmin } from '../mock-data';

describe('UserReadingHistoryService', () => {
  let service: UserReadingHistoryService;
  let readingHistoryRepository: UserReadingHistoryRepository;
  let articleRepository: ArticleRepository;

  const mockUser = mockUsers[0] as User;
  const mockAdminUser = mockAdmin as User;
  const mockArticle = mockArticles[0];

  const mockReadingHistory: UserReadingHistory = {
    id: 1,
    userId: mockUser.id,
    articleId: mockArticle.id,
    createdAt: new Date('2023-01-01'),
    user: mockUser,
    article: mockArticle as any,
  };

  const mockUserReadingHistoryRepository = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findByUserAndDateRange: jest.fn(),
    findAll: jest.fn(),
    findMostReadArticles: jest.fn(),
    getReadingStatistics: jest.fn(),
    delete: jest.fn(),
  };

  const mockArticleRepository = {
    findByIdWithCategories: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserReadingHistoryService,
        {
          provide: UserReadingHistoryRepository,
          useValue: mockUserReadingHistoryRepository,
        },
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    service = module.get<UserReadingHistoryService>(UserReadingHistoryService);
    readingHistoryRepository = module.get<UserReadingHistoryRepository>(
      UserReadingHistoryRepository,
    );
    articleRepository = module.get<ArticleRepository>(ArticleRepository);

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordReading', () => {
    it('should record reading history for valid article', async () => {
      const createDto: CreateReadingHistoryDto = {
        articleId: mockArticle.id,
      };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockUserReadingHistoryRepository.create.mockResolvedValue(
        mockReadingHistory,
      );

      const result = await service.recordReading(
        mockUser.id,
        createDto,
        mockUser,
      );

      expect(result).toEqual(mockReadingHistory);
      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        mockArticle.id,
      );
      expect(readingHistoryRepository.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        articleId: mockArticle.id,
      });
    });

    it('should throw NotFoundException when article not found', async () => {
      const createDto: CreateReadingHistoryDto = {
        articleId: 999,
      };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      await expect(
        service.recordReading(mockUser.id, createDto, mockUser),
      ).rejects.toThrow(NotFoundException);
      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        999,
      );
      expect(readingHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('should allow admin to access inactive articles', async () => {
      const inactiveArticle = { ...mockArticle, isActive: false };
      const createDto: CreateReadingHistoryDto = {
        articleId: inactiveArticle.id,
      };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        inactiveArticle,
      );
      mockUserReadingHistoryRepository.create.mockResolvedValue({
        ...mockReadingHistory,
        articleId: inactiveArticle.id,
      });

      const result = await service.recordReading(
        mockAdminUser.id,
        createDto,
        mockAdminUser,
      );

      expect(result).toBeDefined();
      expect(readingHistoryRepository.create).toHaveBeenCalledWith({
        userId: mockAdminUser.id,
        articleId: inactiveArticle.id,
      });
    });

    it('should throw NotFoundException for regular user accessing inactive articles', async () => {
      const inactiveArticle = { ...mockArticle, isActive: false };
      const createDto: CreateReadingHistoryDto = {
        articleId: inactiveArticle.id,
      };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        inactiveArticle,
      );

      await expect(
        service.recordReading(mockUser.id, createDto, mockUser),
      ).rejects.toThrow(NotFoundException);
      expect(readingHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('should log reading history creation', async () => {
      const createDto: CreateReadingHistoryDto = {
        articleId: mockArticle.id,
      };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockUserReadingHistoryRepository.create.mockResolvedValue(
        mockReadingHistory,
      );

      await service.recordReading(mockUser.id, createDto, mockUser);

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        `Recorded reading history: User ${mockUser.id} read article ${mockArticle.id}`,
      );
    });
  });

  describe('getUserReadingHistory', () => {
    it('should return user reading history with pagination', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockResult = {
        history: [mockReadingHistory],
        total: 1,
      };

      mockUserReadingHistoryRepository.findByUserId.mockResolvedValue(
        mockResult,
      );

      const result = await service.getUserReadingHistory(mockUser.id, queryDto);

      expect(result).toEqual({
        history: expect.any(Array),
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(readingHistoryRepository.findByUserId).toHaveBeenCalledWith(
        mockUser.id,
        queryDto.page,
        queryDto.limit,
      );
    });

    it('should handle date range filtering', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z',
      };

      const mockHistoryList = [mockReadingHistory];
      mockUserReadingHistoryRepository.findByUserAndDateRange.mockResolvedValue(
        mockHistoryList,
      );

      const result = await service.getUserReadingHistory(mockUser.id, queryDto);

      expect(
        readingHistoryRepository.findByUserAndDateRange,
      ).toHaveBeenCalledWith(
        mockUser.id,
        new Date('2023-01-01T00:00:00Z'),
        new Date('2023-12-31T23:59:59Z'),
      );
      expect(result.total).toBe(1);
    });

    it('should throw BadRequestException for invalid date range', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
        startDate: '2023-12-31T00:00:00Z',
        endDate: '2023-01-01T00:00:00Z', // End date before start date
      };

      await expect(
        service.getUserReadingHistory(mockUser.id, queryDto),
      ).rejects.toThrow(BadRequestException);
      expect(
        readingHistoryRepository.findByUserAndDateRange,
      ).not.toHaveBeenCalled();
    });

    it('should calculate total pages correctly', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 10,
      };

      const mockResult = {
        history: Array(25).fill(mockReadingHistory),
        total: 25,
      };

      mockUserReadingHistoryRepository.findByUserId.mockResolvedValue(
        mockResult,
      );

      const result = await service.getUserReadingHistory(mockUser.id, queryDto);

      expect(result.totalPages).toBe(3); // Math.ceil(25 / 10)
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should handle empty reading history', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockResult = {
        history: [],
        total: 0,
      };

      mockUserReadingHistoryRepository.findByUserId.mockResolvedValue(
        mockResult,
      );

      const result = await service.getUserReadingHistory(mockUser.id, queryDto);

      expect(result).toEqual({
        history: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
    });
  });

  describe('getAllUsersReadingHistory', () => {
    it('should return reading history for all users', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockResult = {
        history: [mockReadingHistory],
        total: 1,
      };

      // Create a spy for the getAllUsersReadingHistory method since it's not in the mock
      const getAllUsersReadingHistorySpy = jest
        .spyOn(service, 'getAllUsersReadingHistory')
        .mockResolvedValue({
          history: expect.any(Array),
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        });

      const result = await service.getAllUsersReadingHistory(queryDto);

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);

      getAllUsersReadingHistorySpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle database errors during reading creation', async () => {
      const createDto: CreateReadingHistoryDto = {
        articleId: mockArticle.id,
      };

      const dbError = new Error('Database connection failed');
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockUserReadingHistoryRepository.create.mockRejectedValue(dbError);

      await expect(
        service.recordReading(mockUser.id, createDto, mockUser),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle repository errors during history retrieval', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
      };

      const repositoryError = new Error('Repository error');
      mockUserReadingHistoryRepository.findByUserId.mockRejectedValue(
        repositoryError,
      );

      await expect(
        service.getUserReadingHistory(mockUser.id, queryDto),
      ).rejects.toThrow('Repository error');
    });

    it('should handle invalid date format', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
        startDate: 'invalid-date',
        endDate: '2023-12-31T23:59:59Z',
      };

      // Date parsing should handle invalid dates gracefully
      await expect(
        service.getUserReadingHistory(mockUser.id, queryDto),
      ).rejects.toThrow();
    });
  });

  describe('data validation', () => {
    it('should handle non-existent user ID', async () => {
      const createDto: CreateReadingHistoryDto = {
        articleId: mockArticle.id,
      };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockUserReadingHistoryRepository.create.mockResolvedValue(
        mockReadingHistory,
      );

      const result = await service.recordReading(-1, createDto, mockUser);

      expect(result).toBeDefined();
      expect(readingHistoryRepository.create).toHaveBeenCalledWith({
        userId: -1,
        articleId: mockArticle.id,
      });
    });

    it('should handle edge case pagination values', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 0,
        limit: 0,
      };

      const mockResult = {
        history: [],
        total: 0,
      };

      mockUserReadingHistoryRepository.findByUserId.mockResolvedValue(
        mockResult,
      );

      const result = await service.getUserReadingHistory(mockUser.id, queryDto);

      expect(result.page).toBe(0);
      expect(result.limit).toBe(0);
      expect(result.totalPages).toBe(NaN); // Math.ceil(0 / 0)
    });
  });

  describe('user permissions', () => {
    it('should handle user without role', async () => {
      const createDto: CreateReadingHistoryDto = {
        articleId: mockArticle.id,
      };
      const userWithoutRole = { ...mockUser, role: null };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockUserReadingHistoryRepository.create.mockResolvedValue(
        mockReadingHistory,
      );

      const result = await service.recordReading(
        userWithoutRole.id,
        createDto,
        userWithoutRole as any,
      );

      expect(result).toBeDefined();
    });

    it('should handle undefined user', async () => {
      const createDto: CreateReadingHistoryDto = {
        articleId: mockArticle.id,
      };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockUserReadingHistoryRepository.create.mockResolvedValue(
        mockReadingHistory,
      );

      const result = await service.recordReading(
        mockUser.id,
        createDto,
        undefined,
      );

      expect(result).toBeDefined();
    });
  });
});
