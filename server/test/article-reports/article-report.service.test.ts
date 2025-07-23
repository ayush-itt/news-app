import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ArticleReportService } from '../../src/article-reports/article-report.service';
import { ArticleReportRepository } from '../../src/database/repositories/article-report.repository';
import { ArticlesService } from '../../src/articles/articles.service';
import {
  CreateArticleReportDto,
  GetReportsQueryDto,
} from '../../src/article-reports/dto';
import { ArticleReport } from '../../src/database/entities/article-report.entity';
import { mockArticle } from '../mock-data/article.mock';
import { mockUser } from '../mock-data/user.mock';
import { mockCreateArticleReportDto } from '../mock-data/dto.mock';

describe('ArticleReportService', () => {
  let service: ArticleReportService;
  let articleReportRepository: ArticleReportRepository;
  let articlesService: ArticlesService;

  const mockArticleReportRepository = {
    createReport: jest.fn(),
    existsByUserAndArticle: jest.fn(),
    countByArticleId: jest.fn(),
    findAllWithPagination: jest.fn(),
    findByArticleId: jest.fn(),
    findByUserId: jest.fn(),
  };

  const mockArticlesService = {
    getArticleById: jest.fn(),
    hideArticle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleReportService,
        {
          provide: ArticleReportRepository,
          useValue: mockArticleReportRepository,
        },
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    }).compile();

    service = module.get<ArticleReportService>(ArticleReportService);
    articleReportRepository = module.get<ArticleReportRepository>(
      ArticleReportRepository,
    );
    articlesService = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReport', () => {
    it('should create report successfully', async () => {
      const articleId = 1;
      const userId = 1;
      const createReportDto: CreateArticleReportDto =
        mockCreateArticleReportDto;
      const mockReport = {
        id: 1,
        articleId: 1,
        userId: 1,
        reason: 'spam',
        createdAt: new Date(),
      } as ArticleReport;

      mockArticlesService.getArticleById.mockResolvedValue(mockArticle);
      mockArticleReportRepository.existsByUserAndArticle.mockResolvedValue(
        false,
      );
      mockArticleReportRepository.createReport.mockResolvedValue(mockReport);
      mockArticleReportRepository.countByArticleId.mockResolvedValue(1);

      const result = await service.createReport(
        articleId,
        userId,
        createReportDto,
      );

      expect(articlesService.getArticleById).toHaveBeenCalledWith(
        articleId,
        expect.objectContaining({ role: { name: 'user' }, id: userId }),
      );
      expect(
        articleReportRepository.existsByUserAndArticle,
      ).toHaveBeenCalledWith(userId, articleId);
      expect(articleReportRepository.createReport).toHaveBeenCalledWith(
        userId,
        articleId,
        createReportDto.reason,
      );
      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException if article not found', async () => {
      const articleId = 999;
      const userId = 1;
      const createReportDto: CreateArticleReportDto =
        mockCreateArticleReportDto;

      mockArticlesService.getArticleById.mockResolvedValue(null);

      await expect(
        service.createReport(articleId, userId, createReportDto),
      ).rejects.toThrow(NotFoundException);
      expect(articlesService.getArticleById).toHaveBeenCalledWith(
        articleId,
        expect.objectContaining({ role: { name: 'user' }, id: userId }),
      );
    });

    it('should throw ConflictException if user already reported article', async () => {
      const articleId = 1;
      const userId = 1;
      const createReportDto: CreateArticleReportDto =
        mockCreateArticleReportDto;

      mockArticlesService.getArticleById.mockResolvedValue(mockArticle);
      mockArticleReportRepository.existsByUserAndArticle.mockResolvedValue(
        true,
      );

      await expect(
        service.createReport(articleId, userId, createReportDto),
      ).rejects.toThrow(ConflictException);
      expect(
        articleReportRepository.existsByUserAndArticle,
      ).toHaveBeenCalledWith(userId, articleId);
    });

    it('should auto-hide article when report threshold is reached', async () => {
      const articleId = 1;
      const userId = 1;
      const createReportDto: CreateArticleReportDto =
        mockCreateArticleReportDto;
      const mockReport = {
        id: 1,
        articleId: 1,
        userId: 1,
        reason: 'spam',
        createdAt: new Date(),
      } as ArticleReport;

      mockArticlesService.getArticleById.mockResolvedValue(mockArticle);
      mockArticleReportRepository.existsByUserAndArticle.mockResolvedValue(
        false,
      );
      mockArticleReportRepository.createReport.mockResolvedValue(mockReport);
      mockArticleReportRepository.countByArticleId.mockResolvedValue(5); // Assuming threshold is 5
      mockArticlesService.hideArticle.mockResolvedValue(undefined);

      const result = await service.createReport(
        articleId,
        userId,
        createReportDto,
      );

      expect(articleReportRepository.countByArticleId).toHaveBeenCalledWith(
        articleId,
      );
      expect(articlesService.hideArticle).toHaveBeenCalledWith(articleId);
      expect(result).toEqual(mockReport);
    });
  });

  describe('getAllReportsWithPagination', () => {
    it('should return paginated reports with summary', async () => {
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
      };

      mockArticleReportRepository.findAllWithPagination.mockResolvedValue(
        mockResult,
      );

      const result = await service.getAllReportsWithPagination(query);

      expect(
        articleReportRepository.findAllWithPagination,
      ).toHaveBeenCalledWith(query.page, query.limit, query.status);
      expect(result).toEqual({
        ...mockResult,
        summary: {
          totalReports: mockResult.total,
          pendingReports: 0,
          resolvedReports: 0,
        },
      });
    });

    it('should handle errors when fetching reports', async () => {
      const query: GetReportsQueryDto = {
        page: 1,
        limit: 10,
        status: 'all',
      };
      const errorMessage = 'Database error';

      mockArticleReportRepository.findAllWithPagination.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.getAllReportsWithPagination(query)).rejects.toThrow(
        errorMessage,
      );
      expect(
        articleReportRepository.findAllWithPagination,
      ).toHaveBeenCalledWith(query.page, query.limit, query.status);
    });
  });

  describe('findReportsByArticleId', () => {
    it('should return reports for specific article', async () => {
      const articleId = 1;
      const mockReports = [
        {
          id: 1,
          articleId: 1,
          userId: 1,
          reason: 'spam',
          createdAt: new Date(),
        },
      ];

      mockArticlesService.getArticleById.mockResolvedValue(mockArticle);
      mockArticleReportRepository.findByArticleId.mockResolvedValue(
        mockReports,
      );

      const result = await service.findReportsByArticleId(articleId);

      expect(articlesService.getArticleById).toHaveBeenCalledWith(
        articleId,
        expect.objectContaining({ role: { name: 'admin' }, id: 1 }),
      );
      expect(articleReportRepository.findByArticleId).toHaveBeenCalledWith(
        articleId,
      );
      expect(result).toEqual(mockReports);
    });

    it('should throw NotFoundException if article not found', async () => {
      const articleId = 999;

      mockArticlesService.getArticleById.mockResolvedValue(null);

      await expect(service.findReportsByArticleId(articleId)).rejects.toThrow(
        NotFoundException,
      );
      expect(articlesService.getArticleById).toHaveBeenCalledWith(
        articleId,
        expect.objectContaining({ role: { name: 'admin' }, id: 1 }),
      );
    });
  });

  describe('findReportsByUserId', () => {
    it('should return reports by user ID', async () => {
      const userId = 1;
      const mockReports = [
        {
          id: 1,
          articleId: 1,
          userId: 1,
          reason: 'spam',
          createdAt: new Date(),
        },
      ];

      mockArticleReportRepository.findByUserId.mockResolvedValue(mockReports);

      const result = await service.findReportsByUserId(userId);

      expect(articleReportRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockReports);
    });
  });

  describe('countReportsByArticleId', () => {
    it('should return report count for article', async () => {
      const articleId = 1;
      const reportCount = 5;

      mockArticleReportRepository.countByArticleId.mockResolvedValue(
        reportCount,
      );

      const result = await service.countReportsByArticleId(articleId);

      expect(articleReportRepository.countByArticleId).toHaveBeenCalledWith(
        articleId,
      );
      expect(result).toEqual(reportCount);
    });
  });
});
