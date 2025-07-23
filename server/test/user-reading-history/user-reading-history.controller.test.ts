import { Test, TestingModule } from '@nestjs/testing';
import { UserReadingHistoryController } from '../../src/user-reading-history/user-reading-history.controller';
import { UserReadingHistoryService } from '../../src/user-reading-history/user-reading-history.service';
import {
  GetReadingHistoryQueryDto,
  ReadingHistoryListResponseDto,
} from '../../src/user-reading-history/dto';
import { mockUsers, mockArticles } from '../mock-data';

describe('UserReadingHistoryController', () => {
  let controller: UserReadingHistoryController;
  let service: UserReadingHistoryService;

  const mockUser = mockUsers[0];
  const mockArticle = mockArticles[0];

  const mockReadingHistory = {
    id: 1,
    userId: mockUser.id,
    articleId: mockArticle.id,
    createdAt: new Date('2023-01-01'),
    article: {
      id: mockArticle.id,
      title: mockArticle.title,
      source: mockArticle.source,
      publishedAt: mockArticle.publishedAt,
      categories: mockArticle.categories,
    },
  };

  const mockUserReadingHistoryService = {
    getUserReadingHistory: jest.fn(),
    getAllUsersReadingHistory: jest.fn(),
    recordReading: jest.fn(),
    getMostReadArticles: jest.fn(),
    getReadingStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReadingHistoryController],
      providers: [
        {
          provide: UserReadingHistoryService,
          useValue: mockUserReadingHistoryService,
        },
      ],
    }).compile();

    controller = module.get<UserReadingHistoryController>(
      UserReadingHistoryController,
    );
    service = module.get<UserReadingHistoryService>(UserReadingHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReadingHistory', () => {
    it('should return user reading history', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [mockReadingHistory],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      const mockRequest = {
        user: { id: mockUser.id },
      };

      mockUserReadingHistoryService.getUserReadingHistory.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getReadingHistory(queryDto, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(service.getUserReadingHistory).toHaveBeenCalledWith(
        mockUser.id,
        queryDto,
      );
    });

    it('should handle date range filtering', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z',
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [mockReadingHistory],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      const mockRequest = {
        user: { id: mockUser.id },
      };

      mockUserReadingHistoryService.getUserReadingHistory.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getReadingHistory(queryDto, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(service.getUserReadingHistory).toHaveBeenCalledWith(
        mockUser.id,
        queryDto,
      );
    });

    it('should handle empty reading history', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockEmptyResponse: ReadingHistoryListResponseDto = {
        history: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      const mockRequest = {
        user: { id: mockUser.id },
      };

      mockUserReadingHistoryService.getUserReadingHistory.mockResolvedValue(
        mockEmptyResponse,
      );

      const result = await controller.getReadingHistory(queryDto, mockRequest);

      expect(result).toEqual(mockEmptyResponse);
      expect(service.getUserReadingHistory).toHaveBeenCalledWith(
        mockUser.id,
        queryDto,
      );
    });

    it('should use default pagination when not provided', async () => {
      const queryDto: GetReadingHistoryQueryDto = {};

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [mockReadingHistory],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      const mockRequest = {
        user: { id: mockUser.id },
      };

      mockUserReadingHistoryService.getUserReadingHistory.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getReadingHistory(queryDto, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(service.getUserReadingHistory).toHaveBeenCalledWith(
        mockUser.id,
        queryDto,
      );
    });
  });

  describe('getAllUsersReadingHistory', () => {
    it('should return reading history for all users (admin)', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [mockReadingHistory],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockUserReadingHistoryService.getAllUsersReadingHistory.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getAllUsersReadingHistory(queryDto);

      expect(result).toEqual(mockResponse);
      expect(service.getAllUsersReadingHistory).toHaveBeenCalledWith(queryDto);
    });

    it('should filter by specific user ID', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
        userId: mockUser.id,
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [mockReadingHistory],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockUserReadingHistoryService.getAllUsersReadingHistory.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getAllUsersReadingHistory(queryDto);

      expect(result).toEqual(mockResponse);
      expect(service.getAllUsersReadingHistory).toHaveBeenCalledWith(queryDto);
    });

    it('should handle date range filtering for all users', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z',
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [mockReadingHistory],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockUserReadingHistoryService.getAllUsersReadingHistory.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getAllUsersReadingHistory(queryDto);

      expect(result).toEqual(mockResponse);
      expect(service.getAllUsersReadingHistory).toHaveBeenCalledWith(queryDto);
    });

    it('should handle empty results for all users', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockEmptyResponse: ReadingHistoryListResponseDto = {
        history: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockUserReadingHistoryService.getAllUsersReadingHistory.mockResolvedValue(
        mockEmptyResponse,
      );

      const result = await controller.getAllUsersReadingHistory(queryDto);

      expect(result).toEqual(mockEmptyResponse);
      expect(service.getAllUsersReadingHistory).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('user authentication', () => {
    it('should extract user ID from request', async () => {
      const queryDto: GetReadingHistoryQueryDto = {};
      const mockRequest = {
        user: { id: 123 },
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockUserReadingHistoryService.getUserReadingHistory.mockResolvedValue(
        mockResponse,
      );

      await controller.getReadingHistory(queryDto, mockRequest);

      expect(service.getUserReadingHistory).toHaveBeenCalledWith(123, queryDto);
    });

    it('should handle different user IDs', async () => {
      const queryDto: GetReadingHistoryQueryDto = {};
      const mockRequest = {
        user: { id: 456 },
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockUserReadingHistoryService.getUserReadingHistory.mockResolvedValue(
        mockResponse,
      );

      await controller.getReadingHistory(queryDto, mockRequest);

      expect(service.getUserReadingHistory).toHaveBeenCalledWith(456, queryDto);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const queryDto: GetReadingHistoryQueryDto = {};
      const mockRequest = {
        user: { id: mockUser.id },
      };
      const error = new Error('Service error');

      mockUserReadingHistoryService.getUserReadingHistory.mockRejectedValue(
        error,
      );

      await expect(
        controller.getReadingHistory(queryDto, mockRequest),
      ).rejects.toThrow('Service error');
    });

    it('should handle database connection errors', async () => {
      const queryDto: GetReadingHistoryQueryDto = {};
      const dbError = new Error('Database connection failed');

      mockUserReadingHistoryService.getAllUsersReadingHistory.mockRejectedValue(
        dbError,
      );

      await expect(
        controller.getAllUsersReadingHistory(queryDto),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle validation errors', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        startDate: '2023-12-31T00:00:00Z',
        endDate: '2023-01-01T00:00:00Z', // Invalid date range
      };
      const mockRequest = {
        user: { id: mockUser.id },
      };
      const validationError = new Error('Start date must be before end date');

      mockUserReadingHistoryService.getUserReadingHistory.mockRejectedValue(
        validationError,
      );

      await expect(
        controller.getReadingHistory(queryDto, mockRequest),
      ).rejects.toThrow('Start date must be before end date');
    });
  });

  describe('pagination', () => {
    it('should handle different page sizes', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 2,
        limit: 10,
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: [mockReadingHistory],
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      };

      const mockRequest = {
        user: { id: mockUser.id },
      };

      mockUserReadingHistoryService.getUserReadingHistory.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getReadingHistory(queryDto, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
    });

    it('should handle large datasets', async () => {
      const queryDto: GetReadingHistoryQueryDto = {
        page: 1,
        limit: 100,
      };

      const mockResponse: ReadingHistoryListResponseDto = {
        history: Array(100).fill(mockReadingHistory),
        total: 1000,
        page: 1,
        limit: 100,
        totalPages: 10,
      };

      const mockRequest = {
        user: { id: mockUser.id },
      };

      mockUserReadingHistoryService.getUserReadingHistory.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getReadingHistory(queryDto, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(result.history).toHaveLength(100);
      expect(result.total).toBe(1000);
      expect(result.totalPages).toBe(10);
    });
  });
});
