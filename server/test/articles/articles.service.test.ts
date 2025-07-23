import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ArticlesService } from '../../src/articles/articles.service';
import { ArticleRepository } from '../../src/database/repositories/article.repository';
import { CategoryRepository } from '../../src/database/repositories/category.repository';
import { BannedKeywordsService } from '../../src/banned-keywords/banned-keywords.service';
import { UserReadingHistoryService } from '../../src/user-reading-history/user-reading-history.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQueryDto,
} from '../../src/articles/dto';
import { Article } from '../../src/database/entities/article.entity';
import { mockArticle, mockArticles } from '../mock-data/article.mock';
import { mockUser, mockAdmin } from '../mock-data/user.mock';
import { mockCategory } from '../mock-data/interactions.mock';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleRepository: ArticleRepository;
  let categoryRepository: CategoryRepository;
  let bannedKeywordsService: BannedKeywordsService;
  let userReadingHistoryService: UserReadingHistoryService;

  const mockArticleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findByIdWithCategories: jest.fn(),
    findByIdWithCategoriesForUser: jest.fn(),
    findAllPaginated: jest.fn(),
    existsByUrl: jest.fn(),
    update: jest.fn(),
    deleteArticle: jest.fn(),
    findUnprocessedArticles: jest.fn(),
    markArticlesAsProcessed: jest.fn(),
  };

  const mockCategoryRepository = {
    findByIds: jest.fn(),
    findById: jest.fn(),
  };

  const mockBannedKeywordsService = {
    validateContent: jest.fn(),
  };

  const mockUserReadingHistoryService = {
    recordAutoReading: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
        {
          provide: BannedKeywordsService,
          useValue: mockBannedKeywordsService,
        },
        {
          provide: UserReadingHistoryService,
          useValue: mockUserReadingHistoryService,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    articleRepository = module.get<ArticleRepository>(ArticleRepository);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
    bannedKeywordsService = module.get<BannedKeywordsService>(
      BannedKeywordsService,
    );
    userReadingHistoryService = module.get<UserReadingHistoryService>(
      UserReadingHistoryService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createArticle', () => {
    const mockCreateDto: CreateArticleDto = {
      title: 'Test Article',
      content: 'Test content',
      author: 'Test Author',
      source: 'Test Source',
      originalUrl: 'https://test.com/article',
      publishedAt: '2024-01-01T00:00:00Z',
      categoryIds: [1],
    };

    it('should create article successfully', async () => {
      const expectedArticle = mockArticle as Article;

      mockArticleRepository.existsByUrl.mockResolvedValue(false);
      mockBannedKeywordsService.validateContent.mockResolvedValue({
        hasBanned: false,
        matchedKeywords: [],
      });
      mockCategoryRepository.findByIds.mockResolvedValue([mockCategory]);
      mockArticleRepository.create.mockReturnValue(expectedArticle);
      mockArticleRepository.save.mockResolvedValue(expectedArticle);
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        expectedArticle,
      );

      const result = await service.createArticle(mockCreateDto);

      expect(articleRepository.existsByUrl).toHaveBeenCalledWith(
        mockCreateDto.originalUrl,
      );
      expect(bannedKeywordsService.validateContent).toHaveBeenCalledWith(
        mockCreateDto.title,
      );
      expect(bannedKeywordsService.validateContent).toHaveBeenCalledWith(
        mockCreateDto.content,
      );
      expect(result).toEqual(expectedArticle);
    });

    it('should throw ConflictException if article URL already exists', async () => {
      mockArticleRepository.existsByUrl.mockResolvedValue(true);

      await expect(service.createArticle(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(articleRepository.existsByUrl).toHaveBeenCalledWith(
        mockCreateDto.originalUrl,
      );
    });

    it('should throw BadRequestException if content has banned keywords', async () => {
      mockArticleRepository.existsByUrl.mockResolvedValue(false);
      mockBannedKeywordsService.validateContent.mockResolvedValue({
        hasBanned: true,
        matchedKeywords: ['spam', 'illegal'],
      });

      await expect(service.createArticle(mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(bannedKeywordsService.validateContent).toHaveBeenCalledWith(
        mockCreateDto.title,
      );
    });

    it('should throw BadRequestException if categories do not exist', async () => {
      mockArticleRepository.existsByUrl.mockResolvedValue(false);
      mockBannedKeywordsService.validateContent.mockResolvedValue({
        hasBanned: false,
        matchedKeywords: [],
      });
      mockCategoryRepository.findByIds.mockResolvedValue([]);

      await expect(service.createArticle(mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(categoryRepository.findByIds).toHaveBeenCalledWith([1]);
    });
  });

  describe('getArticles', () => {
    it('should return paginated articles for regular user', async () => {
      const query: ArticleQueryDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: mockArticles,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      mockArticleRepository.findAllPaginated.mockResolvedValue(expectedResult);

      const result = await service.getArticles(query, mockUser);

      expect(articleRepository.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ includeInactive: false }),
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated articles for admin user', async () => {
      const query: ArticleQueryDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: mockArticles,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      mockArticleRepository.findAllPaginated.mockResolvedValue(expectedResult);

      const result = await service.getArticles(query, mockAdmin);

      expect(articleRepository.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ includeInactive: true }),
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(expectedResult);
    });

    it('should apply search filters', async () => {
      const query: ArticleQueryDto = {
        page: 1,
        limit: 10,
        search: 'technology',
        categoryIds: [1],
        author: 'John Doe',
      };
      const expectedResult = {
        data: mockArticles,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      mockArticleRepository.findAllPaginated.mockResolvedValue(expectedResult);

      const result = await service.getArticles(query, mockUser);

      expect(articleRepository.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'technology',
          categoryIds: [1],
          author: 'John Doe',
          includeInactive: false,
        }),
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getArticleById', () => {
    it('should return article by ID for regular user', async () => {
      const articleId = 1;
      const expectedArticle = mockArticle as Article;

      mockArticleRepository.findByIdWithCategoriesForUser.mockResolvedValue(
        expectedArticle,
      );
      mockUserReadingHistoryService.recordAutoReading.mockResolvedValue(
        undefined,
      );

      const result = await service.getArticleById(articleId, mockUser);

      expect(
        articleRepository.findByIdWithCategoriesForUser,
      ).toHaveBeenCalledWith(articleId);
      expect(userReadingHistoryService.recordAutoReading).toHaveBeenCalledWith(
        mockUser.id,
        articleId,
      );
      expect(result).toEqual(expectedArticle);
    });

    it('should return article by ID for admin user', async () => {
      const articleId = 1;
      const expectedArticle = mockArticle as Article;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        expectedArticle,
      );
      mockUserReadingHistoryService.recordAutoReading.mockResolvedValue(
        undefined,
      );

      const result = await service.getArticleById(articleId, mockAdmin);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        articleId,
      );
      expect(userReadingHistoryService.recordAutoReading).toHaveBeenCalledWith(
        mockAdmin.id,
        articleId,
      );
      expect(result).toEqual(expectedArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      const articleId = 999;

      mockArticleRepository.findByIdWithCategoriesForUser.mockResolvedValue(
        null,
      );

      await expect(service.getArticleById(articleId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        articleRepository.findByIdWithCategoriesForUser,
      ).toHaveBeenCalledWith(articleId);
    });

    it('should handle reading history creation failure gracefully', async () => {
      const articleId = 1;
      const expectedArticle = mockArticle as Article;

      mockArticleRepository.findByIdWithCategoriesForUser.mockResolvedValue(
        expectedArticle,
      );
      mockUserReadingHistoryService.recordAutoReading.mockRejectedValue(
        new Error('History creation failed'),
      );

      const result = await service.getArticleById(articleId, mockUser);

      expect(result).toEqual(expectedArticle);
      expect(userReadingHistoryService.recordAutoReading).toHaveBeenCalledWith(
        mockUser.id,
        articleId,
      );
    });
  });

  describe('updateArticle', () => {
    const mockUpdateDto: UpdateArticleDto = {
      title: 'Updated Title',
      content: 'Updated content',
      categoryIds: [1],
    };

    it('should update article successfully', async () => {
      const articleId = 1;
      const existingArticle = mockArticle as Article;
      const updatedArticle = {
        ...existingArticle,
        ...mockUpdateDto,
      } as Article;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        existingArticle,
      );
      mockCategoryRepository.findByIds.mockResolvedValue([mockCategory]);
      mockArticleRepository.update.mockResolvedValue(undefined);
      mockArticleRepository.save.mockResolvedValue(updatedArticle);
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        updatedArticle,
      );

      const result = await service.updateArticle(articleId, mockUpdateDto);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        articleId,
      );
      expect(categoryRepository.findByIds).toHaveBeenCalledWith([1]);
      expect(articleRepository.update).toHaveBeenCalledWith(
        articleId,
        expect.objectContaining({
          title: 'Updated Title',
          content: 'Updated content',
        }),
      );
      expect(result).toEqual(updatedArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      const articleId = 999;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      await expect(
        service.updateArticle(articleId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        articleId,
      );
    });

    it('should throw ConflictException if URL already exists', async () => {
      const articleId = 1;
      const existingArticle = mockArticle as Article;
      const updateDto = {
        ...mockUpdateDto,
        originalUrl: 'https://existing.com',
      };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        existingArticle,
      );
      mockArticleRepository.existsByUrl.mockResolvedValue(true);

      await expect(service.updateArticle(articleId, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(articleRepository.existsByUrl).toHaveBeenCalledWith(
        updateDto.originalUrl,
      );
    });
  });

  describe('deleteArticle', () => {
    it('should delete article successfully', async () => {
      const articleId = 1;
      const existingArticle = mockArticle as Article;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        existingArticle,
      );
      mockArticleRepository.deleteArticle.mockResolvedValue(true);

      await service.deleteArticle(articleId);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        articleId,
      );
      expect(articleRepository.deleteArticle).toHaveBeenCalledWith(articleId);
    });

    it('should throw NotFoundException if article not found', async () => {
      const articleId = 999;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      await expect(service.deleteArticle(articleId)).rejects.toThrow(
        NotFoundException,
      );
      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        articleId,
      );
    });

    it('should throw BadRequestException if deletion fails', async () => {
      const articleId = 1;
      const existingArticle = mockArticle as Article;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        existingArticle,
      );
      mockArticleRepository.deleteArticle.mockResolvedValue(false);

      await expect(service.deleteArticle(articleId)).rejects.toThrow(
        BadRequestException,
      );
      expect(articleRepository.deleteArticle).toHaveBeenCalledWith(articleId);
    });
  });

  describe('getArticlesByCategory', () => {
    it('should return articles by category', async () => {
      const categoryId = 1;
      const page = 1;
      const limit = 10;
      const expectedResult = {
        data: mockArticles,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockArticleRepository.findAllPaginated.mockResolvedValue(expectedResult);

      const result = await service.getArticlesByCategory(
        categoryId,
        page,
        limit,
        mockUser,
      );

      expect(categoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(articleRepository.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryIds: [categoryId],
          includeInactive: false,
        }),
        { page, limit },
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if category not found', async () => {
      const categoryId = 999;

      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        service.getArticlesByCategory(categoryId, 1, 10, mockUser),
      ).rejects.toThrow(NotFoundException);
      expect(categoryRepository.findById).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('searchByQuery', () => {
    it('should search articles by query', async () => {
      const searchTerm = 'technology';
      const page = 1;
      const limit = 10;
      const expectedResult = {
        data: mockArticles,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      mockArticleRepository.findAllPaginated.mockResolvedValue(expectedResult);

      const result = await service.searchByQuery(
        searchTerm,
        page,
        limit,
        mockUser,
      );

      expect(articleRepository.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ search: searchTerm, includeInactive: false }),
        { page, limit },
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException for short search term', async () => {
      const searchTerm = 'a';

      await expect(
        service.searchByQuery(searchTerm, 1, 10, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty search term', async () => {
      const searchTerm = '';

      await expect(
        service.searchByQuery(searchTerm, 1, 10, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateContentForBannedKeywords', () => {
    it('should return validation result for article content', async () => {
      const article = mockArticle as Article;
      const expectedResult = {
        hasBanned: false,
        matchedKeywords: [],
      };

      mockBannedKeywordsService.validateContent.mockResolvedValue(
        expectedResult,
      );

      const result = await service.validateContentForBannedKeywords(article);

      expect(bannedKeywordsService.validateContent).toHaveBeenCalledWith(
        article.title,
      );
      expect(bannedKeywordsService.validateContent).toHaveBeenCalledWith(
        article.content,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return banned keywords if found', async () => {
      const article = mockArticle as Article;
      const titleResult = { hasBanned: true, matchedKeywords: ['spam'] };
      const contentResult = { hasBanned: false, matchedKeywords: [] };

      mockBannedKeywordsService.validateContent
        .mockResolvedValueOnce(titleResult)
        .mockResolvedValueOnce(contentResult);

      const result = await service.validateContentForBannedKeywords(article);

      expect(result).toEqual({
        hasBanned: true,
        matchedKeywords: ['spam'],
      });
    });
  });

  describe('hideArticle', () => {
    it('should hide article successfully', async () => {
      const articleId = 1;
      const existingArticle = mockArticle as Article;
      const hiddenArticle = { ...existingArticle, isActive: false } as Article;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        existingArticle,
      );
      mockArticleRepository.update.mockResolvedValue(undefined);
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        hiddenArticle,
      );

      const result = await service.hideArticle(articleId);

      expect(articleRepository.update).toHaveBeenCalledWith(articleId, {
        isActive: false,
      });
      expect(result).toEqual(hiddenArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      const articleId = 999;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      await expect(service.hideArticle(articleId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('showArticle', () => {
    it('should show article successfully', async () => {
      const articleId = 1;
      const existingArticle = mockArticle as Article;
      const shownArticle = { ...existingArticle, isActive: true } as Article;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        existingArticle,
      );
      mockArticleRepository.update.mockResolvedValue(undefined);
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        shownArticle,
      );

      const result = await service.showArticle(articleId);

      expect(articleRepository.update).toHaveBeenCalledWith(articleId, {
        isActive: true,
      });
      expect(result).toEqual(shownArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      const articleId = 999;

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      await expect(service.showArticle(articleId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUnprocessedArticles', () => {
    it('should return unprocessed articles', async () => {
      const unprocessedArticles = [mockArticle];

      mockArticleRepository.findUnprocessedArticles.mockResolvedValue(
        unprocessedArticles,
      );

      const result = await service.getUnprocessedArticles();

      expect(articleRepository.findUnprocessedArticles).toHaveBeenCalled();
      expect(result).toEqual(unprocessedArticles);
    });
  });

  describe('markArticlesAsProcessed', () => {
    it('should mark articles as processed', async () => {
      const articleIds = [1, 2, 3];

      mockArticleRepository.markArticlesAsProcessed.mockResolvedValue(
        undefined,
      );

      await service.markArticlesAsProcessed(articleIds);

      expect(articleRepository.markArticlesAsProcessed).toHaveBeenCalledWith(
        articleIds,
      );
    });
  });
});
