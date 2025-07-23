import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NewsSourceType } from '../../database/entities/news-source.entity';

export class CreateNewsSourceDto {
  @ApiProperty({
    description: 'News source name',
    example: 'NewsAPI',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'News source name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Type of news source',
    enum: NewsSourceType,
    example: NewsSourceType.NEWSAPI,
  })
  @IsEnum(NewsSourceType, { message: 'Invalid news source type' })
  @IsNotEmpty({ message: 'Source type is required' })
  type: NewsSourceType;

  @ApiProperty({
    description: 'Base URL of the news API',
    example: 'https://newsapi.org/v2',
  })
  @IsUrl({}, { message: 'Base URL must be a valid URL' })
  @IsNotEmpty({ message: 'Base URL is required' })
  @MaxLength(255, { message: 'Base URL must not exceed 255 characters' })
  baseUrl: string;

  @ApiPropertyOptional({
    description: 'Environment variable name for API key',
    example: 'NEWSAPI_KEY',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'API key environment variable name must not exceed 100 characters',
  })
  apiKeyEnv?: string;

  @ApiPropertyOptional({
    description: 'Whether the news source is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
