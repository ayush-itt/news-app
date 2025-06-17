import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReactionsController } from './user-reactions.controller';
import { UserReactionsService } from './user-reactions.service';
import { UserReaction } from '../database/entities/user-reaction.entity';
import { UserReactionRepository } from '../database/repositories/user-reaction.repository';
import { ArticleRepository } from '../database/repositories/article.repository';
import { Article } from '../database/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserReaction, Article])],
  controllers: [UserReactionsController],
  providers: [UserReactionsService, UserReactionRepository, ArticleRepository],
  exports: [UserReactionsService],
})
export class UserReactionsModule {}
