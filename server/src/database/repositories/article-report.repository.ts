import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ArticleReport } from '../entities/article-report.entity';

@Injectable()
export class ArticleReportRepository extends Repository<ArticleReport> {
  constructor(private dataSource: DataSource) {
    super(ArticleReport, dataSource.createEntityManager());
  }

  /**
   * Find all reports for a specific article
   */
  async findByArticleId(articleId: number): Promise<ArticleReport[]> {
    return this.find({
      where: { articleId },
      relations: ['user', 'article'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find all reports by a specific user
   */
  async findByUserId(userId: number): Promise<ArticleReport[]> {
    return this.find({
      where: { userId },
      relations: ['user', 'article'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if user has already reported this article
   */
  async existsByUserAndArticle(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    const count = await this.count({
      where: { userId, articleId },
    });
    return count > 0;
  }

  /**
   * Count reports for a specific article
   */
  async countByArticleId(articleId: number): Promise<number> {
    return this.count({
      where: { articleId },
    });
  }

  /**
   * Get all reports with pagination for admin
   */
  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
    status?: 'all' | 'pending' | 'resolved',
  ): Promise<{
    reports: ArticleReport[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.article', 'article')
      .orderBy('report.createdAt', 'DESC');

    // Add status filtering if needed (for future enhancement)
    // if (status === 'pending') {
    //   queryBuilder.andWhere('article.isActive = :isActive', { isActive: true });
    // } else if (status === 'resolved') {
    //   queryBuilder.andWhere('article.isActive = :isActive', { isActive: false });
    // }

    const total = await queryBuilder.getCount();
    const skip = (page - 1) * limit;

    const reports = await queryBuilder.skip(skip).take(limit).getMany();

    return {
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new report
   */
  async createReport(
    userId: number,
    articleId: number,
    reason?: string,
  ): Promise<ArticleReport> {
    const report = this.create({
      userId,
      articleId,
      reason,
    });

    return this.save(report);
  }
}
