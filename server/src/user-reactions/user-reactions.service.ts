import { Injectable, NotFoundException } from '@nestjs/common';
import { UserReactionRepository } from '../database/repositories/user-reaction.repository';
import { ArticleRepository } from '../database/repositories/article.repository';
import { UserReaction } from '../database/entities/user-reaction.entity';
import { ReactionTypeEnum } from '../common/enums/reaction-type.enum';
import { IArticleReactionStats } from './interfaces';

@Injectable()
export class UserReactionsService {
  constructor(
    private readonly userReactionRepository: UserReactionRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async reactToArticle(
    userId: number,
    articleId: number,
    reactionType: ReactionTypeEnum,
  ): Promise<UserReaction | null> {
    // Verify article exists
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if user already has a reaction to this article
    const existingReaction =
      await this.userReactionRepository.findByUserAndArticle(
        userId,
        article.id,
      );

    if (existingReaction) {
      // If same reaction type, remove the reaction (toggle off)
      if (existingReaction.reactionType === reactionType) {
        await this.userReactionRepository.removeReaction(userId, article.id);
        return null; // No reaction state
      } else {
        // Different reaction type, update the existing reaction
        return await this.userReactionRepository.updateReaction(
          existingReaction.id,
          reactionType,
        );
      }
    } else {
      // No existing reaction, create new one
      return await this.userReactionRepository.createReaction(
        userId,
        article.id,
        reactionType,
      );
    }
  }

  async getUserReactions(userId: number): Promise<UserReaction[]> {
    return await this.userReactionRepository.findUserReactions(userId);
  }

  async getUserLikedArticles(userId: number): Promise<UserReaction[]> {
    return await this.userReactionRepository.findUserReactionsByType(
      userId,
      ReactionTypeEnum.LIKE,
    );
  }

  async getUserDislikedArticles(userId: number): Promise<UserReaction[]> {
    return await this.userReactionRepository.findUserReactionsByType(
      userId,
      ReactionTypeEnum.DISLIKE,
    );
  }

  async getArticleReactionStats(
    articleId: number,
  ): Promise<IArticleReactionStats> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return await this.userReactionRepository.getArticleReactionStats(
      article.id,
    );
  }

  async getUserReactionForArticle(
    userId: number,
    articleId: number,
  ): Promise<UserReaction | null> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return await this.userReactionRepository.findByUserAndArticle(
      userId,
      article.id,
    );
  }
}
