import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SimpleNewsApiService } from '@/news-aggregation/simple-news-api.service';

@Injectable()
export class NewsAggregationCron {
  constructor(private readonly simpleNewsApiService: SimpleNewsApiService) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleNewsAggregation(): Promise<void> {
    console.log('[NewsAggregationCron] Starting scheduled news aggregation...');

    try {
      await this.simpleNewsApiService.fetchAndStoreArticles();
      console.log(
        '[NewsAggregationCron] Scheduled news aggregation completed successfully',
      );
    } catch (error) {
      console.error(
        '[NewsAggregationCron] Error during scheduled news aggregation:',
        error,
      );
    }
  }
}
