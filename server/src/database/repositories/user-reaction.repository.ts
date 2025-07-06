import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReaction } from '../entities/user-reaction.entity';
import { ReactionTypeEnum } from '../../common/enums/reaction-type.enum';

@Injectable()
export class UserReactionRepository {
  constructor(
    @InjectRepository(UserReaction)
    private readonly repository: Repository<UserReaction>,
  ) {}

  async findByUserAndArticle(
    userId: number,
    articleId: number,
  ): Promise<UserReaction | null> {
    return await this.repository.findOne({
      where: { userId, articleId },
      relations: ['article'],
    });
  }

  async createReaction(
    userId: number,
    articleId: number,
    reactionType: ReactionTypeEnum,
  ): Promise<UserReaction> {
    const reaction = this.repository.create({
      userId,
      articleId,
      reactionType,
    });
    return await this.repository.save(reaction);
  }

  async updateReaction(
    id: number,
    reactionType: ReactionTypeEnum,
  ): Promise<UserReaction> {
    await this.repository.update(id, { reactionType });
    return await this.repository.findOne({
      where: { id },
      relations: ['article'],
    });
  }

  async removeReaction(userId: number, articleId: number): Promise<boolean> {
    const result = await this.repository.delete({ userId, articleId });
    return result.affected > 0;
  }

  async findUserReactions(userId: number): Promise<UserReaction[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['article'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUserReactionsByType(
    userId: number,
    reactionType: ReactionTypeEnum,
  ): Promise<UserReaction[]> {
    return await this.repository.find({
      where: { userId, reactionType },
      relations: ['article'],
      order: { createdAt: 'DESC' },
    });
  }

  async countReactionsForArticle(
    articleId: number,
    reactionType: ReactionTypeEnum,
  ): Promise<number> {
    return await this.repository.count({
      where: { articleId, reactionType },
    });
  }

  async getArticleReactionStats(articleId: number): Promise<{
    likes: number;
    dislikes: number;
  }> {
    const [likes, dislikes] = await Promise.all([
      this.countReactionsForArticle(articleId, ReactionTypeEnum.LIKE),
      this.countReactionsForArticle(articleId, ReactionTypeEnum.DISLIKE),
    ]);

    return { likes, dislikes };
  }
}
