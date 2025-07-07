import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from '../../src/articles/articles.controller';
import { ArticlesService } from '../../src/articles/articles.service';
import { ArticleQueryDto } from '../../src/articles/dto';
import { mockArticle, mockArticles } from '../mock-data/article.mock';
import { mockUser } from '../mock-data/user.mock';
import { PAGINATION } from '../../src/common/constants/pagination.constants';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  const mockArticlesService = {
    getArticles: jest.fn(),
    getArticleById: jest.fn(),
    searchByQuery: jest.fn(),
    getArticlesByCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated articles', async () => {
      const query: ArticleQueryDto = {
        page: 1,
        limit: 10,
        search: 'test',
      };
      const mockRequest = { user: mockUser };
      const expectedResult = {
        data: mockArticles,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockArticlesService.getArticles.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query, mockRequest);

      expect(service.getArticles).toHaveBeenCalledWith(query, mockUser);
      expect(result).toBeDefined();
    });

    it('should handle search with default pagination', async () => {
      const query: ArticleQueryDto = {};
      const mockRequest = { user: mockUser };
      const expectedResult = {
        data: mockArticles,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockArticlesService.getArticles.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query, mockRequest);

      expect(service.getArticles).toHaveBeenCalledWith(query, mockUser);
      expect(result).toBeDefined();
    });

    it('should handle errors when fetching articles', async () => {
      const query: ArticleQueryDto = {};
      const mockRequest = { user: mockUser };
      const errorMessage = 'Failed to fetch articles';

      mockArticlesService.getArticles.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.findAll(query, mockRequest)).rejects.toThrow(
        errorMessage,
      );
      expect(service.getArticles).toHaveBeenCalledWith(query, mockUser);
    });
  });

  describe('search', () => {
    it('should search articles by query term', async () => {
      const searchTerm = 'technology';
      const page = 1;
      const limit = 10;
      const mockRequest = { user: mockUser };
      const expectedResult = {
        data: mockArticles,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockArticlesService.searchByQuery.mockResolvedValue(expectedResult);

      const result = await controller.search(
        searchTerm,
        page,
        limit,
        mockRequest,
      );

      expect(service.searchByQuery).toHaveBeenCalledWith(
        searchTerm,
        page,
        limit,
        mockUser,
      );
      expect(result).toBeDefined();
    });

    it('should use default pagination values', async () => {
      const searchTerm = 'news';
      const mockRequest = { user: mockUser };
      const expectedResult = {
        data: mockArticles,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockArticlesService.searchByQuery.mockResolvedValue(expectedResult);

      const result = await controller.search(
        searchTerm,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
        mockRequest,
      );

      expect(service.searchByQuery).toHaveBeenCalledWith(
        searchTerm,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
        mockUser,
      );
      expect(result).toBeDefined();
    });

    it('should handle search errors', async () => {
      const searchTerm = 'invalid';
      const mockRequest = { user: mockUser };
      const errorMessage = 'Search term must be at least 2 characters long';

      mockArticlesService.searchByQuery.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.search(searchTerm, 1, 10, mockRequest),
      ).rejects.toThrow(errorMessage);
      expect(service.searchByQuery).toHaveBeenCalledWith(
        searchTerm,
        1,
        10,
        mockUser,
      );
    });
  });

  describe('findByCategory', () => {
    it('should return articles by category', async () => {
      const categoryId = 1;
      const page = 1;
      const limit = 10;
      const mockRequest = { user: mockUser };
      const expectedResult = {
        data: mockArticles,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockArticlesService.getArticlesByCategory.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findByCategory(
        categoryId,
        page,
        limit,
        mockRequest,
      );

      expect(service.getArticlesByCategory).toHaveBeenCalledWith(
        categoryId,
        page,
        limit,
        mockUser,
      );
      expect(result).toBeDefined();
    });

    it('should use default pagination values', async () => {
      const categoryId = 2;
      const mockRequest = { user: mockUser };
      const expectedResult = {
        data: mockArticles,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockArticlesService.getArticlesByCategory.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findByCategory(
        categoryId,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
        mockRequest,
      );

      expect(service.getArticlesByCategory).toHaveBeenCalledWith(
        categoryId,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
        mockUser,
      );
      expect(result).toBeDefined();
    });

    it('should handle category not found', async () => {
      const categoryId = 999;
      const mockRequest = { user: mockUser };
      const errorMessage = 'Category with ID 999 not found';

      mockArticlesService.getArticlesByCategory.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.findByCategory(categoryId, 1, 10, mockRequest),
      ).rejects.toThrow(errorMessage);
      expect(service.getArticlesByCategory).toHaveBeenCalledWith(
        categoryId,
        1,
        10,
        mockUser,
      );
    });
  });

  describe('findOne', () => {
    it('should return article by ID', async () => {
      const articleId = 1;
      const mockRequest = { user: mockUser };
      const expectedArticle = mockArticle;

      mockArticlesService.getArticleById.mockResolvedValue(expectedArticle);

      const result = await controller.findOne(articleId, mockRequest);

      expect(service.getArticleById).toHaveBeenCalledWith(articleId, mockUser);
      expect(result).toBeDefined();
    });

    it('should handle article not found', async () => {
      const articleId = 999;
      const mockRequest = { user: mockUser };
      const errorMessage = 'Article with ID 999 not found';

      mockArticlesService.getArticleById.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.findOne(articleId, mockRequest)).rejects.toThrow(
        errorMessage,
      );
      expect(service.getArticleById).toHaveBeenCalledWith(articleId, mockUser);
    });

    it('should handle errors when fetching article', async () => {
      const articleId = 1;
      const mockRequest = { user: mockUser };
      const errorMessage = 'Database connection error';

      mockArticlesService.getArticleById.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.findOne(articleId, mockRequest)).rejects.toThrow(
        errorMessage,
      );
      expect(service.getArticleById).toHaveBeenCalledWith(articleId, mockUser);
    });
  });
});
