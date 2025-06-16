import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Category } from './entities/category.entity';
import { Article } from './entities/article.entity';
import {
  UserRepository,
  RoleRepository,
  CategoryRepository,
  ArticleRepository,
} from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Category, Article])],
  providers: [
    UserRepository,
    RoleRepository,
    CategoryRepository,
    ArticleRepository,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    CategoryRepository,
    ArticleRepository,
  ],
})
export class DatabaseModule {}
