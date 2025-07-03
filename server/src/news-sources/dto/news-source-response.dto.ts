import { ApiProperty } from '@nestjs/swagger';
import {
  NewsSource,
  NewsSourceType,
} from '../../database/entities/news-source.entity';

export class NewsSourceResponseDto {
  @ApiProperty({ description: 'News source ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'News source name', example: 'NewsAPI' })
  name: string;

  @ApiProperty({
    description: 'Type of news source',
    enum: NewsSourceType,
    example: NewsSourceType.NEWSAPI,
  })
  type: NewsSourceType;

  @ApiProperty({
    description: 'Base URL of the news API',
    example: 'https://newsapi.org/v2',
  })
  baseUrl: string;

  @ApiProperty({
    description: 'Environment variable name for API key',
    example: 'NEWSAPI_KEY',
    nullable: true,
  })
  apiKeyEnv: string | null;

  @ApiProperty({
    description: 'Whether the news source is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Last successful fetch timestamp',
    example: '2025-06-19T06:00:00.000Z',
    nullable: true,
  })
  lastFetchAt: Date | null;

  @ApiProperty({
    description: 'Last error message',
    example: null,
    nullable: true,
  })
  lastError: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-06-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-06-19T10:30:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(newsSource: NewsSource): NewsSourceResponseDto {
    const dto = new NewsSourceResponseDto();
    dto.id = newsSource.id;
    dto.name = newsSource.name;
    dto.type = newsSource.type;
    dto.baseUrl = newsSource.baseUrl;
    dto.apiKeyEnv = newsSource.apiKeyEnv;
    dto.isActive = newsSource.isActive;
    dto.lastFetchAt = newsSource.lastFetchAt;
    dto.lastError = newsSource.lastError;
    dto.createdAt = newsSource.createdAt;
    dto.updatedAt = newsSource.updatedAt;
    return dto;
  }

  static fromEntities(newsSources: NewsSource[]): NewsSourceResponseDto[] {
    return newsSources.map((source) => this.fromEntity(source));
  }
}
