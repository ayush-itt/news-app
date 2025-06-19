import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimpleNewsApiService } from './simple-news-api.service';
import { Article } from '@/database/entities/article.entity';
import { Category } from '@/database/entities/category.entity';
import { NewsSource } from '@/database/entities/news-source.entity';
import { CronModule } from '@/cron/cron.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Category, NewsSource]),
    CronModule,
  ],
  providers: [SimpleNewsApiService],
  exports: [SimpleNewsApiService],
})
export class NewsAggregationModule {}
