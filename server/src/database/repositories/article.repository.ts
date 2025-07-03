import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder, In } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto } from '@/articles/dto/create-article.dto';
import { UpdateArticleDto } from '@/articles/dto/update-article.dto';
import {
  ArticleFilters,
  PaginationOptions,
  PaginatedResult,
} from '@/articles/interfaces';

@Injectable()
export class ArticleRepository extends Repository<Article> {
  constructor(private dataSource: DataSource) {
    super(Article, dataSource.createEntityManager());
  }

  async createArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.create(createArticleDto);
    return await this.save(article);
  }

  async findAllPaginated(
    filters: ArticleFilters = {},
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Article>> {
    const queryBuilder = this.createFilteredQuery(filters);

    const total = await queryBuilder.getCount();

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const data = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('article.publishedAt', 'DESC')
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByIdWithCategories(id: number): Promise<Article | null> {
    return await this.findOne({
      where: { id },
      relations: ['categories'],
    });
  }

  async updateArticle(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article | null> {
    await this.update(id, updateArticleDto);
    return await this.findByIdWithCategories(id);
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected > 0;
  }

  async existsByUrl(originalUrl: string): Promise<boolean> {
    const count = await this.count({
      where: { originalUrl: originalUrl },
    });
    return count > 0;
  }

  async findByCategory(
    categoryId: number,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Article>> {
    return await this.findAllPaginated(
      { categoryIds: [categoryId] },
      pagination,
    );
  }

  async searchArticles(
    searchTerm: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Article>> {
    return await this.findAllPaginated({ search: searchTerm }, pagination);
  }

  private createFilteredQuery(
    filters: ArticleFilters,
  ): SelectQueryBuilder<Article> {
    const queryBuilder = this.createQueryBuilder('article').leftJoinAndSelect(
      'article.categories',
      'category',
    );

    if (filters.categoryIds?.length) {
      queryBuilder.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: filters.categoryIds,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(article.title ILIKE :search OR article.content ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.author) {
      queryBuilder.andWhere('article.author ILIKE :author', {
        author: `%${filters.author}%`,
      });
    }

    if (filters.source) {
      queryBuilder.andWhere('article.source ILIKE :source', {
        source: `%${filters.source}%`,
      });
    }

    if (filters.publishedAfter) {
      queryBuilder.andWhere('article.publishedAt >= :publishedAfter', {
        publishedAfter: filters.publishedAfter,
      });
    }

    if (filters.publishedBefore) {
      queryBuilder.andWhere('article.publishedAt <= :publishedBefore', {
        publishedBefore: filters.publishedBefore,
      });
    }

    return queryBuilder;
  }

  async findUnprocessedArticles(): Promise<Article[]> {
    return this.find({
      where: { processedForNotifications: false },
      relations: ['categories'],
    });
  }

  async markArticlesAsProcessed(articleIds: number[]): Promise<void> {
    await this.update(
      { id: In(articleIds) },
      { processedForNotifications: true },
    );
  }
}
