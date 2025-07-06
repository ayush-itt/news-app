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

@Injectable()
export class UserReadingHistoryService {
  private readonly logger = new Logger(UserReadingHistoryService.name);

  constructor(
    private readonly readingHistoryRepository: UserReadingHistoryRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  /**
   * Record a new reading history entry
   */
  async recordReading(
    userId: number,
    createDto: CreateReadingHistoryDto,
    user: User,
  ): Promise<UserReadingHistory> {
    // Verify the article exists
    const article = await this.articleRepository.findByIdWithCategories(
      createDto.articleId,
    );
    if (!article) {
      throw new NotFoundException(
        `Article with ID ${createDto.articleId} not found`,
      );
    }

    // For non-admin users, check if article is active
    if (user?.role?.name !== 'admin' && !article.isActive) {
      throw new NotFoundException(
        `Article with ID ${createDto.articleId} not found`,
      );
    }

    // Create reading history entry
    const readingHistory = await this.readingHistoryRepository.create({
      userId,
      articleId: createDto.articleId,
    });

    this.logger.log(
      `Recorded reading history: User ${userId} read article ${createDto.articleId}`,
    );

    return readingHistory;
  }

  /**
   * Get user's reading history with pagination and filtering
   */
  async getUserReadingHistory(
    userId: number,
    queryDto: GetReadingHistoryQueryDto,
  ): Promise<ReadingHistoryListResponseDto> {
    let result;

    if (queryDto.startDate && queryDto.endDate) {
      // Filter by date range
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
      // Get paginated results
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

  /**
   * Get reading count for a user (simplified stats)
   */
  async getUserReadingCount(userId: number): Promise<number> {
    return this.readingHistoryRepository.getUserReadingCount(userId);
  }

  /**
   * Check if user has read a specific article
   */
  async hasUserReadArticle(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    return this.readingHistoryRepository.hasUserReadArticle(userId, articleId);
  }

  /**
   * Get user's most read articles
   */
  async getMostReadArticles(userId: number, limit: number = 10) {
    return this.readingHistoryRepository.getMostReadArticlesByUser(
      userId,
      limit,
    );
  }

  /**
   * Get reading recommendations based on user's reading history
   * This is a basic implementation - can be enhanced with ML algorithms
   */
  async getPersonalizedRecommendations(userId: number, limit: number = 10) {
    // For now, return empty array since this requires ArticlesService
    // This method can be enhanced later with proper recommendation logic
    return [];
  }

  /**
   * Delete user's reading history (for privacy/GDPR compliance)
   */
  async deleteUserReadingHistory(userId: number): Promise<void> {
    const deletedCount =
      await this.readingHistoryRepository.deleteByUserId(userId);
    this.logger.log(
      `Deleted ${deletedCount} reading history entries for user ${userId}`,
    );
  }

  /**
   * Clean up old reading history entries
   */
  async cleanupOldHistory(days: number = 365): Promise<number> {
    const deletedCount =
      await this.readingHistoryRepository.deleteOlderThan(days);
    this.logger.log(
      `Cleaned up ${deletedCount} reading history entries older than ${days} days`,
    );
    return deletedCount;
  }

  /**
   * Get all users' reading history (admin only)
   */
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
      // Filter by date range for all users or specific user
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (startDateObj >= endDateObj) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (userId) {
        // Get specific user's history within date range
        const history =
          await this.readingHistoryRepository.findByUserAndDateRange(
            userId,
            startDateObj,
            endDateObj,
          );
        result = { history, total: history.length };
      } else {
        // Get all users' history within date range
        result = await this.readingHistoryRepository.findAllByDateRange(
          startDateObj,
          endDateObj,
          page,
          limit,
        );
      }
    } else {
      // Get all history with pagination
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

  /**
   * Automatically record reading history when a user views an article
   */
  async recordAutoReading(userId: number, articleId: number): Promise<void> {
    try {
      // Check if this user already has a reading entry for this article today
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
        // Create a basic reading history entry
        await this.readingHistoryRepository.create({
          userId,
          articleId,
        });

        this.logger.log(
          `Auto-recorded reading history: User ${userId} accessed article ${articleId}`,
        );
      }
    } catch (error) {
      // Log error but don't throw to avoid disrupting article viewing
      this.logger.error(
        `Failed to auto-record reading history for user ${userId}, article ${articleId}:`,
        error,
      );
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(history: UserReadingHistory): any {
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
