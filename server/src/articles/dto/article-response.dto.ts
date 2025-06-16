import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '@/categories/dto/category-response.dto';
import { Article } from '@/database/entities/article.entity';
import { PaginatedResult } from '../interfaces';

export class ArticleResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the article',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'UUID of the article',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uuid: string;

  @ApiProperty({
    description: 'Title of the article',
    example: 'Breaking: Major Technology Breakthrough Announced',
  })
  title: string;

  @ApiProperty({
    description: 'Content/body of the article',
    example: 'This is the full content of the article...',
    nullable: true,
  })
  content: string | null;

  @ApiProperty({
    description: 'Author of the article',
    example: 'John Doe',
    nullable: true,
  })
  author: string | null;

  @ApiProperty({
    description: 'Source/publisher of the article',
    example: 'TechNews Daily',
    nullable: true,
  })
  source: string | null;

  @ApiProperty({
    description: 'Original URL of the article',
    example: 'https://example.com/article/123',
  })
  original_url: string;

  @ApiProperty({
    description: 'Publication date of the article',
    example: '2024-01-15T10:30:00.000Z',
  })
  published_at: Date;

  @ApiProperty({
    description: 'Date when the article was scraped',
    example: '2024-01-15T11:00:00.000Z',
  })
  scraped_at: Date;

  @ApiProperty({
    description: 'Categories associated with the article',
    type: [CategoryResponseDto],
  })
  categories: CategoryResponseDto[];

  static fromEntity(article: Article): ArticleResponseDto {
    const dto = new ArticleResponseDto();
    dto.id = article.id;
    dto.uuid = article.uuid;
    dto.title = article.title;
    dto.content = article.content;
    dto.author = article.author;
    dto.source = article.source;
    dto.original_url = article.original_url;
    dto.published_at = article.published_at;
    dto.scraped_at = article.scraped_at;
    dto.categories = article.categories
      ? article.categories.map((category) =>
          CategoryResponseDto.fromEntity(category),
        )
      : [];
    return dto;
  }
}

export class PaginatedArticleResponseDto {
  @ApiProperty({
    description: 'Array of articles',
    type: [ArticleResponseDto],
  })
  data: ArticleResponseDto[];

  @ApiProperty({
    description: 'Total number of articles',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages: number;

  static fromPaginatedResult(
    result: PaginatedResult<Article>,
  ): PaginatedArticleResponseDto {
    const dto = new PaginatedArticleResponseDto();
    dto.data = result.data.map((article) =>
      ArticleResponseDto.fromEntity(article),
    );
    dto.total = result.total;
    dto.page = result.page;
    dto.limit = result.limit;
    dto.totalPages = result.totalPages;
    return dto;
  }
}
