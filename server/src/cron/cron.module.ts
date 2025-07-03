import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsAggregationCron } from './news-aggregation.cron';
import { SimpleNewsApiService } from '@/news-aggregation/simple-news-api.service';
import { ArticlesModule } from '@/articles/articles.module';
import { UserPreferencesModule } from '@/user-preferences/user-preferences.module';
import { KeywordsModule } from '@/keywords/keywords.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { Article } from '@/database/entities/article.entity';
import { Category } from '@/database/entities/category.entity';
import { NewsSource } from '@/database/entities/news-source.entity';
import { Notification } from '@/database/entities/notification.entity';
import { UserPreference } from '@/database/entities/user-preference.entity';
import { Keyword } from '@/database/entities/keyword.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Article,
      Category,
      NewsSource,
      Notification,
      UserPreference,
      Keyword,
    ]),
    ArticlesModule,
    UserPreferencesModule,
    KeywordsModule,
    NotificationsModule,
  ],
  providers: [NewsAggregationCron, SimpleNewsApiService],
  exports: [NewsAggregationCron],
})
export class CronModule {}
