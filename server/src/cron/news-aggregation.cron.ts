import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsApiService } from '@/news-aggregation/news-api.service';
import { NewsProcessingService } from './news-processing.service';
import { ICronJobResult } from './interfaces';

@Injectable()
export class NewsAggregationCronJob {
  private readonly logger = new Logger(NewsAggregationCronJob.name);

  constructor(
    private readonly newsApiService: NewsApiService,
    private readonly newsProcessingService: NewsProcessingService,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async executeNewsAggregation(): Promise<ICronJobResult> {
    const startTime = Date.now();
    this.logger.log('Starting scheduled news aggregation...');

    const result: ICronJobResult = {
      success: false,
      message: '',
      processedCount: 0,
      errors: [],
      timestamp: new Date(),
    };

    try {
      await this.newsApiService.fetchAndStoreArticles();
      this.logger.log('News aggregation completed successfully');

      const processingResult =
        await this.newsProcessingService.processUnprocessedArticles();
      this.logger.log('News processing completed successfully');

      result.success = true;
      result.processedCount = processingResult.articlesProcessed;
      result.message = `Successfully processed ${processingResult.articlesProcessed} articles, created ${processingResult.notificationsCreated} notifications`;
      result.duration = Date.now() - startTime;

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      result.errors = [errorMessage];
      result.message = `News aggregation failed: ${errorMessage}`;
      result.duration = Date.now() - startTime;
      this.logger.error('Error during scheduled news aggregation:', error);
      return result;
    }
  }
}
