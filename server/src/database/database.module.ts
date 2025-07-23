import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Category } from './entities/category.entity';
import { Article } from './entities/article.entity';
import { NewsSource } from './entities/news-source.entity';
import { Keyword } from './entities/keyword.entity';
import {
  UserRepository,
  RoleRepository,
  CategoryRepository,
  ArticleRepository,
  NewsSourceRepository,
  KeywordRepository,
} from './repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Category,
      Article,
      NewsSource,
      Keyword,
    ]),
  ],
  providers: [
    UserRepository,
    RoleRepository,
    CategoryRepository,
    ArticleRepository,
    NewsSourceRepository,
    KeywordRepository,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    CategoryRepository,
    ArticleRepository,
    NewsSourceRepository,
    KeywordRepository,
  ],
})
export class DatabaseModule {}
