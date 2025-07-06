import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ArticleRepository } from '../database/repositories/article.repository';
import { CategoryRepository } from '../database/repositories/category.repository';
import { BannedKeywordsService } from '../banned-keywords/banned-keywords.service';
import { Article } from '../database/entities/article.entity';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto } from './dto';
import {
  ArticleFilters,
  PaginationOptions,
  PaginatedResult,
} from './interfaces';
import { PAGINATION } from '../common/constants/pagination.constants';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly bannedKeywordsService: BannedKeywordsService,
  ) {}

  async createArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    // Check if article already exists by URL
    const existsByUrl = await this.articleRepository.existsByUrl(
      createArticleDto.originalUrl,
    );
    if (existsByUrl) {
      throw new ConflictException('Article with this URL already exists');
    }

    // Check for banned keywords in title and content
    const titleCheck = await this.bannedKeywordsService.containsBannedKeywords(
      createArticleDto.title,
    );
    const contentCheck =
      await this.bannedKeywordsService.containsBannedKeywords(
        createArticleDto.content || '',
      );

    if (titleCheck.hasBanned || contentCheck.hasBanned) {
      const allMatchedKeywords = [
        ...titleCheck.matchedKeywords,
        ...contentCheck.matchedKeywords,
      ];
      throw new BadRequestException(
        `Article contains banned keywords: ${allMatchedKeywords.join(', ')}`,
      );
    }

    // Validate categories if provided
    if (createArticleDto.categoryIds?.length) {
      await this.validateCategories(createArticleDto.categoryIds);
    }

    // Create the article - transform DTO to entity data
    const transformedData = {
      title: createArticleDto.title,
      content: createArticleDto.content,
      author: createArticleDto.author,
      source: createArticleDto.source,
      originalUrl: createArticleDto.originalUrl,
      publishedAt: new Date(createArticleDto.publishedAt),
    };

    const article = this.articleRepository.create(transformedData);
    const savedArticle = await this.articleRepository.save(article);

    // Associate categories if provided
    if (createArticleDto.categoryIds?.length) {
      const categories = await this.categoryRepository.findByIds(
        createArticleDto.categoryIds,
      );
      savedArticle.categories = categories;
      await this.articleRepository.save(savedArticle);
    }

    return await this.articleRepository.findByIdWithCategories(savedArticle.id);
  }

  async findAllArticles(
    query: ArticleQueryDto,
    user?: any, // User entity from JWT
  ): Promise<PaginatedResult<Article>> {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      ...filterParams
    } = query;

    const filters: ArticleFilters = {
      categoryIds: filterParams.categoryIds,
      search: filterParams.search,
      author: filterParams.author,
      source: filterParams.source,
      publishedAfter: filterParams.publishedAfter
        ? new Date(filterParams.publishedAfter)
        : undefined,
      publishedBefore: filterParams.publishedBefore
        ? new Date(filterParams.publishedBefore)
        : undefined,
      // Admin can see all articles, regular users only see active ones
      includeInactive: user?.role?.name === 'admin',
    };

    const pagination: PaginationOptions = { page, limit };

    return await this.articleRepository.findAllPaginated(filters, pagination);
  }

  async findArticleById(id: number, user?: any): Promise<Article> {
    let article: Article | null;

    // Admin can see all articles, regular users only see active ones
    if (user?.role?.name === 'admin') {
      article = await this.articleRepository.findByIdWithCategories(id);
    } else {
      article = await this.articleRepository.findByIdWithCategoriesForUser(id);
    }

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async updateArticle(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const existingArticle =
      await this.articleRepository.findByIdWithCategories(id);
    if (!existingArticle) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Check for URL conflicts if URL is being updated
    if (
      updateArticleDto.originalUrl &&
      updateArticleDto.originalUrl !== existingArticle.originalUrl
    ) {
      const existsByUrl = await this.articleRepository.existsByUrl(
        updateArticleDto.originalUrl,
      );
      if (existsByUrl) {
        throw new ConflictException(
          'Another article with this URL already exists',
        );
      }
    }

    // Validate categories if provided
    if (updateArticleDto.categoryIds?.length) {
      await this.validateCategories(updateArticleDto.categoryIds);
    }

    // Prepare update data - transform dates if present
    const updateFields: Partial<Article> = {};

    if (updateArticleDto.title !== undefined)
      updateFields.title = updateArticleDto.title;
    if (updateArticleDto.content !== undefined)
      updateFields.content = updateArticleDto.content;
    if (updateArticleDto.author !== undefined)
      updateFields.author = updateArticleDto.author;
    if (updateArticleDto.source !== undefined)
      updateFields.source = updateArticleDto.source;
    if (updateArticleDto.originalUrl !== undefined)
      updateFields.originalUrl = updateArticleDto.originalUrl;
    if (updateArticleDto.publishedAt !== undefined) {
      updateFields.publishedAt = new Date(updateArticleDto.publishedAt);
    }

    // Update the article
    await this.articleRepository.update(id, updateFields);

    // Update categories if provided
    if (updateArticleDto.categoryIds?.length) {
      const updatedArticle =
        await this.articleRepository.findByIdWithCategories(id);
      const categories = await this.categoryRepository.findByIds(
        updateArticleDto.categoryIds,
      );
      updatedArticle.categories = categories;
      await this.articleRepository.save(updatedArticle);
    }

    return await this.articleRepository.findByIdWithCategories(id);
  }

  async deleteArticle(id: number): Promise<void> {
    const article = await this.articleRepository.findByIdWithCategories(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    const deleted = await this.articleRepository.deleteArticle(id);
    if (!deleted) {
      throw new BadRequestException('Failed to delete article');
    }
  }

  async findArticlesByCategory(
    categoryId: number,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    user?: any,
  ): Promise<PaginatedResult<Article>> {
    // Verify category exists
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const filters: ArticleFilters = {
      categoryIds: [categoryId],
      // Admin can see all articles, regular users only see active ones
      includeInactive: user?.role?.name === 'admin',
    };

    return await this.articleRepository.findAllPaginated(filters, {
      page,
      limit,
    });
  }

  async searchArticles(
    searchTerm: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    user?: any,
  ): Promise<PaginatedResult<Article>> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new BadRequestException(
        'Search term must be at least 2 characters long',
      );
    }

    const filters: ArticleFilters = {
      search: searchTerm.trim(),
      // Admin can see all articles, regular users only see active ones
      includeInactive: user?.role?.name === 'admin',
    };

    return await this.articleRepository.findAllPaginated(filters, {
      page,
      limit,
    });
  }

  private async validateCategories(categoryIds: number[]): Promise<void> {
    const categories = await this.categoryRepository.findByIds(categoryIds);

    if (categories.length !== categoryIds.length) {
      const foundIds = categories.map((cat) => cat.id);
      const missingIds = categoryIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Categories with IDs ${missingIds.join(', ')} not found`,
      );
    }

    // Check if all categories are active
    const inactiveCategories = categories.filter((cat) => !cat.isActive);
    if (inactiveCategories.length > 0) {
      const inactiveIds = inactiveCategories.map((cat) => cat.id);
      throw new BadRequestException(
        `Categories with IDs ${inactiveIds.join(', ')} are inactive`,
      );
    }
  }

  async hideArticle(id: number): Promise<Article> {
    const article = await this.articleRepository.findByIdWithCategories(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    await this.articleRepository.update(id, { isActive: false });
    return await this.articleRepository.findByIdWithCategories(id);
  }

  async showArticle(id: number): Promise<Article> {
    const article = await this.articleRepository.findByIdWithCategories(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    await this.articleRepository.update(id, { isActive: true });
    return await this.articleRepository.findByIdWithCategories(id);
  }

  async getUnprocessedArticles(): Promise<Article[]> {
    return this.articleRepository.findUnprocessedArticles();
  }

  async markArticlesAsProcessed(articleIds: number[]): Promise<void> {
    await this.articleRepository.markArticlesAsProcessed(articleIds);
  }

  /**
   * Check if article contains banned keywords
   * @param article - Article to check
   * @returns Promise with banned keyword check result
   */
  async checkArticleForBannedKeywords(article: Article): Promise<{
    hasBanned: boolean;
    matchedKeywords: string[];
  }> {
    const titleCheck = await this.bannedKeywordsService.containsBannedKeywords(
      article.title,
    );
    const contentCheck =
      await this.bannedKeywordsService.containsBannedKeywords(
        article.content || '',
      );

    return {
      hasBanned: titleCheck.hasBanned || contentCheck.hasBanned,
      matchedKeywords: [
        ...titleCheck.matchedKeywords,
        ...contentCheck.matchedKeywords,
      ],
    };
  }
}
