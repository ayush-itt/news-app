import { Module } from '@nestjs/common';
import { ArticleReportService } from './article-report.service';
import {
  ArticleReportController,
  AdminReportController,
} from './article-report.controller';
import { ArticleReportRepository } from '@/database/repositories/article-report.repository';
import { ArticlesModule } from '@/articles/articles.module';

@Module({
  imports: [ArticlesModule],
  controllers: [ArticleReportController, AdminReportController],
  providers: [ArticleReportService, ArticleReportRepository],
  exports: [ArticleReportService, ArticleReportRepository],
})
export class ArticleReportModule {}
