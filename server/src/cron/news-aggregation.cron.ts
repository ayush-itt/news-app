import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SimpleNewsApiService } from '@/news-aggregation/simple-news-api.service';
import { NewsProcessingService } from './news-processing.service';

@Injectable()
export class NewsAggregationCron {
  private readonly logger = new Logger(NewsAggregationCron.name);

  constructor(
    private readonly simpleNewsApiService: SimpleNewsApiService,
    private readonly newsProcessingService: NewsProcessingService,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleNewsAggregation(): Promise<void> {
    this.logger.log('Starting scheduled news aggregation...');
    try {
      await this.simpleNewsApiService.fetchAndStoreArticles();
      this.logger.log('News aggregation completed successfully');

      await this.newsProcessingService.processNewArticles();
      this.logger.log('News processing completed successfully');
    } catch (error) {
      this.logger.error('Error during scheduled news aggregation:', error);
    }
  }
}
