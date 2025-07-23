import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@/database/entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the category',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Technology',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug of the category',
    example: 'technology',
  })
  slug: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Latest technology news and updates',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the category was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  static fromEntity(category: Category): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.slug = category.slug;
    dto.description = category.description;
    dto.isActive = category.isActive;
    dto.createdAt = category.createdAt;
    return dto;
  }
}

export class CategoryResponse {
  @ApiProperty({
    description: 'Success message for category operation',
    example: 'Category created successfully',
  })
  message: string;
}

export class CategoryListResponse {
  @ApiProperty({
    description: 'List of categories',
    type: [CategoryResponseDto],
  })
  categories: CategoryResponseDto[];
}
