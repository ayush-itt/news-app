import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsArray,
  IsInt,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Title of the article',
    example: 'Breaking: Major Technology Breakthrough Announced',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @MinLength(5)
  title: string;

  @ApiPropertyOptional({
    description: 'Content/body of the article',
    example: 'This is the full content of the article...',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Author of the article',
    example: 'John Doe',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  author?: string;

  @ApiPropertyOptional({
    description: 'Source/publisher of the article',
    example: 'TechNews Daily',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  source?: string;

  @ApiProperty({
    description: 'Original URL of the article',
    example: 'https://example.com/article/123',
    maxLength: 1000,
  })
  @IsUrl()
  @IsNotEmpty()
  @MaxLength(1000)
  originalUrl: string;

  @ApiProperty({
    description: 'Publication date of the article',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  publishedAt: string;

  @ApiPropertyOptional({
    description: 'Array of category IDs to associate with the article',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Transform(({ value }): number[] => (Array.isArray(value) ? value : [value]))
  categoryIds?: number[];
}
