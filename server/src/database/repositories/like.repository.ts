import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Like } from '../entities/like.entity';

@Injectable()
export class LikeRepository extends Repository<Like> {
  constructor(private dataSource: DataSource) {
    super(Like, dataSource.createEntityManager());
  }

  async findByUserAndArticle(
    userId: number,
    articleId: number,
  ): Promise<Like | null> {
    return await this.findOne({
      where: { userId, articleId },
    });
  }

  async createLike(userId: number, articleId: number): Promise<Like> {
    const like = this.create({
      userId,
      articleId,
    });
    return await this.save(like);
  }

  async removeLike(userId: number, articleId: number): Promise<boolean> {
    const result = await this.delete({ userId, articleId });
    return result.affected > 0;
  }

  async findUserLikes(userId: number): Promise<Like[]> {
    return await this.find({
      where: { userId },
      relations: ['article', 'article.categories'],
      order: { createdAt: 'DESC' },
    });
  }

  async countLikesForArticle(articleId: number): Promise<number> {
    return await this.count({
      where: { articleId },
    });
  }

  async isLikedByUser(userId: number, articleId: number): Promise<boolean> {
    const like = await this.findByUserAndArticle(userId, articleId);
    return !!like;
  }
}
