import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserReadingHistory } from '@/database/entities/user-reading-history.entity';

@Injectable()
export class UserReadingHistoryRepository {
  constructor(
    @InjectRepository(UserReadingHistory)
    private readonly repository: Repository<UserReadingHistory>,
  ) {}

  /**
   * Create a new reading history entry
   */
  async create(
    historyData: Partial<UserReadingHistory>,
  ): Promise<UserReadingHistory> {
    const history = this.repository.create(historyData);
    return this.repository.save(history);
  }

  /**
   * Find reading history by user ID with pagination
   */
  async findByUserId(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ history: UserReadingHistory[]; total: number }> {
    const [history, total] = await this.repository.findAndCount({
      where: { userId },
      relations: ['article', 'article.categories'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { history, total };
  }

  /**
   * Find reading history by user with pagination (alternative method name)
   */
  async findByUserPaginated(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: UserReadingHistory[]; total: number }> {
    const result = await this.findByUserId(userId, page, limit);
    return {
      data: result.history,
      total: result.total,
    };
  }

  /**
   * Find reading history by user and date range
   */
  async findByUserAndDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<UserReadingHistory[]> {
    return this.repository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['article', 'article.categories'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find all reading history by date range with pagination
   */
  async findAllByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: UserReadingHistory[]; total: number }> {
    const [history, total] = await this.repository.findAndCount({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['article', 'article.categories', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: history, total };
  }

  /**
   * Find reading history by user and article within date range
   */
  async findByUserAndArticleAndDateRange(
    userId: number,
    articleId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<UserReadingHistory | null> {
    return this.repository.findOne({
      where: {
        userId,
        articleId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['article'],
    });
  }

  /**
   * Check if user has read a specific article
   */
  async hasUserReadArticle(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: { userId, articleId },
    });
    return count > 0;
  }

  /**
   * Get reading count by user (simplified stats)
   */
  async getUserReadingCount(userId: number): Promise<number> {
    return this.repository.count({
      where: { userId },
    });
  }

  /**
   * Get reading history grouped by category
   */
  async getReadingsByCategory(
    userId: number,
  ): Promise<Array<{ category: string; count: number }>> {
    const results = await this.repository
      .createQueryBuilder('urh')
      .leftJoin('urh.article', 'article')
      .leftJoin('article.categories', 'category')
      .select(['category.name as category', 'COUNT(*) as count'])
      .where('urh.userId = :userId', { userId })
      .groupBy('category.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((result) => ({
      category: result.category || 'Uncategorized',
      count: parseInt(result.count),
    }));
  }

  /**
   * Get most read articles by user
   */
  async getMostReadArticlesByUser(
    userId: number,
    limit: number = 10,
  ): Promise<
    Array<{
      article: any;
      readCount: number;
      lastRead: Date;
    }>
  > {
    const results = await this.repository
      .createQueryBuilder('urh')
      .leftJoin('urh.article', 'article')
      .leftJoin('article.categories', 'categories')
      .select([
        'article.id',
        'article.title',
        'article.source',
        'article.publishedAt',
        'COUNT(*) as readCount',
        'MAX(urh.createdAt) as lastRead',
      ])
      .addSelect('categories.name', 'categoryName')
      .where('urh.userId = :userId', { userId })
      .groupBy(
        'article.id, article.title, article.source, article.publishedAt, categories.name',
      )
      .orderBy('readCount', 'DESC')
      .addOrderBy('lastRead', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((result) => ({
      article: {
        id: result.article_id,
        title: result.article_title,
        source: result.article_source,
        publishedAt: result.article_publishedAt,
        category: result.categoryName,
      },
      readCount: parseInt(result.readCount),
      lastRead: new Date(result.lastRead),
    }));
  }

  /**
   * Get reading history for a specific article
   */
  async getArticleReadingHistory(
    articleId: number,
  ): Promise<UserReadingHistory[]> {
    return this.repository.find({
      where: { articleId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Delete reading history older than specified days
   */
  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Delete all reading history for a user (for privacy/GDPR compliance)
   */
  async deleteByUserId(userId: number): Promise<number> {
    const result = await this.repository.delete({ userId });
    return result.affected || 0;
  }

  /**
   * Find all reading history with pagination (admin only)
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 20,
    userId?: number,
  ): Promise<{ history: UserReadingHistory[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('urh')
      .leftJoinAndSelect('urh.article', 'article')
      .leftJoinAndSelect('article.categories', 'categories')
      .leftJoinAndSelect('urh.user', 'user')
      .orderBy('urh.createdAt', 'DESC');

    if (userId) {
      queryBuilder.where('urh.userId = :userId', { userId });
    }

    const [history, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { history, total };
  }
}
