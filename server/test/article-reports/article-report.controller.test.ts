import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import {
  ArticleReportController,
  AdminReportController,
} from '../../src/article-reports/article-report.controller';
import { ArticleReportService } from '../../src/article-reports/article-report.service';
import {
  CreateArticleReportDto,
  GetReportsQueryDto,
} from '../../src/article-reports/dto';
import { mockUser, mockAdmin } from '../mock-data/user.mock';
import { mockCreateArticleReportDto } from '../mock-data/dto.mock';

describe('ArticleReportController', () => {
  let controller: ArticleReportController;
  let service: ArticleReportService;

  const mockArticleReportService = {
    createReport: jest.fn(),
    countReportsByArticleId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleReportController],
      providers: [
        {
          provide: ArticleReportService,
          useValue: mockArticleReportService,
        },
      ],
    }).compile();

    controller = module.get<ArticleReportController>(ArticleReportController);
    service = module.get<ArticleReportService>(ArticleReportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reportArticle', () => {
    it('should report article successfully', async () => {
      const articleId = 1;
      const createReportDto: CreateArticleReportDto =
        mockCreateArticleReportDto;
      const mockRequest = { user: mockUser };
      const mockReport = {
        id: 1,
        articleId: 1,
        userId: 1,
        reason: 'spam',
        createdAt: new Date(),
      };

      mockArticleReportService.createReport.mockResolvedValue(mockReport);

      const result = await controller.reportArticle(
        articleId,
        mockRequest,
        createReportDto,
      );

      expect(service.createReport).toHaveBeenCalledWith(
        articleId,
        mockUser.id,
        createReportDto,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Article reported successfully',
        data: {
          id: mockReport.id,
          articleId: mockReport.articleId,
          reason: mockReport.reason,
          createdAt: mockReport.createdAt,
        },
      });
    });

    it('should handle report creation errors', async () => {
      const articleId = 1;
      const createReportDto: CreateArticleReportDto =
        mockCreateArticleReportDto;
      const mockRequest = { user: mockUser };
      const errorMessage = 'You have already reported this article';

      mockArticleReportService.createReport.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.reportArticle(articleId, mockRequest, createReportDto),
      ).rejects.toThrow(errorMessage);
      expect(service.createReport).toHaveBeenCalledWith(
        articleId,
        mockUser.id,
        createReportDto,
      );
    });
  });

  describe('getArticleReportCount', () => {
    it('should return article report count', async () => {
      const articleId = 1;
      const reportCount = 5;

      mockArticleReportService.countReportsByArticleId.mockResolvedValue(
        reportCount,
      );

      const result = await controller.getArticleReportCount(articleId);

      expect(service.countReportsByArticleId).toHaveBeenCalledWith(articleId);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        data: {
          articleId,
          reportCount,
        },
      });
    });

    it('should handle errors when fetching report count', async () => {
      const articleId = 1;
      const errorMessage = 'Article not found';

      mockArticleReportService.countReportsByArticleId.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.getArticleReportCount(articleId)).rejects.toThrow(
        errorMessage,
      );
      expect(service.countReportsByArticleId).toHaveBeenCalledWith(articleId);
    });
  });
});

describe('AdminReportController', () => {
  let controller: AdminReportController;
  let service: ArticleReportService;

  const mockArticleReportService = {
    getAllReportsWithPagination: jest.fn(),
    findReportsByArticleId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminReportController],
      providers: [
        {
          provide: ArticleReportService,
          useValue: mockArticleReportService,
        },
      ],
    }).compile();

    controller = module.get<AdminReportController>(AdminReportController);
    service = module.get<ArticleReportService>(ArticleReportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllArticleReports', () => {
    it('should return paginated reports', async () => {
      const query: GetReportsQueryDto = {
        page: 1,
        limit: 10,
        status: 'all',
      };
      const mockResult = {
        reports: [
          {
            id: 1,
            articleId: 1,
            userId: 1,
            reason: 'spam',
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        summary: {
          totalReports: 1,
          pendingReports: 0,
          resolvedReports: 1,
        },
      };

      mockArticleReportService.getAllReportsWithPagination.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getAllArticleReports(query);

      expect(service.getAllReportsWithPagination).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Reports retrieved successfully',
        data: mockResult,
      });
    });

    it('should handle errors when fetching reports', async () => {
      const query: GetReportsQueryDto = {
        page: 1,
        limit: 10,
        status: 'all',
      };
      const errorMessage = 'Database error';

      mockArticleReportService.getAllReportsWithPagination.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.getAllArticleReports(query)).rejects.toThrow(
        errorMessage,
      );
      expect(service.getAllReportsWithPagination).toHaveBeenCalledWith(query);
    });
  });
});
