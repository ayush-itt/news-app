import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsAggregationCron } from './news-aggregation.cron';
import { SimpleNewsApiService } from '@/news-aggregation/simple-news-api.service';
import { Article } from '@/database/entities/article.entity';
import { Category } from '@/database/entities/category.entity';
import { NewsSource } from '@/database/entities/news-source.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Article, Category, NewsSource]),
  ],
  providers: [NewsAggregationCron, SimpleNewsApiService],
  exports: [NewsAggregationCron],
})
export class CronModule {}
