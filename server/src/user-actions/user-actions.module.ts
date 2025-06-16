import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActionsController } from './user-actions.controller';
import { UserActionsService } from './user-actions.service';
import { Like } from '../database/entities/like.entity';
import { Bookmark } from '../database/entities/bookmark.entity';
import { LikeRepository } from '../database/repositories/like.repository';
import { BookmarkRepository } from '../database/repositories/bookmark.repository';
import { ArticleRepository } from '../database/repositories/article.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Bookmark])],
  controllers: [UserActionsController],
  providers: [
    UserActionsService,
    LikeRepository,
    BookmarkRepository,
    ArticleRepository,
  ],
  exports: [UserActionsService],
})
export class UserActionsModule {}
