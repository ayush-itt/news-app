import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsApiService } from '../../src/news-aggregation/news-api.service';
import { Article } from '../../src/database/entities/article.entity';
import { Category } from '../../src/database/entities/category.entity';
import { NewsSource } from '../../src/database/entities/news-source.entity';
import { NewsSourceType } from '../../src/database/entities/news-source.entity';
import {} from '../../src/database/entities/news-source.entity';
import { mockArticles, mockCategories } from '../mock-data';

// Mock fetch globally
global.fetch = jest.fn();

describe('NewsApiService', () => {
  let service: NewsApiService;
  let articleRepository: Repository<Article>;
  let categoryRepository: Repository<Category>;
  let newsSourceRepository: Repository<NewsSource>;

  const mockArticleRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockNewsSourceRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockNewsSource = {
    id: 1,
    name: 'TheNewsAPI',
    type: NewsSourceType.THENEWSAPI,
    baseUrl: 'https://api.thenewsapi.com/v1/news/all',
    apiKeyEnv: 'test-api-key',
    isActive: true,
    lastFetchAt: new Date(),
    lastError: null,
  };

  const mockApiArticle = {
    title: 'Test Article',
    snippet: 'Test snippet content',
    url: 'https://example.com/test-article',
    published_at: '2023-01-01T00:00:00Z',
    source: 'Example Source',
    categories: ['tech', 'business'],
  };

  const mockApiResponse = {
    data: [mockApiArticle],
    meta: {
      page: 1,
      total_pages: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsApiService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(NewsSource),
          useValue: mockNewsSourceRepository,
        },
      ],
    }).compile();

    service = module.get<NewsApiService>(NewsApiService);
    articleRepository = module.get<Repository<Article>>(
      getRepositoryToken(Article),
    );
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    newsSourceRepository = module.get<Repository<NewsSource>>(
      getRepositoryToken(NewsSource),
    );

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('fetchAndStoreArticles', () => {
    it('should successfully fetch and store articles', async () => {
      // Setup mocks
      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(null); // No existing article
      mockArticleRepository.save.mockResolvedValue(mockArticles[0]);
      mockNewsSourceRepository.update.mockResolvedValue(undefined);

      // Mock fetch for multiple pages
      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockApiResponse),
      });

      await service.fetchAndStoreArticles();

      expect(mockNewsSourceRepository.findOne).toHaveBeenCalledWith({
        where: {
          type: NewsSourceType.THENEWSAPI,
          isActive: true,
        },
      });
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(mockArticleRepository.save).toHaveBeenCalled();
      expect(mockNewsSourceRepository.update).toHaveBeenCalledWith(
        mockNewsSource.id,
        expect.objectContaining({
          lastFetchAt: expect.any(Date),
          lastError: null,
        }),
      );
    });

    it('should handle case when TheNewsAPI source is not found', async () => {
      mockNewsSourceRepository.findOne.mockResolvedValue(null);

      await expect(service.fetchAndStoreArticles()).rejects.toThrow(
        'TheNewsAPI source not found in database',
      );
    });

    it('should handle fetch errors and update news source status', async () => {
      const errorMessage = 'API request failed';
      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      (fetch as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(service.fetchAndStoreArticles()).rejects.toThrow(
        errorMessage,
      );
      expect(mockNewsSourceRepository.update).toHaveBeenCalledWith(
        mockNewsSource.id,
        expect.objectContaining({
          lastFetchAt: expect.any(Date),
          lastError: errorMessage,
        }),
      );
    });

    it('should skip articles with missing required fields', async () => {
      const incompleteApiArticle = {
        title: '', // Missing title
        snippet: 'Test snippet',
        url: 'https://example.com/test',
        published_at: '2023-01-01T00:00:00Z',
        source: 'Example Source',
        categories: ['tech'],
      };

      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ data: [incompleteApiArticle] }),
      });

      await service.fetchAndStoreArticles();

      expect(mockArticleRepository.save).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        '[NewsApiService] Skipping article with missing required fields',
      );
    });

    it('should skip articles that already exist', async () => {
      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(mockArticles[0]); // Existing article
      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockApiResponse),
      });

      await service.fetchAndStoreArticles();

      expect(mockArticleRepository.save).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        `[NewsApiService] Article already exists: ${mockApiArticle.title}`,
      );
    });

    it('should handle errors during article storage', async () => {
      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.save.mockRejectedValue(new Error('Database error'));
      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockApiResponse),
      });

      await service.fetchAndStoreArticles();

      expect(console.error).toHaveBeenCalledWith(
        `[NewsApiService] Failed to store article: ${mockApiArticle.title}`,
        expect.any(Error),
      );
    });

    it('should fetch multiple pages from API', async () => {
      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.save.mockResolvedValue(mockArticles[0]);
      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockApiResponse),
      });

      await service.fetchAndStoreArticles();

      // Should call fetch for 5 pages
      expect(fetch).toHaveBeenCalledTimes(5);
    });

    it('should handle empty response from API', async () => {
      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ data: [] }),
      });

      await service.fetchAndStoreArticles();

      expect(mockArticleRepository.save).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Successfully stored 0 out of 0 articles'),
      );
    });
  });

  describe('category mapping', () => {
    it('should map API categories to database categories', async () => {
      const apiArticleWithCategories = {
        ...mockApiArticle,
        categories: ['tech', 'business'],
      };

      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.save.mockImplementation((article) => {
        expect(article.categories).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Technology' }),
            expect.objectContaining({ name: 'Business' }),
          ]),
        );
        return Promise.resolve(article);
      });

      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ data: [apiArticleWithCategories] }),
      });

      await service.fetchAndStoreArticles();

      expect(mockArticleRepository.save).toHaveBeenCalled();
    });

    it('should use General category as fallback when no categories match', async () => {
      const apiArticleWithUnknownCategories = {
        ...mockApiArticle,
        categories: ['unknown_category'],
      };

      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.save.mockImplementation((article) => {
        expect(article.categories).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'General' }),
          ]),
        );
        return Promise.resolve(article);
      });

      (fetch as jest.Mock).mockResolvedValue({
        json: () =>
          Promise.resolve({ data: [apiArticleWithUnknownCategories] }),
      });

      await service.fetchAndStoreArticles();

      expect(mockArticleRepository.save).toHaveBeenCalled();
    });

    it('should handle articles with no categories', async () => {
      const apiArticleWithNoCategories = {
        ...mockApiArticle,
        categories: [],
      };

      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.save.mockImplementation((article) => {
        expect(article.categories).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'General' }),
          ]),
        );
        return Promise.resolve(article);
      });

      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ data: [apiArticleWithNoCategories] }),
      });

      await service.fetchAndStoreArticles();

      expect(mockArticleRepository.save).toHaveBeenCalled();
    });
  });

  describe('string truncation', () => {
    it('should truncate long strings properly', async () => {
      const longTitle = 'a'.repeat(600); // Longer than 500 chars
      const longContent = 'b'.repeat(2500); // Longer than 2000 chars
      const longUrl = 'c'.repeat(1100); // Longer than 1000 chars

      const apiArticleWithLongStrings = {
        ...mockApiArticle,
        title: longTitle,
        snippet: longContent,
        url: longUrl,
      };

      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.save.mockImplementation((article) => {
        expect(article.title).toHaveLength(500);
        expect(article.title).toMatch(/\.\.\.$/);
        expect(article.content).toHaveLength(2000);
        expect(article.content).toMatch(/\.\.\.$/);
        expect(article.originalUrl).toHaveLength(1000);
        expect(article.originalUrl).toMatch(/\.\.\.$/);
        return Promise.resolve(article);
      });

      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ data: [apiArticleWithLongStrings] }),
      });

      await service.fetchAndStoreArticles();

      expect(mockArticleRepository.save).toHaveBeenCalled();
    });

    it('should handle null and undefined values', async () => {
      const apiArticleWithNulls = {
        title: 'Valid Title',
        snippet: null,
        url: 'https://example.com/test',
        published_at: '2023-01-01T00:00:00Z',
        source: undefined,
        categories: ['tech'],
      };

      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockArticleRepository.save.mockImplementation((article) => {
        expect(article.content).toBeNull();
        expect(article.source).toBeNull();
        return Promise.resolve(article);
      });

      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ data: [apiArticleWithNulls] }),
      });

      await service.fetchAndStoreArticles();

      expect(mockArticleRepository.save).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle non-Error exceptions', async () => {
      const stringError = 'String error message';
      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      (fetch as jest.Mock).mockRejectedValue(stringError);

      await expect(service.fetchAndStoreArticles()).rejects.toBe(stringError);
      expect(mockNewsSourceRepository.update).toHaveBeenCalledWith(
        mockNewsSource.id,
        expect.objectContaining({
          lastError: 'Unknown error',
        }),
      );
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      mockNewsSourceRepository.findOne.mockResolvedValue(mockNewsSource);
      (fetch as jest.Mock).mockRejectedValue(timeoutError);

      await expect(service.fetchAndStoreArticles()).rejects.toThrow(
        'Network timeout',
      );
      expect(mockNewsSourceRepository.update).toHaveBeenCalledWith(
        mockNewsSource.id,
        expect.objectContaining({
          lastError: 'Network timeout',
        }),
      );
    });
  });
});
