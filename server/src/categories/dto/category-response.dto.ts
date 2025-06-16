import { ApiProperty } from '@nestjs/swagger';

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
    example: [
      {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Latest technology news',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
  })
  categories: any[];
}
