import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ArticlesModule } from './articles/articles.module';
import { UserReactionsModule } from './user-reactions/user-reactions.module';
import { UserBookmarksModule } from './user-bookmarks/user-bookmarks.module';
import { NewsSourcesModule } from './news-sources/news-sources.module';
import { KeywordsModule } from './keywords/keywords.module';
import { DatabaseModule } from './database/database.module';
import { getDatabaseConfig } from './database/database.config';
import { AppConfigModule } from './config/app-config/app-config.module';
import { AppConfigService } from './config/app-config/app-config.service';
import { CronModule } from './cron/cron.module';
import { NewsAggregationModule } from './news-aggregation/news-aggregation.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';
import { ArticleReportModule } from './article-reports/article-report.module';
import { BannedKeywordsModule } from './banned-keywords/banned-keywords.module';
import { UserReadingHistoryModule } from './user-reading-history/user-reading-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: getDatabaseConfig,
      inject: [AppConfigService],
    }),
    DatabaseModule,
    AppConfigModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ArticlesModule,
    UserReactionsModule,
    UserBookmarksModule,
    NewsSourcesModule,
    KeywordsModule,
    CronModule,
    NewsAggregationModule,
    UserPreferencesModule,
    NotificationsModule,
    EmailModule,
    ArticleReportModule,
    BannedKeywordsModule,
    UserReadingHistoryModule,
  ],
})
export class AppModule {}
