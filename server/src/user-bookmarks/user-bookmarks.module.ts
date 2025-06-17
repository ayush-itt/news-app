import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBookmarksController } from './user-bookmarks.controller';
import { UserBookmarksService } from './user-bookmarks.service';
import { Bookmark } from '../database/entities/bookmark.entity';
import { BookmarkRepository } from '../database/repositories/bookmark.repository';
import { ArticleRepository } from '../database/repositories/article.repository';
import { Article } from '../database/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Article])],
  controllers: [UserBookmarksController],
  providers: [UserBookmarksService, BookmarkRepository, ArticleRepository],
  exports: [UserBookmarksService],
})
export class UserBookmarksModule {}
