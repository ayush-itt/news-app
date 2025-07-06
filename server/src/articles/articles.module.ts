import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from '../database/entities/article.entity';
import { Category } from '../database/entities/category.entity';
import { ArticleRepository } from '../database/repositories/article.repository';
import { CategoryRepository } from '../database/repositories/category.repository';
import { BannedKeywordsModule } from '../banned-keywords/banned-keywords.module';
import { UserReadingHistoryModule } from '../user-reading-history/user-reading-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Category]),
    BannedKeywordsModule,
    UserReadingHistoryModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleRepository, CategoryRepository],
  exports: [ArticlesService, ArticleRepository],
})
export class ArticlesModule {}
