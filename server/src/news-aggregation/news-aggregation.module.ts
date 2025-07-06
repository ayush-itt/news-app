import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsApiService } from './news-api.service';
import { Article } from '@/database/entities/article.entity';
import { Category } from '@/database/entities/category.entity';
import { NewsSource } from '@/database/entities/news-source.entity';
import { CronModule } from '@/cron/cron.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Category, NewsSource]),
    CronModule,
  ],
  providers: [NewsApiService],
  exports: [NewsApiService],
})
export class NewsAggregationModule {}
