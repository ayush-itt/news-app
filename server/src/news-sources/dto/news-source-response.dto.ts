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
  base_url: string;

  @ApiProperty({
    description: 'Environment variable name for API key',
    example: 'NEWSAPI_KEY',
    nullable: true,
  })
  api_key_env: string | null;

  @ApiProperty({
    description: 'Whether the news source is active',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Last successful fetch timestamp',
    example: '2025-06-19T06:00:00.000Z',
    nullable: true,
  })
  last_fetch_at: Date | null;

  @ApiProperty({
    description: 'Last error message',
    example: null,
    nullable: true,
  })
  last_error: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-06-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-06-19T10:30:00.000Z',
  })
  updated_at: Date;

  static fromEntity(newsSource: NewsSource): NewsSourceResponseDto {
    const dto = new NewsSourceResponseDto();
    dto.id = newsSource.id;
    dto.name = newsSource.name;
    dto.type = newsSource.type;
    dto.base_url = newsSource.base_url;
    dto.api_key_env = newsSource.api_key_env;
    dto.is_active = newsSource.is_active;
    dto.last_fetch_at = newsSource.last_fetch_at;
    dto.last_error = newsSource.last_error;
    dto.created_at = newsSource.created_at;
    dto.updated_at = newsSource.updated_at;
    return dto;
  }

  static fromEntities(newsSources: NewsSource[]): NewsSourceResponseDto[] {
    return newsSources.map((source) => this.fromEntity(source));
  }
}
