import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from '../../database/entities/keyword.entity';

export class KeywordResponseDto {
  @ApiProperty({ description: 'Keyword ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User ID who owns the keyword', example: 1 })
  user_id: number;

  @ApiProperty({ description: 'Category ID for the keyword', example: 1 })
  category_id: number;

  @ApiProperty({ description: 'The keyword text', example: 'technology' })
  keyword: string;

  @ApiProperty({ description: 'Whether the keyword is active', example: true })
  is_active: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-06-19T10:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Category name',
    example: 'Technology',
    required: false,
  })
  category_name?: string;

  static fromEntity(keyword: Keyword): KeywordResponseDto {
    const dto = new KeywordResponseDto();
    dto.id = keyword.id;
    dto.user_id = keyword.user_id;
    dto.category_id = keyword.category_id;
    dto.keyword = keyword.keyword;
    dto.is_active = keyword.is_active;
    dto.created_at = keyword.created_at;

    if (keyword.category) {
      dto.category_name = keyword.category.name;
    }

    return dto;
  }

  static fromEntities(keywords: Keyword[]): KeywordResponseDto[] {
    return keywords.map((keyword) => this.fromEntity(keyword));
  }
}
