import { ApiProperty } from '@nestjs/swagger';

export class ReadingHistoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the reading history entry',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the user who read the article',
    example: 456,
  })
  userId: number;

  @ApiProperty({
    description: 'ID of the article that was read',
    example: 789,
  })
  articleId: number;

  @ApiProperty({
    description: 'When the article was read',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Article details',
    nullable: true,
  })
  article?: {
    id: number;
    title: string;
    source: string;
    publishedAt: Date;
    categories: Array<{ id: number; name: string }>;
  };

  @ApiProperty({
    description: 'User details (admin only)',
    nullable: true,
  })
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

export class ReadingHistoryListResponseDto {
  @ApiProperty({
    description: 'List of reading history entries',
    type: [ReadingHistoryResponseDto],
  })
  history: ReadingHistoryResponseDto[];

  @ApiProperty({
    description: 'Total number of reading history entries',
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
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages: number;
}
