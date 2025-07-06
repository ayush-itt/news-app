import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ArticleReportRepository } from '@/database/repositories/article-report.repository';
import { ArticlesService } from '@/articles/articles.service';
import { ArticleReport } from '@/database/entities/article-report.entity';
import { CreateArticleReportDto, GetReportsQueryDto } from './dto';
import { REPORT_CONSTANTS } from '@/common/constants/report.constants';
import { User } from '@/database/entities/user.entity';

@Injectable()
export class ArticleReportService {
  private readonly logger = new Logger(ArticleReportService.name);

  constructor(
    private readonly articleReportRepository: ArticleReportRepository,
    private readonly articlesService: ArticlesService,
  ) {}

  /**
   * Report an article by a user
   */
  async reportArticle(
    articleId: number,
    userId: number,
    createReportDto: CreateArticleReportDto,
  ): Promise<ArticleReport> {
    // Check if article exists and is active (users can only report active articles)
    // Create a partial user object for the role check
    const userForRoleCheck = {
      role: { name: 'user' },
      id: userId,
    } as unknown as User;

    const article = await this.articlesService.findArticleById(
      articleId,
      userForRoleCheck,
    );

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    // Check if user has already reported this article
    const existingReport =
      await this.articleReportRepository.existsByUserAndArticle(
        userId,
        articleId,
      );

    if (existingReport) {
      throw new ConflictException('You have already reported this article');
    }

    // Create the report
    const report = await this.articleReportRepository.createReport(
      userId,
      articleId,
      createReportDto.reason,
    );

    this.logger.log(
      `Article ${articleId} reported by user ${userId} with reason: ${createReportDto.reason}`,
    );

    // Check if article should be auto-hidden
    await this.checkAndAutoHideArticle(articleId);

    return report;
  }

  /**
   * Check if article should be auto-hidden based on report threshold
   */
  private async checkAndAutoHideArticle(articleId: number): Promise<void> {
    const reportCount =
      await this.articleReportRepository.countByArticleId(articleId);

    if (reportCount >= REPORT_CONSTANTS.AUTO_HIDE_THRESHOLD) {
      this.logger.warn(
        `Article ${articleId} reached report threshold (${reportCount}/${REPORT_CONSTANTS.AUTO_HIDE_THRESHOLD}), auto-hiding`,
      );

      // Hide the article
      await this.articlesService.hideArticle(articleId);

      // TODO: Send notification to admin about auto-hidden article
      this.logger.log(
        `Admin notification: Article ${articleId} was auto-hidden due to excessive reports`,
      );
    }
  }

  /**
   * Get all reports (admin only)
   */
  async getAllReports(query: GetReportsQueryDto) {
    const { page, limit, status } = query;

    const result = await this.articleReportRepository.findAllWithPagination(
      page,
      limit,
      status,
    );

    // Add summary statistics
    const summary = {
      totalReports: result.total,
      pendingReports: await this.getPendingReportsCount(),
      resolvedReports: await this.getResolvedReportsCount(),
    };

    return {
      ...result,
      summary,
    };
  }

  /**
   * Get reports for a specific article (admin only)
   */
  async getReportsByArticleId(articleId: number): Promise<ArticleReport[]> {
    // Verify article exists (admin can see all articles)
    const adminUser = {
      role: { name: 'admin' },
      id: 1,
    } as unknown as User;

    const article = await this.articlesService.findArticleById(
      articleId,
      adminUser,
    );
    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    return this.articleReportRepository.findByArticleId(articleId);
  }

  /**
   * Get reports by a specific user (admin only)
   */
  async getReportsByUserId(userId: number): Promise<ArticleReport[]> {
    return this.articleReportRepository.findByUserId(userId);
  }

  /**
   * Get report count for an article
   */
  async getReportCount(articleId: number): Promise<number> {
    return this.articleReportRepository.countByArticleId(articleId);
  }

  /**
   * Get pending reports count (articles that are still active but reported)
   */
  private async getPendingReportsCount(): Promise<number> {
    // This would require a more complex query to count reports for active articles
    // For now, return 0 - can be implemented later with proper joins
    return 0;
  }

  /**
   * Get resolved reports count (articles that have been hidden)
   */
  private async getResolvedReportsCount(): Promise<number> {
    // This would require a more complex query to count reports for inactive articles
    // For now, return 0 - can be implemented later with proper joins
    return 0;
  }
}
