import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsAggregationCronJob } from './news-aggregation.cron';
import { NewsProcessingService } from './news-processing.service';
import { NewsApiService } from '@/news-aggregation/news-api.service';
import { ArticlesModule } from '@/articles/articles.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { Article } from '@/database/entities/article.entity';
import { Category } from '@/database/entities/category.entity';
import { NewsSource } from '@/database/entities/news-source.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Article, Category, NewsSource]),
    ArticlesModule,
    NotificationsModule,
  ],
  providers: [NewsAggregationCronJob, NewsApiService, NewsProcessingService],
  exports: [NewsAggregationCronJob],
})
export class CronModule {}
