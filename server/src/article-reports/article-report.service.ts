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

  async createReport(
    articleId: number,
    userId: number,
    reportData: CreateArticleReportDto,
  ): Promise<ArticleReport> {
    const userForRoleCheck = {
      role: { name: 'user' },
      id: userId,
    } as unknown as User;

    const article = await this.articlesService.getArticleById(
      articleId,
      userForRoleCheck,
    );

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    const hasExistingReport =
      await this.articleReportRepository.existsByUserAndArticle(
        userId,
        articleId,
      );

    if (hasExistingReport) {
      throw new ConflictException('You have already reported this article');
    }

    const newReport = await this.articleReportRepository.createReport(
      userId,
      articleId,
      reportData.reason,
    );

    this.logger.log(
      `Article ${articleId} reported by user ${userId} with reason: ${reportData.reason}`,
    );

    await this.processAutoHideIfNeeded(articleId);

    return newReport;
  }

  private async processAutoHideIfNeeded(articleId: number): Promise<void> {
    const reportCount =
      await this.articleReportRepository.countByArticleId(articleId);

    if (reportCount >= REPORT_CONSTANTS.AUTO_HIDE_THRESHOLD) {
      this.logger.warn(
        `Article ${articleId} reached report threshold (${reportCount}/${REPORT_CONSTANTS.AUTO_HIDE_THRESHOLD}), auto-hiding`,
      );

      await this.articlesService.hideArticle(articleId);

      this.logger.log(
        `Admin notification: Article ${articleId} was auto-hidden due to excessive reports`,
      );
    }
  }

  async getAllReportsWithPagination(query: GetReportsQueryDto) {
    const { page, limit, status } = query;

    const result = await this.articleReportRepository.findAllWithPagination(
      page,
      limit,
      status,
    );

    const reportSummary = {
      totalReports: result.total,
      pendingReports: await this.countPendingReports(),
      resolvedReports: await this.countResolvedReports(),
    };

    return {
      ...result,
      summary: reportSummary,
    };
  }

  async findReportsByArticleId(articleId: number): Promise<ArticleReport[]> {
    const adminUser = {
      role: { name: 'admin' },
      id: 1,
    } as unknown as User;

    const article = await this.articlesService.getArticleById(
      articleId,
      adminUser,
    );
    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    return this.articleReportRepository.findByArticleId(articleId);
  }

  async findReportsByUserId(userId: number): Promise<ArticleReport[]> {
    return this.articleReportRepository.findByUserId(userId);
  }

  async countReportsByArticleId(articleId: number): Promise<number> {
    return this.articleReportRepository.countByArticleId(articleId);
  }

  private async countPendingReports(): Promise<number> {
    return 0;
  }

  private async countResolvedReports(): Promise<number> {
    return 0;
  }
}
