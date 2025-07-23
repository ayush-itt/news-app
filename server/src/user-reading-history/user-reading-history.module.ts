import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReadingHistoryService } from './user-reading-history.service';
import { UserReadingHistoryController } from './user-reading-history.controller';
import { UserReadingHistoryRepository } from '@/database/repositories/user-reading-history.repository';
import { ArticleRepository } from '@/database/repositories/article.repository';
import { UserReadingHistory } from '@/database/entities/user-reading-history.entity';
import { Article } from '@/database/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserReadingHistory, Article])],
  controllers: [UserReadingHistoryController],
  providers: [
    UserReadingHistoryService,
    UserReadingHistoryRepository,
    ArticleRepository,
  ],
  exports: [UserReadingHistoryService, UserReadingHistoryRepository],
})
export class UserReadingHistoryModule {}
