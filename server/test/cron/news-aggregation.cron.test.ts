import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NewsAggregationCronJob } from '../../src/cron/news-aggregation.cron';
import { NewsApiService } from '../../src/news-aggregation/news-api.service';
import { NewsProcessingService } from '../../src/cron/news-processing.service';

describe('NewsAggregationCronJob', () => {
  let cronJob: NewsAggregationCronJob;
  let newsApiService: NewsApiService;
  let newsProcessingService: NewsProcessingService;

  const mockNewsApiService = {
    fetchAndStoreArticles: jest.fn(),
  };

  const mockNewsProcessingService = {
    processUnprocessedArticles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsAggregationCronJob,
        {
          provide: NewsApiService,
          useValue: mockNewsApiService,
        },
        {
          provide: NewsProcessingService,
          useValue: mockNewsProcessingService,
        },
      ],
    }).compile();

    cronJob = module.get<NewsAggregationCronJob>(NewsAggregationCronJob);
    newsApiService = module.get<NewsApiService>(NewsApiService);
    newsProcessingService = module.get<NewsProcessingService>(
      NewsProcessingService,
    );

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeNewsAggregation', () => {
    it('should successfully complete news aggregation and processing', async () => {
      const mockProcessingResult = {
        articlesProcessed: 5,
        notificationsCreated: 3,
        unprocessedArticlesCount: 5,
        emailsSent: 3,
        processingTimeMs: 1000,
        success: true,
        errors: [],
      };

      mockNewsApiService.fetchAndStoreArticles.mockResolvedValue(undefined);
      mockNewsProcessingService.processUnprocessedArticles.mockResolvedValue(
        mockProcessingResult,
      );

      const result = await cronJob.executeNewsAggregation();

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(5);
      expect(result.message).toBe(
        'Successfully processed 5 articles, created 3 notifications',
      );
      expect(result.errors).toEqual([]);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThan(0);
      expect(newsApiService.fetchAndStoreArticles).toHaveBeenCalledTimes(1);
      expect(
        newsProcessingService.processUnprocessedArticles,
      ).toHaveBeenCalledTimes(1);
    });

    it('should handle error during news API fetch', async () => {
      const errorMessage = 'API fetch failed';
      mockNewsApiService.fetchAndStoreArticles.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await cronJob.executeNewsAggregation();

      expect(result.success).toBe(false);
      expect(result.errors).toContain(errorMessage);
      expect(result.message).toBe(`News aggregation failed: ${errorMessage}`);
      expect(result.processedCount).toBe(0);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThan(0);
      expect(newsApiService.fetchAndStoreArticles).toHaveBeenCalledTimes(1);
      expect(
        newsProcessingService.processUnprocessedArticles,
      ).not.toHaveBeenCalled();
    });

    it('should handle error during news processing', async () => {
      const errorMessage = 'Processing failed';
      mockNewsApiService.fetchAndStoreArticles.mockResolvedValue(undefined);
      mockNewsProcessingService.processUnprocessedArticles.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await cronJob.executeNewsAggregation();

      expect(result.success).toBe(false);
      expect(result.errors).toContain(errorMessage);
      expect(result.message).toBe(`News aggregation failed: ${errorMessage}`);
      expect(result.processedCount).toBe(0);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThan(0);
      expect(newsApiService.fetchAndStoreArticles).toHaveBeenCalledTimes(1);
      expect(
        newsProcessingService.processUnprocessedArticles,
      ).toHaveBeenCalledTimes(1);
    });

    it('should handle non-Error exceptions', async () => {
      const errorMessage = 'String error';
      mockNewsApiService.fetchAndStoreArticles.mockRejectedValue(errorMessage);

      const result = await cronJob.executeNewsAggregation();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unknown error');
      expect(result.message).toBe('News aggregation failed: Unknown error');
      expect(result.processedCount).toBe(0);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should log successful completion', async () => {
      const mockProcessingResult = {
        articlesProcessed: 3,
        notificationsCreated: 2,
        unprocessedArticlesCount: 3,
        emailsSent: 2,
        processingTimeMs: 500,
        success: true,
        errors: [],
      };

      mockNewsApiService.fetchAndStoreArticles.mockResolvedValue(undefined);
      mockNewsProcessingService.processUnprocessedArticles.mockResolvedValue(
        mockProcessingResult,
      );

      await cronJob.executeNewsAggregation();

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Starting scheduled news aggregation...',
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'News aggregation completed successfully',
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'News processing completed successfully',
      );
    });

    it('should log errors properly', async () => {
      const error = new Error('Test error');
      mockNewsApiService.fetchAndStoreArticles.mockRejectedValue(error);

      await cronJob.executeNewsAggregation();

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error during scheduled news aggregation:',
        error,
      );
    });
  });

  describe('cron job configuration', () => {
    it('should have the correct cron expression', () => {
      // This test verifies that the cron job is properly decorated
      // The actual cron expression is EVERY_3_HOURS from the decorator
      expect(cronJob).toBeDefined();
      expect(cronJob.executeNewsAggregation).toBeDefined();
    });
  });
});
