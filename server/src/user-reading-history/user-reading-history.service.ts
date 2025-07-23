import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserReadingHistoryRepository } from '@/database/repositories/user-reading-history.repository';
import { ArticleRepository } from '@/database/repositories/article.repository';
import { UserReadingHistory } from '@/database/entities/user-reading-history.entity';
import { User } from '@/database/entities/user.entity';
import {
  CreateReadingHistoryDto,
  GetReadingHistoryQueryDto,
  ReadingHistoryListResponseDto,
} from './dto';
import { IReadingHistoryResponse, IMostReadArticle } from './interfaces';

@Injectable()
export class UserReadingHistoryService {
  private readonly logger = new Logger(UserReadingHistoryService.name);

  constructor(
    private readonly readingHistoryRepository: UserReadingHistoryRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async recordReading(
    userId: number,
    createDto: CreateReadingHistoryDto,
    user: User,
  ): Promise<UserReadingHistory> {
    const article = await this.articleRepository.findByIdWithCategories(
      createDto.articleId,
    );
    if (!article) {
      throw new NotFoundException(
        `Article with ID ${createDto.articleId} not found`,
      );
    }

    if (user?.role?.name !== 'admin' && !article.isActive) {
      throw new NotFoundException(
        `Article with ID ${createDto.articleId} not found`,
      );
    }

    const readingHistory = await this.readingHistoryRepository.create({
      userId,
      articleId: createDto.articleId,
    });

    this.logger.log(
      `Recorded reading history: User ${userId} read article ${createDto.articleId}`,
    );

    return readingHistory;
  }

  async getUserReadingHistory(
    userId: number,
    queryDto: GetReadingHistoryQueryDto,
  ): Promise<ReadingHistoryListResponseDto> {
    let result;

    if (queryDto.startDate && queryDto.endDate) {
      const startDate = new Date(queryDto.startDate);
      const endDate = new Date(queryDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      const history =
        await this.readingHistoryRepository.findByUserAndDateRange(
          userId,
          startDate,
          endDate,
        );

      result = {
        history,
        total: history.length,
      };
    } else {
      result = await this.readingHistoryRepository.findByUserId(
        userId,
        queryDto.page,
        queryDto.limit,
      );
    }

    const totalPages = Math.ceil(result.total / queryDto.limit);

    return {
      history: result.history.map(this.mapToResponseDto),
      total: result.total,
      page: queryDto.page,
      limit: queryDto.limit,
      totalPages,
    };
  }

  async getUserReadingCount(userId: number): Promise<number> {
    return this.readingHistoryRepository.getUserReadingCount(userId);
  }

  async hasUserReadArticle(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    return this.readingHistoryRepository.hasUserReadArticle(userId, articleId);
  }

  async getMostReadArticles(
    userId: number,
    limit: number = 10,
  ): Promise<IMostReadArticle[]> {
    return this.readingHistoryRepository.getMostReadArticlesByUser(
      userId,
      limit,
    );
  }

  async getPersonalizedRecommendations(userId: number, limit: number = 10) {
    return [];
  }

  async deleteUserReadingHistory(userId: number): Promise<void> {
    const deletedCount =
      await this.readingHistoryRepository.deleteByUserId(userId);
    this.logger.log(
      `Deleted ${deletedCount} reading history entries for user ${userId}`,
    );
  }

  async cleanupOldHistory(days: number = 365): Promise<number> {
    const deletedCount =
      await this.readingHistoryRepository.deleteOlderThan(days);
    this.logger.log(
      `Cleaned up ${deletedCount} reading history entries older than ${days} days`,
    );
    return deletedCount;
  }

  async getAllUsersReadingHistory(
    queryDto: GetReadingHistoryQueryDto,
  ): Promise<ReadingHistoryListResponseDto> {
    const { page = 1, limit = 20, startDate, endDate, userId } = queryDto;

    let result: {
      history?: UserReadingHistory[];
      data?: UserReadingHistory[];
      total: number;
    };

    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (startDateObj >= endDateObj) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (userId) {
        const history =
          await this.readingHistoryRepository.findByUserAndDateRange(
            userId,
            startDateObj,
            endDateObj,
          );
        result = { history, total: history.length };
      } else {
        result = await this.readingHistoryRepository.findAllByDateRange(
          startDateObj,
          endDateObj,
          page,
          limit,
        );
      }
    } else {
      if (userId) {
        result = await this.readingHistoryRepository.findByUserPaginated(
          userId,
          page,
          limit,
        );
      } else {
        const adminResult =
          await this.readingHistoryRepository.findAllPaginated(
            page,
            limit,
            userId,
          );
        result = { history: adminResult.history, total: adminResult.total };
      }
    }

    const historyData = result.history || result.data || [];

    return {
      history: historyData.map((history) => this.mapToResponseDto(history)),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async recordAutoReading(userId: number, articleId: number): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingEntry =
        await this.readingHistoryRepository.findByUserAndArticleAndDateRange(
          userId,
          articleId,
          today,
          tomorrow,
        );

      if (!existingEntry) {
        await this.readingHistoryRepository.create({
          userId,
          articleId,
        });

        this.logger.log(
          `Auto-recorded reading history: User ${userId} accessed article ${articleId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to auto-record reading history for user ${userId}, article ${articleId}:`,
        error,
      );
    }
  }

  private mapToResponseDto(
    history: UserReadingHistory,
  ): IReadingHistoryResponse {
    return {
      id: history.id,
      userId: history.userId,
      articleId: history.articleId,
      createdAt: history.createdAt,
      article: history.article
        ? {
            id: history.article.id,
            title: history.article.title,
            source: history.article.source,
            publishedAt: history.article.publishedAt,
            categories:
              history.article.categories?.map((cat) => ({
                id: cat.id,
                name: cat.name,
              })) || [],
          }
        : undefined,
      user: history.user
        ? {
            id: history.user.id,
            email: history.user.email,
            username: history.user.username,
          }
        : undefined,
    };
  }
}
