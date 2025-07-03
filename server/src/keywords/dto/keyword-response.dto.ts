import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from '../../database/entities/keyword.entity';

export class KeywordResponseDto {
  @ApiProperty({ description: 'Keyword ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User ID who owns the keyword', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Category ID for the keyword', example: 1 })
  categoryId: number;

  @ApiProperty({ description: 'The keyword text', example: 'technology' })
  keyword: string;

  @ApiProperty({ description: 'Whether the keyword is active', example: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-06-19T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Category name',
    example: 'Technology',
    required: false,
  })
  categoryName?: string;

  static fromEntity(keyword: Keyword): KeywordResponseDto {
    const dto = new KeywordResponseDto();
    dto.id = keyword.id;
    dto.userId = keyword.userId;
    dto.categoryId = keyword.categoryId;
    dto.keyword = keyword.keyword;
    dto.isActive = keyword.isActive;
    dto.createdAt = keyword.createdAt;

    if (keyword.category) {
      dto.categoryName = keyword.category.name;
    }

    return dto;
  }

  static fromEntities(keywords: Keyword[]): KeywordResponseDto[] {
    return keywords.map((keyword) => this.fromEntity(keyword));
  }
}
